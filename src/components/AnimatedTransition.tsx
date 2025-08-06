
import React from "react";
import { cn } from "@/lib/utils";

type AnimatedTransitionProps = {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: "fast" | "normal" | "slow";
  animation?: "fade" | "scale" | "slide" | "bounce";
  style?: React.CSSProperties;
};

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  show,
  children,
  className,
  duration = "normal",
  animation = "fade",
  style,
}) => {
  const [render, setRender] = React.useState(show);

  React.useEffect(() => {
    if (show) setRender(true);
    
    // Only stop rendering the component after the animation has completed
    let timer: ReturnType<typeof setTimeout>;
    if (!show) {
      timer = setTimeout(() => {
        setRender(false);
      }, 300); // Match this with the animation duration
    }
    
    return () => clearTimeout(timer);
  }, [show]);

  if (!render) return null;

  // Determine the animation classes
  const animationClasses = {
    fade: show ? "animate-fade-in" : "animate-fade-out",
    scale: show ? "animate-scale-in" : "animate-fade-out",
    slide: show ? "animate-slide-in" : "animate-slide-out",
    bounce: show ? "animate-bounce-in" : "animate-fade-out",
  };

  // Determine duration classes
  const durationClasses = {
    fast: "duration-150",
    normal: "duration-300",
    slow: "duration-500",
  };

  return (
    <div
      style={style}
      className={cn(
        "transform",
        animationClasses[animation],
        durationClasses[duration],
        className
      )}
    >
      {children}
    </div>
  );
};

export default AnimatedTransition;
