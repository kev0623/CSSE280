function decodeMorse(message) {
    let alphabet = {
        "-----":"0", ".----":"1", "..---":"2", "...--":"3", "....-":"4",
        ".....":"5", "-....":"6", "--...":"7", "---..":"8", "----.":"9",
        ".-":"a", "-...":"b", "-.-.":"c", "-..":"d", ".":"e", "..-.":"f",
        "--.":"g", "....":"h", "..":"i", ".---":"j", "-.-":"k", ".-..":"l",
        "--":"m", "-.":"n", "---":"o", ".--.":"p", "--.-":"q", ".-.":"r",
        "...":"s", "-":"t", "..-":"u", "...-":"v", ".--":"w", "-..-":"x",
        "-.--":"y", "--..":"z", "/":" ", "-.-.--":"!", ".-.-.-":".", "--..--":","
    };
    return message.split("//").map(word => 
        word.split("/").map(letter => alphabet[letter]).join("")
    ).join(" ");
}

document.addEventListener('DOMContentLoaded', () => {
    const transmissionElement = document.getElementById('transmission');
    const translationElement = document.getElementById('translation');
    
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const char = button.getAttribute('data-transmits');
            let currentTransmission = transmissionElement.innerText === "Transmission will go here" ? "" : transmissionElement.innerText;
            if (char === 'dot') {
                currentTransmission += '.';
            } else if (char === 'dash') {
                currentTransmission += '-';
            } else if (char === 'letterspace') {
                currentTransmission += '/';
            } else if (char === 'wordspace') {
                currentTransmission += '//';
            }
            transmissionElement.innerText = currentTransmission;
            translationElement.innerText =  decodeMorse(currentTransmission);
        });
    });
});