export interface CaptchaOptions {
  size?: number;
  ignoreChars?: string;
  noise?: number;
  background?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  presetType?:
    | "upper"
    | "lower"
    | "numbers"
    | "letters"
    | "upper-alphanum"
    | "lower-alphanum"
    | "all";
  fontFiles?: string[];
  fontColour?: string;
  noiseColour?: string;
  noiseWidth?: number;
  messy?: boolean;
}

export declare class CaptchaGenerator {
  constructor(options?: CaptchaOptions, fontsFamily?: string[]);
  generate(): Promise<{ key: string; text: string; data: string }>;
  storeCaptcha(
    ttl: number,
    setFn: (key: string, value: string, ttl: number) => Promise<void>
  ): Promise<void>;
  verifyCaptcha(
    userInput: string,
    captchaKey: string,
    getFn: (key: string) => Promise<string | null>
  ): Promise<boolean>;
}

export declare function generateCaptcha(
  options?: CaptchaOptions,
  fontsFamily?: string[]
): Promise<{ key: string; text: string; data: string }>;
