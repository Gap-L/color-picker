# GDP Color Picker

一个支持 React 16.8+ (Hooks) 的功能丰富的调色盘组件。支持色相、饱和度、亮度、透明度调节，提供推荐色板与最近使用记录，并支持高度可配置的 UI 展现。

## 特性

- 🎨 **完整色彩控制**：支持 HSV 拖拽、色相滑块、透明度滑块。
- 🔄 **多格式支持**：支持 Hex、RGB、HSL 格式切换及精确输入。
- 🌈 **智能色板**：
  - **Recommended**：内置精选推荐色板，支持展开/收起（More/Less）。
  - **Recent**：自动记录最近使用的 10 种颜色，方便快速复用。
- 🧪 **取色器支持**：内置 EyeDropper 取色按钮（兼容支持该 API 的浏览器），可直接从屏幕拾取颜色。
- 🛠 **高度可配置**：
  - 可控制是否显示 "Color" 标签及文本内容。
  - 可控制是否显示下拉箭头、外部输入框。
  - 可控制是否显示内部高级颜色面板。
  - 支持自定义预设颜色列表。
- 📦 **零依赖**：核心逻辑自研，不依赖 heavy 的第三方库。
- ⚛️ **React 16.8+**：完全基于 Hooks 编写。

## 安装

```bash
npm install gdp-color-picker
# 或
yarn add gdp-color-picker
```

## 使用方法

### 基础用法

最简单的使用方式，仅需提供 `value` 和 `onChange`。

```jsx
import React, { useState } from "react";
import ColorPicker from "gdp-color-picker";
import "gdp-color-picker/dist/index.css"; // 引入样式

function App() {
  const [color, setColor] = useState("");

  return (
    <ColorPicker
      value={color}
      onChange={(hex, rgbObj) => {
        // rgbObj 包含 {r, g, b, a}
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
  );
}
```

### 高级配置

自定义 UI 显示元素和预设颜色。

```jsx
<ColorPicker
  value={color}
  onChange={handleColorChange}
  // UI 配置
  label="背景色" // 自定义标签文本
  showLabel={true} // 显示标签
  showArrow={true} // 显示下拉箭头
  showInput={true} // 显示外部 Hex 输入框
  showColorBoard={true} // 显示内部高级颜色选择器（色盘+滑块）
  // 自定义预设颜色
  presets={[
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#00FFFF",
    "#FF00FF",
    "#C0C0C0",
    "#808080",
    "#800000",
    "#808000",
    "#008000",
    "#800080",
  ]}
/>
```

### 屏幕取色

组件内置了基于 `EyeDropper` API 的取色按钮，位于弹层中 “Recommended” 标题右侧的小眼睛图标：

- 在支持 `window.EyeDropper` 的浏览器（如 Chrome / Edge 新版）中点击该图标，可在屏幕任意位置拾取颜色。
- 取色完成后，调色板会自动同步到拾取到的颜色并触发 `onChange`。

## API

### ColorPicker Props

| 属性             | 说明                                                          | 类型                                          | 默认值            |
| ---------------- | ------------------------------------------------------------- | --------------------------------------------- | ----------------- |
| `value`          | 当前颜色值，支持 Hex (`#RRGGBB`) 或 RGBA (`rgba(r, g, b, a)`) | `string`                                      | -                 |
| `defaultValue`   | 默认颜色值（非受控模式）                                      | `string`                                      | `#1677ff`         |
| `onChange`       | 颜色变化时的回调                                              | `(hex: string, rgbObj: {r, g, b, a}) => void` | -                 |
| `showLabel`      | 是否显示左侧标签文本                                          | `boolean`                                     | `true`            |
| `label`          | 左侧标签的文本内容                                            | `string`                                      | `"Color"`         |
| `showArrow`      | 是否显示触发器右侧的下拉箭头                                  | `boolean`                                     | `true`            |
| `showInput`      | 是否显示触发器右侧的 Hex 输入框（支持清除）                   | `boolean`                                     | `true`            |
| `showColorBoard` | 是否显示下拉面板内部的高级颜色选择器（色盘、滑块、模式输入）  | `boolean`                                     | `true`            |
| `presets`        | 自定义预设颜色数组。如果不传，将使用内置的 28 色推荐色板。    | `string[]`                                    | `DEFAULT_PRESETS` |

### onChange 回调参数

`onChange(hex, rgbObj)`

1.  **hex**: `string` - 颜色的 Hex 字符串表示（例如 `#ff0000`）。_注意：标准 Hex 格式不包含透明度信息。_
2.  **rgbObj**: `object` - 包含颜色详细信息的对象，推荐使用此对象处理透明度：
    - `r`: `number` (0-255) - 红色通道
    - `g`: `number` (0-255) - 绿色通道
    - `b`: `number` (0-255) - 蓝色通道
    - `a`: `number` (0-1) - Alpha 透明度

## 开发与构建

```bash
# 安装依赖
npm install

# 启动开发服务器（包含演示 Demo）
npm start

# 构建库文件（输出到 dist 目录）
npm run build
```

## License

MIT
