const fs = require("fs");
const { CaptchaGenerator } = require("./index");

// Example usage
(async () => {
    const captchaGen = new CaptchaGenerator({
        fontColour: "#000",
        noiseColour: "#5096ffff",
        ignoreChars: "IOSUViosuvl105",
        noiseWidht: 1
    });

    const captcha = await captchaGen.generate();
    console.log("Captcha text:", captcha.text);
    fs.writeFileSync("captcha.svg", captcha.data);
})();