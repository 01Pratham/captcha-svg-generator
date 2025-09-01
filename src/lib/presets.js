/**
 * Build a character set string based on a preset type.
 *
 * This is used to define the pool of characters that can appear in a CAPTCHA.
 *
 * @param {string} type - The preset type to determine which characters to include.
 *   Accepted values:
 *     - "upper" : Uppercase letters (A-Z)
 *     - "lower" : Lowercase letters (a-z)
 *     - "numbers" : Digits (0-9)
 *     - "letters" : Both uppercase and lowercase letters
 *     - "upper-alphanum" : Uppercase letters + digits
 *     - "lower-alphanum" : Lowercase letters + digits
 *     - "all" : Uppercase + lowercase + digits (default)
 *
 * @returns {string} A string containing all characters for the selected preset.
 *
 * @example
 * import { buildCharPreset } from './presets.mjs';
 * buildCharPreset("upper"); // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
 */
export function buildCharPreset(type) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";

    switch (type) {
        case "upper": return upper;
        case "lower": return lower;
        case "numbers": return numbers;
        case "letters": return upper + lower;
        case "upper-alphanum": return upper + numbers;
        case "lower-alphanum": return lower + numbers;
        case "all":
        default: return upper + lower + numbers;
    }
}
