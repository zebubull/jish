const reset = '\u001b[0m';

const RGB = (val) => {
    return `\u001b[38;5;${val}m`;
}

const Red = (str) => {
    return `\u001b[31m${str}${reset}`;
}

const LightGray = (str) => {
    return `${RGB(239)}${str}${reset}`;
}

const OliveGreen = (str) => {
    return `${RGB(100)}${str}${reset}`;
}

module.exports = {Red, LightGray, OliveGreen, RGB};