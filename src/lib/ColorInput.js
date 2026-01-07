import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  rgbToHex,
  hexToRgb,
  hsvToRgb,
  rgbToHsv,
  rgbToHsl,
  hslToRgb,
} from "./utils/color";

const ColorInput = ({ hue, saturation, value, alpha, onChange }) => {
  const [mode, setMode] = useState("HEX");
  const [localValue, setLocalValue] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getRgb = useCallback(() => hsvToRgb(hue, saturation, value), [
    hue,
    saturation,
    value,
  ]);

  useEffect(() => {
    const rgb = getRgb();
    if (mode === "HEX") {
      setLocalValue({ hex: rgbToHex(rgb.r, rgb.g, rgb.b) });
    } else if (mode === "RGB") {
      setLocalValue({ r: rgb.r, g: rgb.g, b: rgb.b });
    } else if (mode === "HSL") {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setLocalValue({
        h: Math.round(hsl.h),
        s: Math.round(hsl.s * 100),
        l: Math.round(hsl.l * 100),
      });
    }
  }, [hue, saturation, value, mode, getRgb]);

  const handleHexChange = (e) => {
    const val = e.target.value;
    setLocalValue({ ...localValue, hex: val });
    if (/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(val)) {
      const rgb = hexToRgb(val);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        onChange({ ...hsv, a: alpha });
      }
    }
  };

  const handleRgbChange = (key, val) => {
    const newValue = { ...localValue, [key]: val };
    setLocalValue(newValue);
    const r = parseInt(newValue.r, 10);
    const g = parseInt(newValue.g, 10);
    const b = parseInt(newValue.b, 10);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const hsv = rgbToHsv(
        Math.min(255, Math.max(0, r)),
        Math.min(255, Math.max(0, g)),
        Math.min(255, Math.max(0, b))
      );
      onChange({ ...hsv, a: alpha });
    }
  };

  const handleHslChange = (key, val) => {
    const newValue = { ...localValue, [key]: val };
    setLocalValue(newValue);
    const h = parseInt(newValue.h, 10);
    const s = parseInt(newValue.s, 10);
    const l = parseInt(newValue.l, 10);
    if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
      const rgb = hslToRgb(
        Math.min(360, Math.max(0, h)),
        Math.min(100, Math.max(0, s)) / 100,
        Math.min(100, Math.max(0, l)) / 100
      );
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      onChange({ ...hsv, a: alpha });
    }
  };

  return (
    <div className="color-input-container">
      <div
        className="mode-selector"
        ref={dropdownRef}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span>{mode === "HEX" ? "Hex" : mode}</span>
        <span
          className="arrow"
          style={{
            fontSize: "10px",
            marginLeft: "4px",
            transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
            transition: "transform 0.2s",
            color: "#8c8c8c",
          }}
        >
          <svg
            viewBox="0 0 1024 1024"
            width="10"
            height="10"
            fill="currentColor"
          >
            <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z" />
          </svg>
        </span>
        {showDropdown && (
          <div className="mode-dropdown">
            <div
              className="mode-option"
              onClick={(e) => {
                e.stopPropagation();
                setMode("HEX");
                setShowDropdown(false);
              }}
            >
              Hex
            </div>
            <div
              className="mode-option"
              onClick={(e) => {
                e.stopPropagation();
                setMode("RGB");
                setShowDropdown(false);
              }}
            >
              RGB
            </div>
            <div
              className="mode-option"
              onClick={(e) => {
                e.stopPropagation();
                setMode("HSL");
                setShowDropdown(false);
              }}
            >
              HSL
            </div>
          </div>
        )}
      </div>

      <div className="color-input-fields">
        {mode === "HEX" && (
          <div className="hex-input-wrapper">
            <span className="hex-prefix">#</span>
            <input
              className="color-input hex"
              value={localValue.hex ? localValue.hex.replace("#", "").toUpperCase() : ""}
              onChange={handleHexChange}
            />
          </div>
        )}
        {mode === "RGB" && (
          <>
            <input
              className="color-input"
              type="number"
              placeholder="R"
              value={localValue.r !== undefined ? localValue.r : ""}
              onChange={(e) => handleRgbChange("r", e.target.value)}
            />
            <input
              className="color-input"
              type="number"
              placeholder="G"
              value={localValue.g !== undefined ? localValue.g : ""}
              onChange={(e) => handleRgbChange("g", e.target.value)}
            />
            <input
              className="color-input"
              type="number"
              placeholder="B"
              value={localValue.b !== undefined ? localValue.b : ""}
              onChange={(e) => handleRgbChange("b", e.target.value)}
            />
          </>
        )}
        {mode === "HSL" && (
          <>
            <input
              className="color-input"
              type="number"
              placeholder="H"
              value={localValue.h !== undefined ? localValue.h : ""}
              onChange={(e) => handleHslChange("h", e.target.value)}
            />
            <input
              className="color-input"
              type="number"
              placeholder="S"
              value={localValue.s !== undefined ? localValue.s : ""}
              onChange={(e) => handleHslChange("s", e.target.value)}
            />
            <input
              className="color-input"
              type="number"
              placeholder="L"
              value={localValue.l !== undefined ? localValue.l : ""}
              onChange={(e) => handleHslChange("l", e.target.value)}
            />
          </>
        )}
        {/* <div className="color-input alpha-display">
          {Math.round(alpha * 100)}%
        </div> */}
      </div>
    </div>
  );
};

export default ColorInput;
