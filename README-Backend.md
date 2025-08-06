
# Smartphone Chatbot: Backend Setup

This document provides instructions for setting up the Python backend for the smartphone chatbot application, which uses LangChain and Google Gemini API.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Clone this repository or create a new directory for your backend
2. Install required packages:

```bash
pip install langchain langchain_community google-generativeai flask flask-cors pandas faiss-cpu PyPDF2 huggingface_hub sentence_transformers
```

3. Create a file named `app.py` with the Flask server implementation:

```python
import os
import io
import json
import tempfile
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import langchain_helper  # We'll create this file next

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store conversation history
conversation_history = []

# Track uploaded files
files = {
    "csv": None,
    "privacy": None,
    "terms": None,
    "csv_url": None
}

# Store vector store for reuse
vector_store = None

@app.route('/chat', methods=['POST'])
def chat():
    global vector_store
    
    data = request.json
    user_message = data.get('message', '')
    api_key = data.get('api_key', '')
    
    # Check if all files are uploaded
    if not (files["csv"] or files["csv_url"]) or not files["privacy"] or not files["terms"]:
        return jsonify({
            'response': "Please upload all required files (CSV data, Privacy Policy, and Terms & Conditions) before chatting."
        })
    
    # Check API key
    if not api_key:
        return jsonify({
            'response': "Please provide a Google Gemini API key to use the chatbot."
        })
    
    # Add user message to history
    user_message_obj = {
        'id': str(len(conversation_history)),
        'content': user_message,
        'sender': 'user',
        'timestamp': datetime.now().isoformat()
    }
    conversation_history.append(user_message_obj)
    
    try:
        # Initialize vector store if not already done
        if vector_store is None:
            vector_store = langchain_helper.prepare_vector_store(
                files["csv"], 
                files["csv_url"], 
                files["privacy"], 
                files["terms"]
            )
        
        # Get response from LangChain
        bot_response = langchain_helper.get_response(user_message, vector_store, api_key)
        
        # Add bot response to history
        bot_message_obj = {
            'id': str(len(conversation_history)),
            'content': bot_response,
            'sender': 'bot',
            'timestamp': datetime.now().isoformat()
        }
        conversation_history.append(bot_message_obj)
        
        return jsonify({'response': bot_response})
    except Exception as e:
        error_message = f"Error processing your request: {str(e)}"
        print(error_message)
        return jsonify({'response': error_message})

@app.route('/upload', methods=['POST'])
def upload_file():
    global vector_store
    
    file = request.files.get('file')
    file_type = request.form.get('type')
    
    if not file or not file_type:
        return jsonify({'success': False, 'message': 'Missing file or type parameter'})
    
    try:
        # Save the file to a temporary location
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        file.save(temp_file.name)
        
        # Store the file path
        files[file_type] = temp_file.name
        
        # Reset vector store when files change
        vector_store = None
        
        return jsonify({'success': True, 'message': f'{file_type.upper()} file uploaded successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error uploading file: {str(e)}'})

@app.route('/set-csv-url', methods=['POST'])
def set_csv_url():
    global vector_store
    
    data = request.json
    url = data.get('url', '')
    
    if not url:
        return jsonify({'success': False, 'message': 'Missing URL parameter'})
    
    try:
        # Store the URL
        files["csv_url"] = url
        files["csv"] = None  # Clear any previously uploaded CSV file
        
        # Reset vector store when files change
        vector_store = None
        
        return jsonify({'success': True, 'message': 'CSV URL set successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error setting CSV URL: {str(e)}'})

@app.route('/files-status', methods=['GET'])
def files_status():
    return jsonify({
        'csv': bool(files["csv"] or files["csv_url"]),
        'privacy': bool(files["privacy"]),
        'terms': bool(files["terms"])
    })

@app.route('/history', methods=['GET'])
def history():
    return jsonify({'history': conversation_history})

@app.route('/clear-history', methods=['POST'])
def clear_history():
    global conversation_history
    conversation_history = []
    return jsonify({'success': True, 'message': 'Conversation history cleared'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

4. Create a file named `langchain_helper.py` with the LangChain implementation:

```python
import os
import io
import csv
import requests
import pandas as pd
from io import StringIO
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms.base import LLM
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from typing import List, Optional

# ------------------------------------------------------------------------------
# Function to load CSV from URL and convert it to a list of dictionaries
def csv_from_url_to_dict(url: str) -> List[dict]:
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Error fetching the URL: {url}")
    csv_content = response.content.decode('utf-8')
    csv_file = io.StringIO(csv_content)
    data_dict = []
    csv_reader = csv.DictReader(csv_file)
    if not csv_reader.fieldnames:
        raise Exception("CSV file has no fields")
    
    # Check if the CSV is semicolon-separated
    if len(csv_reader.fieldnames) == 1 and ';' in csv_reader.fieldnames[0]:
        keys = csv_reader.fieldnames[0].split(';')
        for row in csv_reader:
            dictionary = {}
            values = list(row.values())[0].split(';')
            for i in range(len(keys)):
                if i < len(values):  # Avoid index errors
                    dictionary[keys[i]] = values[i]
            data_dict.append(dictionary)
    else:
        # Standard CSV processing
        for row in csv_reader:
            data_dict.append(row)
    
    return data_dict

# Helper to convert a list of dictionaries to Document objects
def docs_from_dicts(dict_list: List[dict]) -> List[Document]:
    docs = []
    for item in dict_list:
        content = "\n".join([f"{k}: {v}" for k, v in item.items()])
        docs.append(Document(page_content=content))
    return docs

# ------------------------------------------------------------------------------
# File loading functions for manual uploads
def load_csv_file(file_path) -> List[Document]:
    try:
        df = pd.read_csv(file_path)
        docs = []
        for _, row in df.iterrows():
            text = row.to_string()
            docs.append(Document(page_content=text))
        return docs
    except Exception as e:
        # Try semicolon separator
        try:
            df = pd.read_csv(file_path, sep=';')
            docs = []
            for _, row in df.iterrows():
                text = row.to_string()
                docs.append(Document(page_content=text))
            return docs
        except Exception as e2:
            raise Exception(f"Error reading CSV: {e2}")

def load_text_file(file_path) -> Document:
    try:
        if file_path.lower().endswith(".pdf"):
            try:
                from PyPDF2 import PdfReader
                pdf_reader = PdfReader(file_path)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            except Exception as e:
                text = f"Error reading PDF: {e}"
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        return Document(page_content=text)
    except Exception as e:
        raise Exception(f"Error reading file: {e}")

# ------------------------------------------------------------------------------
# Google Gemini LLM wrapper using the actual API call
class GoogleGemini(LLM):
    api_key: str = ""

    class Config:
        extra = "forbid"
        allow_mutation = True

    def __init__(self, api_key: str, **kwargs):
        # Initialize the parent class (LLM)
        super().__init__(**kwargs)
        # Set the api_key attribute
        object.__setattr__(self, "api_key", api_key)
        # Mark the field as set in the pydantic model
        self.__pydantic_fields_set__ = {"api_key"}

    @property
    def _llm_type(self) -> str:
        return "google_gemini"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            json_response = response.json()
            try:
                result = json_response["candidates"][0]["content"]["parts"][0]["text"]
                return result
            except Exception as e:
                return f"Error parsing response: {e}"
        else:
            return f"API error: {response.status_code} - {response.text}"

    def predict(self, prompt: str, **kwargs) -> str:
        return self._call(prompt, kwargs.get("stop"))

# ------------------------------------------------------------------------------
# Custom prompt template for the chatbot
custom_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "You are a consumer chatbot for our smartphone business. You have access only to the provided smartphone data, privacy policy, and terms & conditions.\n"
        "Only use the provided context to answer questions. If a user asks a question outside these topics, reply: \"I'm sorry, I can only answer queries regarding our products, privacy policy, and terms & conditions.\"\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}\n"
        "Answer:"
    )
)

# ------------------------------------------------------------------------------
# Prepare documents and create vector store
def prepare_vector_store(csv_file, csv_url, privacy_file, terms_file):
    docs = []
    
    # Process CSV data
    if csv_url:
        try:
            dict_list = csv_from_url_to_dict(csv_url)
            docs.extend(docs_from_dicts(dict_list))
        except Exception as e:
            raise Exception(f"Error loading CSV from URL: {e}")
    elif csv_file:
        try:
            docs.extend(load_csv_file(csv_file))
        except Exception as e:
            raise Exception(f"Error loading CSV file: {e}")
    
    # Process privacy policy
    if privacy_file:
        try:
            docs.append(load_text_file(privacy_file))
        except Exception as e:
            raise Exception(f"Error loading privacy policy: {e}")
    
    # Process terms and conditions
    if terms_file:
        try:
            docs.append(load_text_file(terms_file))
        except Exception as e:
            raise Exception(f"Error loading terms and conditions: {e}")
    
    # Split documents
    splitter = CharacterTextSplitter(separator="\n", chunk_size=500, chunk_overlap=100)
    split_docs = []
    for doc in docs:
        split_docs.extend(splitter.split_text(doc.page_content))
    
    # Create vector store
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.from_texts([t for t in split_docs], embeddings)
    
    return vector_store

# ------------------------------------------------------------------------------
# Get response from LangChain
def get_response(user_message, vector_store, api_key):
    # Create LLM
    gemini_llm = GoogleGemini(api_key=api_key)
    
    # Create conversation memory
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )
    
    # Create QA chain
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=gemini_llm,
        retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
        memory=memory,
        combine_docs_chain_kwargs={"prompt": custom_prompt}
    )
    
    # Get response
    try:
        result = qa_chain({"question": user_message})
        return result["answer"]
    except Exception as e:
        return f"Error getting response: {str(e)}"
```

## Running the Backend

1. Save both files (`app.py` and `langchain_helper.py`) in the same directory
2. Start the Flask server:

```bash
python app.py
```

The server will run on `http://localhost:5000`.

## Connecting to the Frontend

Make sure the frontend is configured to communicate with this backend by setting the environment variable `VITE_API_URL` to the backend URL:

```
VITE_API_URL=http://localhost:5000
```

## API Endpoints

- `/chat` (POST): Send a message to the chatbot
- `/upload` (POST): Upload a file (CSV, Privacy Policy, Terms & Conditions)
- `/set-csv-url` (POST): Set a URL for CSV data
- `/files-status` (GET): Check the status of uploaded files
- `/history` (GET): Get conversation history
- `/clear-history` (POST): Clear conversation history

## File Requirements

The chatbot requires three types of files:
1. CSV data with smartphone information (either uploaded or via URL)
2. Privacy Policy document (PDF or TXT)
3. Terms & Conditions document (PDF or TXT)

## API Key

The chatbot uses Google's Gemini API. You'll need to:
1. Get an API key from https://aistudio.google.com/app/apikey
2. Enter this key in the frontend interface

## Troubleshooting

- If you encounter CORS issues, make sure the Flask server has CORS enabled
- Check that all required Python packages are installed
- Verify that file paths and URLs are correct
- Monitor the Flask server console for error messages
