import { randomInt } from "./random.js";

/**
 * Generate a random RGB color string.
 *
 * @returns {string} Random RGB color in the format `rgb(r,g,b)`
 *
 * @example
 * import { randomColor } from './colors.mjs';
 * const color = randomColor(); // e.g., "rgb(123,45,67)"
 */
export function randomColor() {
    return `rgb(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)})`;
}
