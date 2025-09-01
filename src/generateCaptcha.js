import { CaptchaGenerator } from "./CaptchaGenerator.js";

/**
 * Simple wrapper for generating a CAPTCHA with default options.
 *
 * @param {import("./CaptchaGenerator.mjs").CaptchaOptions} [options={}] - Captcha configuration options
 * @param {string[]} [fontsFamily=[]] - Array of font file paths to use
 * @returns {Promise<{ key: string, text: string, data: string }>} - Captcha object containing key, text, and SVG data
 *
 * @example
 * import { generateCaptcha } from "./generateCaptcha.mjs";
 * const captcha = await generateCaptcha({ size: 5 });
 */
export const generateCaptcha = async function (options = {}, fontsFamily = []) {
  const captchaGen = new CaptchaGenerator(options, fontsFamily);
  return captchaGen.generate();
};
