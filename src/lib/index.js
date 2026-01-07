import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import ColorBoard from "./ColorBoard";
import {
  HueSlider,
  // AlphaSlider
} from "./Sliders";
import ColorInput from "./ColorInput";
import {
  hsvToRgb,
  rgbToHex,
  parseColor,
  hexToRgb,
  rgbToHsv,
} from "./utils/color";
import "./index.css";

const DEFAULT_PRESETS = [
  "#E0B5AE",
  "#B2BBDE",
  "#F2DDB3",
  "#E0E5C5",
  "#BBD0C3",
  "#B5D1E3",
  "#FFFFFF",
  "#D25536",
  "#EFA154",
  "#F7DA7E",
  "#5FA67F",
  "#A2829D",
  "#D390A2",
  "#000000",
  "#0099A4",
  "#EABA00",
  "#C9462C",
  "#3171AC",
  "#783780",
  "#1E80EA",
  "#2AAC3B",
  "#B63455",
  "#81532F",
  "#AA9A5C",
  "#828281",
  "#055753",
  "#8F262B",
  "#F0D8D0",
];

const ColorPicker = ({
  value,
  defaultValue,
  onChange,
  showLabel = true,
  label = "Color",
  showArrow = true,
  showInput = true,
  showColorBoard = true,
  presets: customPresets,
  tooltipText = "Color Palette",
  placeholderText = "Please input color",
  screenPickerTooltip = "Color Picker",
  recommendedTitle = "Recommended",
  recentTitle = "Recent",
  moreText = "More",
  lessText = "Less",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentColors, setRecentColors] = useState([]);
  const presets = customPresets || DEFAULT_PRESETS;

  const [color, setColor] = useState(() => {
    if (value === "") return parseColor("#FFFFFF");
    const initColor = value || defaultValue || "";
    return parseColor(initColor);
  });

  const [inputValue, setInputValue] = useState(() => {
    if (value === "") return "";
    const rgb = hsvToRgb(color.h, color.s, color.v);
    return rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase();
  });

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState({});

  useEffect(() => {
    if (value === "") {
      setInputValue("");
      setColor(parseColor("#FFFFFF"));
    } else if (value !== undefined) {
      const newColor = parseColor(value);
      setColor(newColor);
      const rgb = hsvToRgb(newColor.h, newColor.s, newColor.v);
      setInputValue(rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase());
    }
  }, [value]);

  const handleChange = (newColor) => {
    const nextColor = { ...color, ...newColor };
    setColor(nextColor);

    const rgb = hsvToRgb(nextColor.h, nextColor.s, nextColor.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase();
    setInputValue(hex);

    if (onChange) {
      onChange(hex, { ...rgb, a: nextColor.a });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(val)) {
      const rgb = hexToRgb(val);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        handleChange({ ...hsv, a: color.a });
      }
    }
  };

  useLayoutEffect(() => {
    if (
      !isOpen ||
      !triggerRef.current ||
      !panelRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }

    const updatePosition = () => {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const panelRect = panelRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = triggerRect.bottom + window.scrollY + 4;
      let left = triggerRect.left + window.scrollX + 18;

      const spaceBelow = viewportHeight - triggerRect.bottom - 4;
      const spaceAbove = triggerRect.top - 4;
      const panelHeight = panelRect.height;

      // 垂直方向边界检测
      if (spaceBelow < panelHeight) {
        // 如果下方空间不足
        // 1. 如果上方空间足够，显示在上方
        // 2. 如果上方空间也不足，但上方空间比下方大，也显示在上方
        if (spaceAbove >= panelHeight || spaceAbove > spaceBelow) {
          top = triggerRect.top + window.scrollY - panelHeight - 4;
          // 如果上方也放不下，强制贴顶（可能会遮挡 trigger，但保证在视口内）
          if (top < window.scrollY) {
            top = window.scrollY + 4;
          }
        } else {
          // 否则保持在下方，但如果下方空间不足以完全显示，尝试向上调整使其贴底
          if (top + panelHeight > window.scrollY + viewportHeight) {
            top = window.scrollY + viewportHeight - panelHeight - 10;
          }
        }
      } else {
        // 下方空间足够，但也要防止意外超出（双重保险）
        if (top + panelHeight > window.scrollY + viewportHeight) {
          top = window.scrollY + viewportHeight - panelHeight - 10;
        }
      }

      // 水平方向边界检测
      if (triggerRect.left + 16 + panelRect.width > viewportWidth) {
        left = window.scrollX + viewportWidth - panelRect.width - 10;
      }
      if (left < 0) left = 0;

      setPanelStyle({
        position: "absolute",
        top,
        left,
        zIndex: 9999,
      });
    };

    updatePosition();

    // 监听滚动和 resizing 以实时调整位置
    // 使用 capture: true 可以捕获所有滚动事件（包括内部容器的滚动）
    window.addEventListener("scroll", updatePosition, { capture: true });
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, { capture: true });
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, isExpanded, recentColors.length]);

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) {
      alert("当前浏览器不支持屏幕取色功能");
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const { sRGBHex } = result;
      const rgb = hexToRgb(sRGBHex);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        handleChange({ ...hsv, a: 1 });
      }
    } catch (e) {
      // 用户取消取色或发生错误
      console.log("EyeDropper failed or canceled:", e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const containerEl = containerRef.current;
      const panelEl = panelRef.current;

      const isInContainer = containerEl && containerEl.contains(event.target);
      const isInPanel = panelEl && panelEl.contains(event.target);

      if (!isInContainer && !isInPanel) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      const rgb = hsvToRgb(color.h, color.s, color.v);
      const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase();
      setRecentColors((prev) => {
        if (prev.includes(currentHex)) return prev;
        return [currentHex, ...prev].slice(0, 7);
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, color]);

  const rgb = hsvToRgb(color.h, color.s, color.v);
  const displayColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${color.a})`;
  const initialLimit = 14;
  const visiblePresets = isExpanded ? presets : presets.slice(0, initialLimit);
  const showExpand = presets.length > initialLimit;

  const panel = isOpen ? (
    <div className="color-picker-panel" style={panelStyle} ref={panelRef}>
      {showColorBoard && (
        <div
          className="color-picker-board-wrapper"
          style={{
            marginTop: "10px",
            borderTop: "1px solid #eee",
          }}
        >
          <ColorBoard
            hue={color.h}
            saturation={color.s}
            value={color.v}
            onChange={(s, v) => handleChange({ s, v })}
            onComplete={() => setIsOpen(false)}
          />
          <HueSlider hue={color.h} onChange={(h) => handleChange({ h })} />
          {/* <AlphaSlider
            alpha={color.a}
            color={rgb}
            onChange={(a) => handleChange({ a })}
          /> */}
          <ColorInput
            hue={color.h}
            saturation={color.s}
            value={color.v}
            alpha={color.a}
            onChange={(newHsv) => handleChange(newHsv)}
          />
        </div>
      )}
      <div className="color-picker-presets">
        <div className="palette-section-title" style={{ marginTop: 8 }}>
          <span>{recommendedTitle}</span>
          <span className="color-picker-icon-right" onClick={handleEyeDropper}>
            <span className="tooltip-text-bubble">{screenPickerTooltip}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <rect id="path-1" x="0" y="0" width="16" height="16" />
              </defs>
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-920.000000, -594.000000)">
                  <g transform="translate(720.000000, 418.000000)">
                    <g transform="translate(200.000000, 176.000000)">
                      <mask id="mask-2" fill="white">
                        <use xlinkHref="#path-1" />
                      </mask>
                      <g />
                      <g
                        mask="url(#mask-2)"
                        fill="#000000"
                        fillOpacity="0.85"
                        fillRule="nonzero"
                      >
                        <g transform="translate(8.106532, 8.106532) rotate(-315.000000) translate(-8.106532, -8.106532) translate(-0.266667, -0.266667)">
                          <path
                            d="M5.67238576,2.96585378 L6.99478644,4.28811977 L7.03978941,4.24867364 C7.66833128,3.72977631 8.60030981,3.76436946 9.18839345,4.3524531 L9.94264069,5.10670034 C10.1509203,5.31497996 10.1509203,5.65266795 9.94264069,5.86094757 L9.18778644,6.61411977 L13.7138769,11.1406782 C14.4428555,11.8696569 14.4428555,13.0515648 13.7138769,13.7805435 C12.9848982,14.5095222 11.8029902,14.5095222 11.0740115,13.7805435 L6.54778644,9.25411977 L5.7942809,10.0093074 C5.58600128,10.217587 5.24831329,10.217587 5.04003367,10.0093074 L4.28578644,9.25506012 C3.66094757,8.63022125 3.66094757,7.61715729 4.28578644,6.99231842 L4.35178644,6.92511977 L3.03252045,5.6057191 C2.30354177,4.87674042 2.30354177,3.69483246 3.03252045,2.96585378 C3.76149912,2.2368751 4.94340708,2.2368751 5.67238576,2.96585378 Z M8.43414622,7.36944204 L7.86778644,7.93411977 L7.30277537,8.50081289 L11.8282588,13.0262963 C12.1295204,13.3275579 12.6112769,13.3383172 12.925431,13.0585743 L12.9596296,13.0262963 C13.2720491,12.7138769 13.2720491,12.2073449 12.9596296,11.8949254 L8.43414622,7.36944204 Z M7.70907857,5.07958956 L7.67989899,5.10670034 L5.04003367,7.74656565 C4.83175405,7.95484528 4.83175405,8.29253326 5.04003367,8.50081289 L5.41715729,8.8779365 L8.81126984,5.48382395 L8.43414622,5.10670034 C8.23533385,4.90788797 7.91861014,4.89885105 7.70907857,5.07958956 Z M3.82096628,3.68782298 L3.78676768,3.72010101 C3.47434825,4.03252045 3.47434825,4.53905243 3.78676768,4.85147186 L5.10670034,6.17140452 L6.23807119,5.04003367 L4.91813853,3.72010101 C4.61687693,3.41883942 4.13512038,3.40808007 3.82096628,3.68782298 Z"
                            transform="translate(8.373199, 8.373199) rotate(-315.000000) translate(-8.373199, -8.373199)"
                          />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </span>
        </div>
        <div className={`presets-grid modern`}>
          {presets.map((preset, idx) => (
            <div
              key={idx}
              className="preset-item preset-item-inner"
              style={{ backgroundColor: preset }}
              onClick={() => {
                const rgbValue = hexToRgb(preset);
                if (rgbValue) {
                  const hsv = rgbToHsv(rgbValue.r, rgbValue.g, rgbValue.b);
                  handleChange({ ...hsv, a: 1 });
                  setIsOpen(false);
                }
              }}
              title={preset}
            />
          ))}
        </div>
        {/* {showExpand && (
          <div
            className="presets-collapse"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? lessText : moreText}
            <span className={`collapse-arrow ${isExpanded ? "expanded" : ""}`}>
              ▼
            </span>
          </div>
        )} */}

        {recentColors.length > 0 && (
          <>
            <div className="palette-section-title">{recentTitle}</div>
            <div className="presets-grid recent">
              {recentColors.map((recentColor, idx) => (
                <div
                  key={idx}
                  className="preset-item preset-item-inner"
                  style={{ backgroundColor: recentColor }}
                  onClick={() => {
                    const rgbValue = hexToRgb(recentColor);
                    if (rgbValue) {
                      const hsv = rgbToHsv(rgbValue.r, rgbValue.g, rgbValue.b);
                      handleChange({ ...hsv, a: 1 });
                      setIsOpen(false);
                    }
                  }}
                  title={recentColor}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="color-picker-container" ref={containerRef}>
      <div className="color-picker-main-row">
        <div className="color-picker-tooltip-trigger">
          {showLabel && <span className="color-picker-label">{label}</span>}

          <div
            className={`color-picker-trigger ${isOpen ? "is-open" : ""}`}
            onClick={() => setIsOpen(!isOpen)}
            ref={triggerRef}
          >
            <div
              className="color-block"
              style={{ backgroundColor: displayColor }}
            />
            {showArrow && (
              <span className={`color-picker-arrow ${isOpen ? "open" : ""}`}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      transform="translate(-1348.000000, -88.000000)"
                      fillRule="nonzero"
                    >
                      <g transform="translate(0.000000, 60.000000)">
                        <g transform="translate(584.000000, 20.000000)">
                          <g transform="translate(728.000000, 4.000000)">
                            <g transform="translate(44.000000, 12.000000) rotate(-360.000000) translate(-44.000000, -12.000000) translate(36.000000, 4.000000)">
                              <rect
                                fill="#000000"
                                opacity="0"
                                x="0"
                                y="0"
                                width="16"
                                height="16"
                              />
                              <path
                                d="M13.0750341,5.34788541 C12.9440655,5.21691678 12.7257845,5.21691678 12.5948158,5.34788541 L8.01091405,9.93178717 L3.40518417,5.34788541 C3.27421555,5.21691678 3.05593452,5.21691678 2.92496589,5.34788541 C2.79399727,5.47885403 2.79399727,5.69713506 2.92496589,5.82810369 L7.77080491,10.6521146 C7.90177353,10.7830832 8.12005456,10.7830832 8.25102319,10.6521146 L13.0750341,5.82810369 C13.2060027,5.69713506 13.2060027,5.47885403 13.0750341,5.34788541 Z"
                                stroke="#FFFFFF"
                              />
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
              </span>
            )}
            <span className="tooltip-text">{tooltipText}</span>
          </div>
        </div>

        {showInput && (
          <div className="color-picker-input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholderText}
            />
            {inputValue && (
              <span
                className="input-clear-icon"
                onClick={() => setInputValue("")}
              >
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAA8klEQVQ4T51SwVHDQAzcdQOETugAqISkg/Cw9CRf2Q+gAkwlJB1QimnAYnRz57m55AG5l2+9K632RFw44zg+ALiPX+5+FJFTS2MNmNme5AuATUOcARxE5L3gq9DMJpJPlxxU2CQiu7gnYe70mq19tgXcfcXc/VlV34pwJnkTBFXdDsOwBfCRO+1EZKoczSJyywjC3b8qO4mYxai+SyGQfKSZHXIg9XhJHEDTPXHC7vXCq63mVP8cjrv/qOrm7DkAxGyRan1qLM3/rwUoz7UuQCkdixCrFW9atwt7JPcl6TNhIUdgy7Lcxb3ruu++74/tKv4CNXed5xhXezYAAAAASUVORK5CYII="
                  alt=""
                  width="12"
                  height="12"
                />
              </span>
            )}
          </div>
        )}
      </div>

      {typeof document !== "undefined" &&
        ReactDOM.createPortal(panel, document.body)}

      <div>
        <div className={`presets-grid modern`}>
          {visiblePresets.map((preset, idx) => (
            <div
              key={idx}
              className="preset-item"
              style={{ backgroundColor: preset }}
              onClick={() => {
                const rgb = hexToRgb(preset);
                if (rgb) {
                  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                  handleChange({ ...hsv, a: 1 });
                }
              }}
              title={preset}
            />
          ))}
        </div>
        {showExpand && (
          <div
            className="presets-collapse"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? lessText : moreText}
            <span className={`collapse-arrow ${isExpanded ? "expanded" : ""}`}>
              ▼
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
