import fs from "fs";
import { CaptchaGenerator } from "./index.js";
import { exit } from "process";

/**
 * Simple in-memory store for demonstration
 */
const memoryStore = new Map();

/**
 * Async wrapper for setting a value with TTL
 */
async function setFn(key, value, ttlSeconds) {
  memoryStore.set(key, value);
  setTimeout(() => memoryStore.delete(key), ttlSeconds * 1000);
}

/**
 * Async wrapper for getting a value
 */
async function getFn(key) {
  return memoryStore.get(key) || null;
}

(async () => {
  try {
    // Create a new CaptchaGenerator instance
    const captchaGen = new CaptchaGenerator({
      size: 6,
      width: 200,
      height: 70,
      presetType: "all",
      fontColour: "black",
      // messy: false,
      noiseColour: "red",
    });

    // Generate a CAPTCHA
    const captcha = await captchaGen.generate();
    console.log("Generated CAPTCHA:", captcha);

    // Save the SVG file
    fs.writeFileSync("captcha.svg", captcha.data);
    console.log("Sample CAPTCHA saved to captcha.svg");

    // Store the captcha in memory (TTL = 60 seconds)
    await captchaGen.storeCaptcha(60, setFn);
    console.log("Captcha stored in memory with TTL 60 seconds.");
    // Verify the captcha (simulate user input)
    const userInput = captcha.text;
    const isValid = await captchaGen.verifyCaptcha(userInput, captcha.key, getFn);
    console.log("Verification result (should be true):", isValid);
    // Verify wrong input
    const isWrong = await captchaGen.verifyCaptcha("WRONG", captcha.key, getFn);
    console.log("Verification with wrong input (should be false):", isWrong);
    console.log(memoryStore)
    exit()
  } catch (err) {
    console.error(err);
  }
})();
