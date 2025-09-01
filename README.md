# Captcha SVG Generator

A lightweight, customizable Node.js library for generating **SVG-based CAPTCHA images** with random characters, fonts, and noise. Ideal for **Node.js**, **Express.js**, or any project requiring secure human verification. This library uses the `opentype.js` library to render text with custom fonts and supports advanced features like caching, verification, and customizable character sets.

---

## 🚀 Features

- Generate SVG CAPTCHAs with random text, fonts, and wavy noise lines.
- Support for custom fonts (`.ttf` or `.otf`) via `opentype.js`.
- Configurable character sets (uppercase, lowercase, numbers, or combinations).
- Customizable appearance (size, colors, noise, rotation, etc.).
- Built-in methods for storing and verifying CAPTCHAs with a cache.
- Asynchronous API for seamless integration with modern JavaScript.
- Lightweight and dependency-efficient, suitable for server-side and client-side use.

---

## 📦 Installation

Install the library via npm:

```bash
npm install captcha-svg-generator opentype.js
```

> **Note**: The `opentype.js` dependency is required for font rendering.

---

## 🎨 Quick Start

### Basic Usage

Use the `generateCaptcha` function to create a CAPTCHA:

```js
const { generateCaptcha } = require("captcha-svg-generator");

(async () => {
  const captcha = await generateCaptcha();
  console.log("Captcha Key:", captcha.key); // Unique key for verification
  console.log("Captcha Text:", captcha.text); // The correct answer
  console.log("Captcha SVG:", captcha.data); // Raw SVG string
})();
```

### Express.js Integration

Integrate with an Express.js server to serve CAPTCHAs and verify user input:

```js
const express = require("express");
const session = require("express-session");
const { generateCaptcha } = require("captcha-svg-generator");

const app = express();

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Serve CAPTCHA image
app.get("/captcha", async (req, res) => {
  const captcha = await generateCaptcha({ width: 200, height: 70, size: 6 });
  req.session.captchaKey = captcha.key; // Store key for verification
  req.session.captchaText = captcha.text; // Store text for verification
  res.type("image/svg+xml");
  res.send(captcha.data);
});

// Verify CAPTCHA
app.get("/verify/:input", (req, res) => {
  if (req.session.captchaText && req.params.input === req.session.captchaText) {
    res.send("✅ Captcha Verified!");
  } else {
    res.send("❌ Invalid Captcha.");
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
```

Visit `http://localhost:3000/captcha` to view the CAPTCHA image.

---

## ⚙️ Configuration Options

The `CaptchaGenerator` class and `generateCaptcha` function accept an options object to customize CAPTCHA generation:

| Option         | Type        | Default                                                          | Description                                                                 |
|----------------|-------------|------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `size`         | `number`    | `6`                                                              | Number of characters in the CAPTCHA.                                        |
| `ignoreChars`  | `string`    | `""`                                                             | Characters to exclude (e.g., `"0oO1Il"`) to avoid confusion.                |
| `noise`        | `number`    | `2`                                                              | Number of wavy noise lines for visual distortion.                           |
| `background`   | `string`    | `"#ffffff"`                                                    | Background color (any valid SVG color, e.g., `#fff`, `rgb(255,255,255)`).   |
| `width`        | `number`    | `150`                                                            | Width of the CAPTCHA image in pixels.                                       |
| `height`       | `number`    | `50`                                                             | Height of the CAPTCHA image in pixels.                                      |
| `fontSize`     | `number`    | `36`                                                             | Font size of the CAPTCHA characters.                                        |
| `presetType`   | `string`    | `"all"`                                                          | Character set: `"upper"`, `"lower"`, `"numbers"`, `"letters"`, `"upper-alphanum"`, `"lower-alphanum"`, or `"all"`. |
| `fontFiles`    | `string[]`  | `["LinuxLibertine-RdWo.ttf"]`                                    | Array of paths to custom font files (`.ttf` or `.otf`).                     |
| `fontColour`   | `string`    | `random`                                                         | Text color (any valid SVG color or `random` for random RGB).                |
| `noiseColour`  | `string`    | `random`                                                         | Noise line color (any valid SVG color or `random` for random RGB).          |
| `noiseWidth`   | `number`    | `2`                                                              | Stroke width of noise lines.                                               |
| `messy`        | `boolean`   | `true`                                                           | If `true`, randomly rotates characters for added complexity.                |

---

## 🛠️ API Reference

### `CaptchaGenerator` Class

The core class for generating and managing CAPTCHAs.

#### Constructor

```js
const captchaGen = new CaptchaGenerator(options, fontsFamily);
```

- `options`: Configuration object (see table above).
- `fontsFamily`: Array of custom font file paths (optional).

**Example**:

```js
const { CaptchaGenerator } = require("captcha-svg-generator");

const captchaGen = new CaptchaGenerator(
  { size: 8, presetType: "upper", messy: false },
  [__dirname + "/fonts/CustomFont.ttf"]
);
```

#### `generate()`

Generates a CAPTCHA and returns its key, text, and SVG data.

```js
const result = await captchaGen.generate();
console.log(result);
// {
//   key: "captcha:abc123",
//   text: "KX9P2M",
//   data: "<svg>...</svg>"
// }
```

#### `storeCaptcha(ttl, setFn)`

Stores the CAPTCHA key and text in a cache for later verification.

- `ttl`: Expiry time in seconds.
- `setFn`: A function that stores key-value pairs with TTL (e.g., Redis `set`).

**Example** (using an in-memory cache):

```js
const cache = new Map();

const setFn = async (key, value, ttl) => {
  cache.set(key, value);
  setTimeout(() => cache.delete(key), ttl * 1000);
};

const captchaGen = new CaptchaGenerator();
const captcha = await captchaGen.generate();
await captchaGen.storeCaptcha(300, setFn); // Store for 5 minutes
```

#### `verifyCaptcha(userInput, captchaKey, getFn)`

Verifies user input against the stored CAPTCHA text.

- `userInput`: The user's input string.
- `captchaKey`: The CAPTCHA key returned during generation.
- `getFn`: A function to fetch the stored value by key (e.g., Redis `get`).

**Example** (using an in-memory cache):

```js
const cache = new Map();
const getFn = async (key) => cache.get(key);

const captchaGen = new CaptchaGenerator();
const captcha = await captchaGen.generate();
await captchaGen.storeCaptcha(300, async (key, value) => cache.set(key, value));

const isValid = await captchaGen.verifyCaptcha("KX9P2M", captcha.key, getFn);
console.log(isValid); // true
```

#### `buildCharPreset(type)`

Builds a character set based on the specified preset type.

**Example**:

```js
const captchaGen = new CaptchaGenerator({ presetType: "numbers" });
console.log(captchaGen.buildCharPreset("numbers")); // "0123456789"
```

#### `generateWavyNoise(count)`

Generates SVG markup for wavy noise lines (internal method, exposed for customization).

**Example**:

```js
const captchaGen = new CaptchaGenerator({ noise: 3, noiseColour: "blue" });
console.log(captchaGen.generateWavyNoise(3)); // SVG paths for 3 blue noise lines
```

#### Static Methods

- `CaptchaGenerator.generateKey()`: Generates a unique CAPTCHA key.

```js
const key = CaptchaGenerator.generateKey();
console.log(key); // "captcha:abc123def456"
```

- `CaptchaGenerator.randomInt(min, max)`: Generates a random integer.

```js
const num = CaptchaGenerator.randomInt(1, 10);
console.log(num); // e.g., 7
```

- `CaptchaGenerator.randomColor()`: Generates a random RGB color.

```js
const color = CaptchaGenerator.randomColor();
console.log(color); // e.g., "rgb(123,45,67)"
```

### `generateCaptcha` Function

A convenience wrapper for quick CAPTCHA generation.

```js
const captcha = await generateCaptcha(options, fontsFamily);
```

**Example**:

```js
const captcha = await generateCaptcha(
  { size: 5, presetType: "lower", fontColour: "black" },
  [__dirname + "/fonts/CustomFont.ttf"]
);
console.log(captcha.text); // e.g., "kxpzm"
```

---

## 🎯 Examples

### 1. Custom Colors and Character Set

Generate a CAPTCHA with specific colors and only uppercase letters:

```js
const { generateCaptcha } = require("captcha-svg-generator");

(async () => {
  const captcha = await generateCaptcha({
    size: 5,
    presetType: "upper",
    fontColour: "black",
    noiseColour: "red",
    background: "#f0f0f0",
  });
  console.log(captcha.text); // e.g., "KXPMZ"
  console.log(captcha.data); // SVG string
})();
```

### 2. Avoid Confusing Characters

Exclude ambiguous characters to improve readability:

```js
const { generateCaptcha } = require("captcha-svg-generator");

(async () => {
  const captcha = await generateCaptcha({
    ignoreChars: "0oO1Il",
    size: 6,
  });
  console.log(captcha.text); // e.g., "KPXMZT" (no 0, O, I, or l)
})();
```

### 3. Custom Fonts

Use multiple custom fonts for varied text rendering:

```js
const { generateCaptcha } = require("captcha-svg-generator");

(async () => {
  const captcha = await generateCaptcha(
    { size: 4 },
    [
      __dirname + "/fonts/CustomFont1.ttf",
      __dirname + "/fonts/CustomFont2.ttf",
    ]
  );
  console.log(captcha.data); // SVG with mixed fonts
})();
```

### 4. Large CAPTCHA with More Noise

Create a larger CAPTCHA with increased noise:

```js
const { generateCaptcha } = require("captcha-svg-generator");

(async () => {
  const captcha = await generateCaptcha({
    size: 8,
    noise: 5,
    width: 300,
    height: 100,
    fontSize: 48,
  });
  console.log(captcha.text); // e.g., "KPXMZ123"
})();
```

### 5. Caching and Verification

Use a Redis-like cache for CAPTCHA verification:

```js
const { CaptchaGenerator } = require("captcha-svg-generator");

// Mock Redis client
const cache = {
  set: async (key, value, ttl) => {
    // Simulate Redis SETEX
    console.log(`Stored ${key}: ${value} for ${ttl}s`);
  },
  get: async (key) => {
    // Simulate Redis GET
    return "KXPMZ"; // Mock stored value
  },
};

(async () => {
  const captchaGen = new CaptchaGenerator({ size: 5 });
  const captcha = await captchaGen.generate();
  await captchaGen.storeCaptcha(300, cache.set); // Store for 5 minutes
  const isValid = await captchaGen.verifyCaptcha("KXPMZ", captcha.key, cache.get);
  console.log(isValid); // true
})();
```

---

## 🛠️ Development

Clone the repository and test locally:

```bash
git clone https://github.com/01Pratham/captcha-svg-generator.git
cd captcha-svg-generator
npm install
node test.js
```

### Dependencies

- `opentype.js`: For font rendering.
- `crypto`: Built-in Node.js module for generating unique keys.

### Testing

Create a `test.js` file to experiment:

```js
const { generateCaptcha } = require("./index");

(async () => {
  const captcha = await generateCaptcha({ size: 6, presetType: "numbers" });
  console.log("Key:", captcha.key);
  console.log("Text:", captcha.text);
  console.log("SVG:", captcha.data);
})();
```

Run with:

```bash
node test.js
```

### Generating a Sample SVG

To generate a sample SVG for the README:

```js
const { generateCaptcha } = require("./index");
const fs = require("fs");

(async () => {
  const captcha = await generateCaptcha({
    size: 6,
    width: 200,
    height: 70,
    presetType: "upper",
    fontColour: "black",
    noiseColour: "red",
  });
  fs.writeFileSync("docs/sample-captcha.svg", captcha.data);
  console.log("Sample CAPTCHA saved to docs/sample-captcha.svg");
})();
```
![alt text](captcha.svg)

---

## 📝 Notes

- The library generates SVG images, which are lightweight and scalable but require proper rendering in browsers or clients.
- Ensure custom font files are accessible and compatible with `opentype.js`.
- For production, use a proper cache system (e.g., Redis) with `storeCaptcha` and `verifyCaptcha`.
- The `messy` option adds random character rotation for increased security but may reduce readability.

---

## 📄 License

MIT License © 2025 Prathamesh Chavan