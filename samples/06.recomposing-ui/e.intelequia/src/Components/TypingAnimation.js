import React, { useState, useEffect } from 'react';
import '../MinimizableWebChat.css';
const TypingAnimation = () => {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => (prevDots.length < 3 ? [...prevDots, '.'] : []));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="typing-dots">
      {dots.map((dot, index) => (
        <div className="dot" key={index}></div>
      ))}
    </div>
  );
};

export default TypingAnimation;
