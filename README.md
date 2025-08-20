# captcha-svg-generator

A simple, customizable, and lightweight library to generate **SVG CAPTCHA images** with random characters, fonts, and noise.  
Perfect for use in **Node.js / Express.js** authentication systems, bots, and any project requiring human verification.

---

## 🚀 Installation

```bash
npm install captcha-svg-generator
```

---

## 📦 Basic Usage

```js
const { generateCaptcha } = require("captcha-svg-generator");

(async () => {
  const captcha = await generateCaptcha();

  console.log("Captcha Text:", captcha.text); // The correct captcha answer
  console.log("Captcha SVG:", captcha.data); // The raw SVG string
})();
```

---

## 🎨 Example in Express.js

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

// Generate captcha
app.get("/captcha", async (req, res) => {
  const captcha = await generateCaptcha({ width: 200, height: 70, size: 6 });
  req.session.captcha = captcha.text; // save captcha text in session for validation

  res.type("svg");
  res.send(captcha.data);
});

// Verify captcha
app.get("/verify/:input", (req, res) => {
  if (req.session.captcha && req.params.input === req.session.captcha) {
    res.send("✅ Captcha Verified!");
  } else {
    res.send("❌ Invalid Captcha.");
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
```

Now, open **`http://localhost:3000/captcha`** to see the generated CAPTCHA SVG.

---

## ⚙️ Options

| Option        | Type      | Default                                                          | Description                               |
| ------------- | --------- | ---------------------------------------------------------------- | ----------------------------------------- |
| `size`        | number    | `6`                                                              | Number of characters in captcha           |
| `ignoreChars` | string    | `""`                                                             | Characters to exclude (e.g. `"0oO1Il"`)   |
| `noise`       | number    | `2`                                                              | Number of noise/wavy lines                |
| `background`  | string    | `"#ffffff"`                                                      | Background color                          |
| `width`       | number    | `150`                                                            | Width of captcha image                    |
| `height`      | number    | `50`                                                             | Height of captcha image                   |
| `fontSize`    | number    | `36`                                                             | Font size                                 |
| `charPreset`  | string    | `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789` | Allowed characters                        |
| `fontFiles`   | string\[] | `[LinuxLibertine-RdWo.ttf]`                                      | Array of custom font file paths           |
| `fontColour`  | string    | `random`                                                         | Color of text (default random RGB)        |
| `noiseColour` | string    | `random`                                                         | Color of noise lines (default random RGB) |
| `noiseWidth`  | number    | `2`                                                              | Width of noise lines                      |

---

## 🎯 Examples

### 1. Custom Colors

```js
const captcha = await generateCaptcha({
  fontColour: "rgb(0,0,0)",
  noiseColour: "rgb(255,0,0)",
});
console.log(captcha.data);
```

### 2. Ignore Confusing Characters

```js
const captcha = await generateCaptcha({
  ignoreChars: "0oO1Il",
});
console.log(captcha.text); // Will not include 0, O, I, l
```

### 3. Custom Fonts

```js
const captcha = await generateCaptcha({}, [
  __dirname + "/fonts/CustomFont1.ttf",
  __dirname + "/fonts/CustomFont2.ttf",
]);
```

### 4. Change Size and Noise

```js
const captcha = await generateCaptcha({
  size: 8,
  noise: 5,
  width: 250,
  height: 100,
});
```

---

## 🛠️ Development

Clone the repo and test locally:

```bash
git clone https://github.com/01Pratham/captcha-svg-generator.git
cd captcha-svg-generator
npm install
node test.js
```

---

## 📄 License

MIT License © 2025 \Prathamesh Chavan
