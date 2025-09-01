import opentype from "opentype.js";
import { randomInt } from "./lib/random.js";
import { randomColor } from "./lib/colors.js";
import { buildCharPreset } from "./lib/presets.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

/**
 * CaptchaGenerator
 *
 * Generates customizable SVG CAPTCHAs using OpenType fonts.
 * Supports noise, background colors, random rotations (messy mode),
 * and pluggable storage for verification.
 */
export class CaptchaGenerator {
    /**
     * @typedef {Object} CaptchaOptions
     * @property {number} [size=6] Number of characters in the captcha.
     * @property {string} [ignoreChars=""] Characters to exclude.
     * @property {number} [noise=2] Number of noise lines.
     * @property {string} [background="#ffffff"] Background color.
     * @property {number} [width=150] Image width in px.
     * @property {number} [height=50] Image height in px.
     * @property {number} [fontSize=36] Font size in px.
     * @property {string} [presetType="all"] Character set preset.
     * @property {string[]} [fontFiles] Array of font file paths (.ttf/.otf).
     * @property {string} [fontColour=random] Captcha text color.
     * @property {string} [noiseColour=random] Noise line color.
     * @property {number} [noiseWidth=2] Noise stroke width.
     * @property {boolean} [messy=true] If true, rotate chars randomly.
     */

    /**
     * Creates a new CaptchaGenerator.
     *
     * @param {CaptchaOptions} [options={}] Options for captcha.
     * @param {string[]} [fontsFamily=[]] Array of custom font paths.
     */
    constructor(options = {}, fontsFamily = []) {
        this.__filename = fileURLToPath(import.meta.url);
        this.__dirname = dirname(this.__filename);
        this.defaults = {
            size: 6,
            ignoreChars: "",
            noise: 2,
            background: "#ffffff",
            width: 150,
            height: 50,
            fontSize: 36,
            presetType: "all",
            fontFiles: fontsFamily.length > 0 ? fontsFamily : [join(this.__dirname, "../fonts/LiberationSerif-wlR9.ttf")],
            fontColour: randomColor(),
            noiseColour: randomColor(),
            noiseWidth: 2,
            messy: true,
        };

        this.options = { ...this.defaults, ...options };

        // Final character pool 
        this.chars = buildCharPreset(this.options.presetType)
            .split("")
            .filter((ch) => !this.options.ignoreChars.includes(ch));

        this.captchaKey = null;
        this.captchaText = null;

    }

    /**
     * Generate a random unique captcha key.
     * @returns {string} Unique key string (hex).
     */
    static generateKey(length = 16) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let key = "";
        const now = Date.now().toString(36); // timestamp as base36
        for (let i = 0; i < length; i++) {
            key += chars[randomInt(0, chars.length)];
        }
        return key + now;
    }

    /**
     * Generate a new captcha.
     *
     * @async
     * @returns {Promise<{ key: string, text: string, data: string }>}
     * - `key`: Unique captcha key
     * - `text`: Captcha solution string
     * - `data`: SVG markup
     *
     * @example
     * const gen = new CaptchaGenerator();
     * const { key, text, data } = await gen.generate();
     */
    async generate() {
        const text = Array.from({ length: this.options.size }, () =>
            this.chars[randomInt(0, this.chars.length)]
        ).join("");

        const loadedFonts = await Promise.all(
            this.options.fontFiles.map((file) => opentype.load(file))
        );

        let textSVG = "";
        const y = this.options.height / 2 + this.options.fontSize / 3;

        if (!this.options.messy) {
            const font = loadedFonts[0];
            const glyphs = text.split("").map((ch) => font.charToGlyph(ch));

            // Compute total width of all glyphs at desired font size
            const naturalWidth = glyphs.reduce(
                (sum, g) => sum + g.advanceWidth * (this.options.fontSize / font.unitsPerEm),
                0
            );

            const gap = 3;
            const totalWidth = naturalWidth + gap * (text.length - 1);

            // Scale to fit in box if needed
            const scale = Math.min(1, (this.options.width - 10) / totalWidth);

            // Center starting x
            let x = (this.options.width - totalWidth * scale) / 2;

            for (const glyph of glyphs) {
                const advanceWidth = glyph.advanceWidth * (this.options.fontSize / font.unitsPerEm) * scale;

                const path = glyph.getPath(x, y, this.options.fontSize * scale);
                const d = path.toPathData(2);

                textSVG += `<path d="${d}" fill="${this.options.fontColour}"/>`;
                x += advanceWidth + gap * scale;
            }
        } else {
            // Messy: random rotations

            // Step 1: calculate approximate natural width
            const fontSizes = this.options.fontSize;
            const chars = text.split(""); // <-- Fix here

            // Step 1: calculate approximate natural width
            const glyphWidths = chars.map((ch) => {
                const font = loadedFonts[randomInt(0, loadedFonts.length)];
                return font.charToGlyph(ch).advanceWidth * (this.options.fontSize / font.unitsPerEm);
            });
            const totalWidth = glyphWidths.reduce((sum, w) => sum + w, 0);

            // Step 2: scale down if text is wider than box
            const scale = Math.min(1, this.options.width / totalWidth);

            // Step 3: center the text block
            let xStart = (this.options.width - totalWidth * scale) / 2;

            let x = xStart;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const font = loadedFonts[randomInt(0, loadedFonts.length)];
                const glyph = font.charToGlyph(char);

                const charWidth = glyph.advanceWidth * (fontSizes / font.unitsPerEm) * scale;
                const charX = x + charWidth / 2; // center of char for rotation
                const rotate = randomInt(-25, 25);

                const path = glyph.getPath(x, y, fontSizes * scale);
                const d = path.toPathData(2);

                textSVG += `<path d="${d}" fill="${this.options.fontColour}" transform="rotate(${rotate} ${charX} ${y})"/>`;

                x += charWidth; // move to next character
            }
        }

        const noiseSVG = this.generateWavyNoise(this.options.noise);

        const svg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="${this.options.width}" height="${this.options.height}">
                    <rect width="100%" height="100%" fill="${this.options.background}"/>
                    ${noiseSVG}
                    ${textSVG}
                    </svg>
            `.replace(/\s+/g, ' ').trim();

        this.captchaKey = CaptchaGenerator.generateKey(16);
        this.captchaText = text;

        return { key: this.captchaKey, text, data: svg };
    }

    /**
     * Store the captcha text in a storage backend.
     *
     * @param {number} ttl Expiry time in seconds
     * @param {(key: string, value: string, ttl: number) => Promise<void>} setFn Storage function
     * @returns {Promise<void>}
     */
    async storeCaptcha(ttl, setFn) {
        if (typeof setFn !== "function") throw new Error("setFn must be a function");
        if (!this.captchaKey || !this.captchaText) throw new Error("No captcha generated yet.");
        await setFn(`captcha:${this.captchaKey}`, this.captchaText, ttl);
    }

    /**
     * Verify user input against stored captcha text.
     *
     * @param {string} userInput User's input string
     * @param {string} captchaKey Captcha key
     * @param {(key: string) => Promise<string|null>} getFn Storage fetch function
     * @returns {Promise<boolean>} True if match, false otherwise
     */
    async verifyCaptcha(userInput, captchaKey, getFn) {
        if (typeof getFn !== "function") throw new Error("getFn must be a function");
        const storedValue = await getFn(`captcha:${captchaKey}`);
        return storedValue && storedValue === userInput;
    }

    /**
     * Generate wavy SVG noise lines.
     *
     * @param {number} count Number of noise lines
     * @returns {string} SVG markup of paths
     */
    generateWavyNoise(count) {
        let noiseSVG = "";
        for (let i = 0; i < count; i++) {
            const startY = randomInt(0, this.options.height);

            const segments = randomInt(2, 4);
            let d = `M0 ${startY}`;
            let prevX = 0;

            for (let s = 0; s < segments; s++) {
                const midX = prevX + this.options.width / segments;
                const midY = randomInt(0, this.options.height);
                const endX = midX + this.options.width / segments;
                const endY = randomInt(0, this.options.height);

                d += ` Q ${midX} ${midY}, ${endX} ${endY}`;
                prevX = endX;
            }

            noiseSVG += `<path d="${d}" stroke="${this.options.noiseColour}" fill="none" stroke-width="${this.defaults.noiseWidth}"/>`;
        }
        return noiseSVG;
    }
}