import React, { useRef, useEffect, useState, useCallback } from "react";
import { clamp } from "./utils/color";

const ColorBoard = ({ hue, saturation, value, onChange, onComplete }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const {
        width,
        height,
        left,
        top,
      } = containerRef.current.getBoundingClientRect();
      const x = clamp(e.clientX - left, 0, width);
      const y = clamp(e.clientY - top, 0, height);

      const newSaturation = x / width;
      const newValue = 1 - y / height;

      onChange(newSaturation, newValue);
    },
    [onChange]
  );

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleChange(e);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleChange(e);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleChange, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="color-board"
      style={{
        backgroundColor: `hsl(${hue}, 100%, 50%)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="color-board-white" />
      <div className="color-board-black" />
      <div
        className="color-board-handler"
        style={{
          left: `${saturation * 100}%`,
          top: `${(1 - value) * 100}%`,
        }}
      />
    </div>
  );
};

export default ColorBoard;
