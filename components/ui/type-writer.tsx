"use client"
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export const TypewriterText = ({ text, speed = 50, onComplete, className = "", startDelay = 0 } : {
    text : string;
    onComplete : () => void,
    speed : number;
    className : any;
    startDelay : number
}) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [started, setStarted] = useState(false);
  
    useEffect(() => {
      if (startDelay > 0) {
        const delayTimeout = setTimeout(() => setStarted(true), startDelay);
        return () => clearTimeout(delayTimeout);
      } else {
        setStarted(true);
      }
    }, [startDelay]);
  
    useEffect(() => {
      if (!started) return;
      
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else if (onComplete && currentIndex === text.length) {
        const timeout = setTimeout(onComplete, 500);
        return () => clearTimeout(timeout);
      }
    }, [currentIndex, text, speed, onComplete, started]);
  
    if (!started) return <span className={className}></span>;
  
    return (
      <span className={className}>
        {displayText}
        {currentIndex < text.length && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-0.5 h-5 bg-blue-500 ml-1"
          />
        )}
      </span>
    );
  };