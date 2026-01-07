import React, { useState } from "react";
import ColorPicker from "./lib";

function App() {
  const [color, setColor] = useState("");

  return (
    <div
      style={{
        padding: "50px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#2c3339",
      }}
    >
      <h1>GDP Color Picker Demo</h1>
      <div style={{ marginBottom: "20px" }}>
        <label>Selected Color: </label>
        <strong style={{ color: color }}>{color}</strong>
      </div>

      <ColorPicker
        value={color}
        onChange={(hex, rgbObj) => {
          console.log("Color changed:", hex, rgbObj);
          if (rgbObj.a < 1) {
            setColor(
              `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, ${rgbObj.a.toFixed(
                2
              )})`
            );
          } else {
            setColor(hex);
          }
        }}
      />
    </div>
  );
}

export default App;
