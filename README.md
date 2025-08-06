```markdown
# Business Chatbot Project

## Project Overview

This project is a business-oriented chatbot designed to answer queries based solely on a curated context. Users provide a CSV file containing product data along with a privacy policy and terms & conditions document (in PDF or TXT format). The chatbot processes these documents, builds a searchable context using document embeddings, and generates answers to queries related to the products, privacy policy, and terms & conditions. If a query falls outside these topics, the chatbot politely declines to answer.

## Technologies Used

- **Flask**: A lightweight Python web framework for building the backend API.
- **Streamlit**: For creating an interactive web interface.
- **LangChain**: For managing language model chains and custom prompt templates.
- **FAISS**: For building and querying a vector store of document embeddings.
- **HuggingFace Embeddings**: Provides free text embeddings using the "sentence-transformers/all-MiniLM-L6-v2" model.
- **PyPDF2**: For extracting text from PDF files.
- **Pandas**: For processing CSV data.
- **Other Libraries**: Requests, CSV, io, uuid, etc.

## How to Run the Project

Follow these steps to set up and run the project locally:

1. **Clone the Repository:**

   ```sh
   git clone <YOUR_GIT_URL>
   ```

2. **Navigate to the Project Directory:**

   ```sh
   cd <YOUR_PROJECT_NAME>
   ```

3. **Install Dependencies:**

   Ensure you have Python 3.8 or higher installed. Then, install the required libraries:

   ```sh
   pip install Flask flask-cors pandas requests PyPDF2 langchain faiss-cpu sentence-transformers streamlit
   ```

   Alternatively, if a `requirements.txt` file is provided, run:

   ```sh
   pip install -r requirements.txt
   ```

4. **Run the Application:**

   Start the Flask app by executing:

   ```sh
   python app.py
   ```

   The app will run on port 9000 by default. You can test the API endpoints using a tool like Postman or via your browser.

## Project Functionality

- **File Input:**
  - **CSV Data:** Users can either upload a CSV file containing product information or provide a URL to fetch the CSV data.
  - **Privacy Policy & Terms:** Users upload the privacy policy and terms & conditions documents (in PDF or TXT format). The project supports multiple languages, including Arabic.

- **Document Processing:**
  - Uploaded files are processed into LangChain `Document` objects.
  - The documents are then split into manageable chunks and indexed into a FAISS vector store using HuggingFace embeddings.

- **Chatbot Integration:**
  - A custom prompt template restricts the chatbot’s responses to the provided context. If a query falls outside the provided topics, the chatbot responds with a polite refusal.
  - The chatbot maintains context by keeping a history of the last five interactions, which is included in the prompt to enhance response relevance.
  - The Google Gemini API (wrapped within the project) is used to generate responses based on the context.

## How to Edit the Code

You can edit the project using your preferred IDE:

- **Clone the Repository:**  
  Clone the repository to your local machine.
  
- **Make Changes:**  
  Open the project in your IDE, modify the code as needed, and test locally.
  
- **Deploy Changes:**  
  Once satisfied, push your changes back to the repository. If you're deploying to a production server or cloud platform, follow your standard deployment process.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests for improvements or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE).

---
