import React, { useRef, useState, useEffect, useCallback } from "react";
import { clamp } from "./utils/color";

const Slider = ({ value, max, onChange, className, style, children }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const { width, left } = containerRef.current.getBoundingClientRect();
      const x = clamp(e.clientX - left, 0, width);
      const newValue = (x / width) * max;
      onChange(newValue);
    },
    [max, onChange]
  );

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleChange(e);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
      className={`color-slider ${className || ""}`}
      style={style}
      onMouseDown={handleMouseDown}
    >
      <div
        className="color-slider-handler"
        style={{
          left: `${(value / max) * 100}%`,
        }}
      />
      {children}
    </div>
  );
};

export const HueSlider = ({ hue, onChange }) => {
  return (
    <Slider value={hue} max={360} onChange={onChange} className="hue-slider" />
  );
};

export const AlphaSlider = ({ alpha, color, onChange }) => {
  const { r, g, b } = color;
  return (
    <Slider
      value={alpha}
      max={1}
      onChange={onChange}
      className="alpha-slider-bg"
      style={{
        background: `linear-gradient(to right, rgba(${r},${g},${b},0) 0%, rgba(${r},${g},${b},1) 100%)`,
      }}
    />
  );
};
