/**
 * Generate a random integer between min (inclusive) and max (exclusive).
 *
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 *
 * @example
 * import { randomInt } from './random.mjs';
 * const value = randomInt(0, 10); // 0 <= value < 10
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
