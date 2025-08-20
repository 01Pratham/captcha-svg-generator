const opentype = require("opentype.js");

/**
 * @class CaptchaGenerator
 * A class to generate SVG CAPTCHA images with random characters and noise.
 */
class CaptchaGenerator {
    /**
     * @param {Object} options - Configuration options for the captcha.
     * @param {number} [options.size=6] - Number of characters in captcha.
     * @param {string} [options.ignoreChars=""] - Characters to ignore in the preset.
     * @param {number} [options.noise=2] - Number of noise lines.
     * @param {string} [options.background="#ffffff"] - Background color of captcha.
     * @param {number} [options.width=150] - Width of captcha image.
     * @param {number} [options.height=50] - Height of captcha image.
     * @param {number} [options.fontSize=36] - Font size for captcha text.
     * @param {string} [options.charPreset="A-Z,a-z,0-9"] - Characters to pick from.
     * @param {string[]} [options.fontFiles=[]] - Array of font file paths.
     * @param {string} [options.fontColour=random] - Text color.
     * @param {string} [options.noiseColour=random] - Noise color.
     * @param {number} [options.noiseWidht=2] - Noise color.
     */
    constructor(options = {}, fontsFamily = []) {
        this.defaults = {
            size: 6,
            ignoreChars: "",
            noise: 2,
            background: "#ffffff",
            width: 150,
            height: 50,
            fontSize: 36,
            charPreset: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            fontFiles: fontsFamily.length > 0 ? fontsFamily : [__dirname + "/fonts/LinuxLibertine-RdWo.ttf"],
            fontColour: CaptchaGenerator.randomColor(),
            noiseColour: CaptchaGenerator.randomColor(),
            noiseWidth: 2
        };

        this.options = { ...this.defaults, ...options };

        // Filter character preset
        this.chars = this.options.charPreset
            .split("")
            .filter((ch) => !this.options.ignoreChars.includes(ch));
    }

    /**
     * Generate the captcha.
     * @returns {Promise<{ text: string, data: string }>} Captcha text and SVG data.
     */
    async generate() {
        // Generate random text
        const text = Array.from({ length: this.options.size }, () =>
            this.chars[CaptchaGenerator.randomInt(0, this.chars.length)]
        ).join("");

        // Load fonts
        const loadedFonts = await Promise.all(
            this.options.fontFiles.map((file) => opentype.load(file))
        );

        // Build captcha text SVG
        const charWidth = this.options.width / (this.options.size + 1);
        let textSVG = "";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const x = charWidth * (i + 0.5);
            const y = this.options.height / 2 + this.options.fontSize / 3;
            const rotate = CaptchaGenerator.randomInt(-25, 25);

            // Pick a random font for each char
            const font = loadedFonts[CaptchaGenerator.randomInt(0, loadedFonts.length)];
            const glyph = font.charToGlyph(char);
            const path = glyph.getPath(x, y, this.options.fontSize);
            const d = path.toPathData(2);

            textSVG += `<path d="${d}" fill="${this.options.fontColour}" transform="rotate(${rotate} ${x} ${y})"/>`;
        }

        // Add wavy noise
        const noiseSVG = this.generateWavyNoise(this.options.noise);

        // Final SVG
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${this.options.width}" height="${this.options.height}">
            <rect width="100%" height="100%" fill="${this.options.background}"/>
            ${noiseSVG}
            ${textSVG}
          </svg>
        `;

        return { text, data: svg };
    }

    /**
     * Generate wavy noise paths.
     * @param {number} count - Number of noise lines.
     * @returns {string} SVG path strings.
     */
    generateWavyNoise(count) {
        let noiseSVG = "";
        for (let i = 0; i < count; i++) {
            const startY = CaptchaGenerator.randomInt(0, this.options.height);

            const segments = CaptchaGenerator.randomInt(2, 4);
            let d = `M0 ${startY}`;
            let prevX = 0;

            for (let s = 0; s < segments; s++) {
                const midX = prevX + this.options.width / segments;
                const midY = CaptchaGenerator.randomInt(0, this.options.height);
                const endX = midX + this.options.width / segments;
                const endY = CaptchaGenerator.randomInt(0, this.options.height);

                d += ` Q ${midX} ${midY}, ${endX} ${endY}`;
                prevX = endX;
            }

            noiseSVG += `<path d="${d}" stroke="${this.options.noiseColour}" fill="none" stroke-width="${this.defaults.noiseWidth}"/>`;
        }
        return noiseSVG;
    }

    /**
     * Generate a random integer between min and max.
     * @param {number} min - Minimum value (inclusive).
     * @param {number} max - Maximum value (exclusive).
     * @returns {number} Random integer.
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    /**
     * Generate a random RGB color string.
     * @returns {string} Random color.
     */
    static randomColor() {
        return `rgb(${this.randomInt(0, 255)},${this.randomInt(0, 255)},${this.randomInt(0, 255)})`;
    }
}

/**
 * Generate the captcha.
 * @returns {Promise<{ text: string, data: string }>} Captcha text and SVG data.
*/
const generateCaptcha = async function (options = {}, fontsFamily = []) {
    const captchaGen = new CaptchaGenerator(options, fontsFamily);
    const captcha = await captchaGen.generate();
    return captcha
};

module.exports = {
    generateCaptcha,
    CaptchaGenerator
}
