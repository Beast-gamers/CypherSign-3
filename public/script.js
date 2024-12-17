function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function generatePrime() {
    let prime = Math.floor(Math.random() * 451) + 50;
    while (!isPrime(prime)) {
        prime = Math.floor(Math.random() * 451) + 50;
    }
    return prime;
}

function gcd(a, b) {
    if (b === 0) return a;
    return gcd(b, a % b);
}

function modInverse(e, phi) {
    let d = 0;
    for (let i = 1; i < phi; i++) {
        if ((e * i) % phi === 1) {
            d = i;
            break;
        }
    }
    return d;
}

function powMod(base, exponent, modulus) {
    let result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        exponent = Math.floor(exponent / 2);
        base = (base * base) % modulus;
    }
    return result;
}

function formatInput(input) {
    return input.split('').map(char => {
        if (char === ' ') {
            return ' , ';
        } else if (/[A-Z]/.test(char)) {
            return `[${char}], `;
        } else if (/[a-z]/.test(char)) {
            return `{${char}}, `;
        } else if (/\d/.test(char)) {
            return `<${char}>, `;
        } else {
            return `${char}, `;
        }
    }).join('').slice(0, -2);
}

function convertToNumeric(input) {
    return input.split('').map(char => {
        if (/[a-z]/.test(char)) {
            return char.charCodeAt(0) - 96; 
        } else if (/[A-Z]/.test(char)) {
            return char.charCodeAt(0) - 64; 
        } else {
            return char; 
        }
    }).join(''); 
}

function multiplyNumbersInString(input) {
    return input.split('').map(char => {
        if (/\d/.test(char)) {
            return (parseInt(char) * 2).toString(); 
        }
        return char; 
    }).join(''); 
}

function convertDecryptedToText(decryptedValues) {
    const mapping = {
        2: 'a', 4: 'b', 6: 'c', 8: 'd', 10: 'e', 12: 'f', 14: 'g',
        16: 'h', 18: 'i', 20: 'j', 22: 'k', 24: 'l', 26: 'm', 28: 'n',
        210: 'o', 212: 'p', 214: 'q', 216: 'r', 218: 's',
        40: 't', 42: 'u', 44: 'v', 46: 'w', 48: 'x', 410: 'y', 412: 'z'
    };

    return decryptedValues.map(value => {
        const trimmedValue = value.trim();
        let char = '';

        if (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) {
            const num = parseInt(trimmedValue.slice(1, -1));
            char = mapping[num] ? mapping[num] : trimmedValue; 
        } else if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
            const num = parseInt(trimmedValue.slice(1, -1));
            char = mapping[num] ? mapping[num].toUpperCase() : trimmedValue; 
        } else if (trimmedValue.startsWith('<') && trimmedValue.endsWith('>')) {
            const num = parseInt(trimmedValue.slice(1, -1));
            char = num; 
        } else if (!isNaN(trimmedValue) && trimmedValue !== '') {
            char = trimmedValue;
        } else {
            char = trimmedValue; 
        }

        return char; 
    }).join(', '); 
}

document.getElementById('generate-pq').addEventListener('click', () => {
    let p = generatePrime();
    let q = generatePrime();
    let n = p * q;
    let phi = (p - 1) * (q - 1);
    let e = 2;
    while (gcd(e, phi) !== 1) {
        e++;
    }
    let d = modInverse(e, phi);
    let i = Math.floor(Math.random() * 45100) + 500;

       document.getElementById('p1').value = `${e}, ${n}, ${i}`;

    // Paste the private key into input field 'p2'
    document.getElementById('p2').value = `${d}, ${n}, ${i}`;
});

document.getElementById('process-btn').addEventListener('click', () => {
    let inputValue = document.getElementById('format-input').value;
    let formattedValue = formatInput(inputValue);
    document.getElementById('formatted-output').innerText = `Formatted output: ${formattedValue}`;
    document.getElementById('formatted-output').style.display = 'block'; 

    let numericValue = convertToNumeric(formattedValue);
    document.getElementById('formatted-output').value = numericValue; 
    document.getElementById('formatted-output').innerText = `Numeric output: ${numericValue}`;
    document.getElementById('formatted-output').style.display = 'block'; 

    let multipliedResult = multiplyNumbersInString(numericValue);
    document.getElementById('formatted-output').value = multipliedResult; 
    document.getElementById('formatted-output').innerText = `Multiplied output: ${multipliedResult}`;
});

document.getElementById('encrypt-btn').addEventListener('click', () => {
    let publicKey = document.getElementById('encrypt-key').value.split(',');
    let e = parseInt(publicKey[0].replace('(', '').trim());
    let n = parseInt(publicKey[1].trim());
    let i = parseInt(publicKey[2].replace(')', '').trim());
    let values = document.getElementById('formatted-output').value.split(',');

    let encryptedValues = [];
    for (let value of values) {
        let trimmedValue = value.trim();
        if ((trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) || 
            (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) || 
            (trimmedValue.startsWith('<') && trimmedValue.endsWith('>'))) {
            let num = trimmedValue.slice(1, -1);
            let encryptedValue = parseInt(num);
            for (let j = 0; j < i; j++) {
                encryptedValue = powMod(encryptedValue, e, n);
            }
            encryptedValues.push(trimmedValue[0] + encryptedValue + trimmedValue[trimmedValue.length - 1]);
        } else {
            if (!isNaN(trimmedValue) && trimmedValue !== '') {
                let encryptedValue = parseInt(trimmedValue);
                for (let j = 0; j < i; j++) {
                    encryptedValue = powMod(encryptedValue, e, n);
                }
                encryptedValues.push(encryptedValue);
            } else {
                encryptedValues.push(trimmedValue); 
            }
        }
    }

    document.getElementById('encrypted-value').innerText = `Encrypted values: ${encryptedValues.join(', ')}`;
});

document.getElementById('decrypt-btn').addEventListener('click', () => {
    let privateKey = document.getElementById('decrypt-key').value.split(',');
    let d = parseInt(privateKey[0].replace('(', '').trim());
    let n = parseInt(privateKey[1].trim());
    let i = parseInt(privateKey[2].replace(')', '').trim());
    let values = document.getElementById('decrypt-value').value.split(',');

    let decryptedValues = values.map(value => {
        let trimmedValue = value.trim();
        if ((trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) || 
            (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) || 
            (trimmedValue.startsWith('<') && trimmedValue.endsWith('>'))) {
            let num = trimmedValue.slice(1, -1);
            let decryptedValue = parseInt(num);
            for (let j = 0; j < i; j++) {
                decryptedValue = powMod(decryptedValue, d, n);
            }
            return trimmedValue[0] + decryptedValue + trimmedValue[trimmedValue.length - 1];
        } else {
            if (!isNaN(trimmedValue) && trimmedValue !== '') {
                let decryptedValue = parseInt(trimmedValue);
                for (let j = 0; j < i; j++) {
                    decryptedValue = powMod(decryptedValue, d, n);
                }
                return decryptedValue;
            }
            return trimmedValue; 
        }
    });

    document.getElementById('decrypted-value').innerText = `Decrypted values: ${convertDecryptedToText(decryptedValues)}`;
});function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function generatePrime() {
    let prime = Math.floor(Math.random() * 451) + 50;
    while (!isPrime(prime)) {
        prime = Math.floor(Math.random() * 451) + 50;
    }
    return prime;
}

function gcd(a, b) {
    if (b === 0) return a;
    return gcd(b, a % b);
}

function modInverse(e, phi) {
    let d = 0;
    for (let i = 1; i < phi; i++) {
        if ((e * i) % phi === 1) {
            d = i;
            break;
        }
    }
    return d;
}

function powMod(base, exponent, modulus) {
    let result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        exponent = Math.floor(exponent / 2);
        base = (base * base) % modulus;
    }
    return result;
}

function formatInput(input) {
    return input.split('').map(char => {
        if (char === ' ') {
            return '°, '; // Convert spaces to "°, "
        } else if (/[A-Z]/.test(char)) {
            return `[${char}], `;
        } else if (/[a-z]/.test(char)) {
            return `{${char}}, `;
        } else if (/\d/.test(char)) {
            return `<${char}>, `;
        } else {
            return `${char}, `;
        }
    }).join('').slice(0, -2);
}

function formatInput(input) {
    return input.split('').map(char => {
        if (char === ' ') {
            return '°, '; // Convert spaces to "°, "
        } else if (char === ',') {
            return '(+-/-+), '; // Convert commas to "(+-/-+)"
        } else if (char === '°') {
            return '(+-:-+), '; // Convert degree symbol to "(+-:-+)"
        } else if (/[A-Z]/.test(char)) {
            return `[${char}], `;
        } else if (/[a-z]/.test(char)) {
            return `{${char}}, `;
        } else if (/\d/.test(char)) {
            return `<${char}>, `;
        } else {
            return `${char}, `;
        }
    }).join('').slice(0, -2); // Remove the trailing comma and space
}

function convertToNumeric(input) {
    return input.split('').map(char => {
        if (/[a-z]/.test(char)) {
            return char.charCodeAt(0) - 96; 
        } else if (/[A-Z]/.test(char)) {
            return char.charCodeAt(0) - 64; 
        } else {
            return char; 
        }
    }).join(''); 
}

function multiplyNumbersInString(input) {
    return input.split('').map(char => {
        if (/\d/.test(char)) {
            return (parseInt(char) * 2).toString(); 
        }
        return char; 
    }).join(''); 
}

function convertDecryptedToText(decryptedValues) {
    const mapping = {
        2: 'a', 4: 'b', 6: 'c', 8: 'd', 10: 'e', 12: 'f', 14: 'g',
        16: 'h', 18: 'i', 20: 'j', 22: 'k', 24: 'l', 26: 'm', 28: 'n',
        210: 'o', 212: 'p', 214: 'q', 216: 'r', 218: 's',
        40: 't', 42: 'u', 44: 'v', 46: 'w', 48: 'x', 410: 'y', 412: 'z'
    };

    return decryptedValues.map(value => {
        const trimmedValue = value.trim();
        let char = '';

        if (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) {
            const num = parseInt(trimmedValue.slice(1, -1));
            char = mapping[num] ? mapping[num] : trimmedValue; 
        } else if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
            const num = parseInt(trimmedValue.slice(1, -1));
            char = mapping[num] ? mapping[num].toUpperCase() : trimmedValue; 
        } else if (trimmedValue.startsWith('<') && trimmedValue.endsWith('>')) {
            const num = parseInt(trimmedValue.slice(1, -1));
            char = num; 
        } else if (!isNaN(trimmedValue) && trimmedValue !== '') {
            char = trimmedValue;
        } else {
            char = trimmedValue; 
        }

        return char; 
    }).join(', '); 
}

document.getElementById('generate-pq').addEventListener('click', () => {
    let p = generatePrime();
    let q = generatePrime();
    let n = p * q;
    let phi = (p - 1) * (q - 1);
    let e = 2;
    while (gcd(e, phi) !== 1) {
        e++;
    }
    let d = modInverse(e, phi);
    let i = Math.floor(Math.random() * 451) + 50;

    document.getElementById('pq-values').innerText = `p = ${p}, q = ${q}`;
    document.getElementById('rsa-keys').innerText = `Public Key: (${e}, ${n}, ${i})\nPrivate Key: (${d}, ${n}, ${i})`;
});

document.getElementById('process-btn').addEventListener('click', () => {
    let inputValue = document.getElementById('format-input').value;
    let formattedValue = formatInput(inputValue);
    document.getElementById('formatted-output').innerText = `Formatted output: ${formattedValue}`;
    document.getElementById('formatted-output').style.display = 'block'; 

    let numericValue = convertToNumeric(formattedValue);
    document.getElementById('formatted-output').value = numericValue; 
    document.getElementById('formatted-output').innerText = `Numeric output: ${numericValue}`;
    document.getElementById('formatted-output').style.display = 'block'; 

    let multipliedResult = multiplyNumbersInString(numericValue);
    document.getElementById('formatted-output').value = multipliedResult; 
    document.getElementById('formatted-output').innerText = `Multiplied output: ${multipliedResult}`;
});

document.getElementById('encrypt-btn').addEventListener('click', () => {
    let publicKey = document.getElementById('encrypt-key').value.split(',');
    let e = parseInt(publicKey[0].replace('(', '').trim());
    let n = parseInt(publicKey[1].trim());
    let i = parseInt(publicKey[2].replace(')', '').trim());
    let values = document.getElementById('formatted-output').value.split(',');

    let encryptedValues = [];
    for (let value of values) {
        let trimmedValue = value.trim();
        if ((trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) || 
            (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) || 
            (trimmedValue.startsWith('<') && trimmedValue.endsWith('>'))) {
            let num = trimmedValue.slice(1, -1);
            let encryptedValue = parseInt(num);
            for (let j = 0; j < i; j++) {
                encryptedValue = powMod(encryptedValue, e, n);
            }
            encryptedValues.push(trimmedValue[0] + encryptedValue + trimmedValue[trimmedValue.length - 1]);
        } else {
            if (!isNaN(trimmedValue) && trimmedValue !== '') {
                let encryptedValue = parseInt(trimmedValue);
                for (let j = 0; j < i; j++) {
                    encryptedValue = powMod(encryptedValue, e, n);
                }
                encryptedValues.push(encryptedValue);
            } else {
                encryptedValues.push(trimmedValue); 
            }
        }
    }

    document.getElementById('encrypted-value').innerText = `Encrypted values: ${encryptedValues.join(', ')}`;
});

document.getElementById('decrypt-btn').addEventListener('click', () => {
    let privateKey = document.getElementById('decrypt-key').value.split(',');
    let d = parseInt(privateKey[0].replace('(', '').trim());
    let n = parseInt(privateKey[1].trim());
    let i = parseInt(privateKey[2].replace(')', '').trim());
    let values = document.getElementById('decrypt-value').value.split(',');

    let decryptedValues = values.map(value => {
        let trimmedValue = value.trim();
        if ((trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) || 
            (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) || 
            (trimmedValue.startsWith('<') && trimmedValue.endsWith('>'))) {
            let num = trimmedValue.slice(1, -1);
            let decryptedValue = parseInt(num);
            for (let j = 0; j < i; j++) {
                decryptedValue = powMod(decryptedValue, d, n);
            }
            return trimmedValue[0] + decryptedValue + trimmedValue[trimmedValue.length - 1];
        } else {
            if (!isNaN(trimmedValue) && trimmedValue !== '') {
                let decryptedValue = parseInt(trimmedValue);
                for (let j = 0; j < i; j++) {
                    decryptedValue = powMod(decryptedValue, d, n);
                }
                return decryptedValue;
            }
            return trimmedValue; 
        }
    });

    document.getElementById('decrypted-value').innerText = `${convertDecryptedToText(decryptedValues)}`;
});


function divideByTwo() {
    const inputText = document.getElementById("decrypted-value").innerText;
    let result = '';
    let currentNumber = '';

    for (let char of inputText) {
        if (!isNaN(char) && char !== ' ') { 
            // If the character is a digit, build the current number
            currentNumber += char;
        } else {
            // When we encounter a non-digit, process the current number
            if (currentNumber !== '') {
                result += (parseFloat(currentNumber) / 2).toString();
                currentNumber = ''; // Reset current number
            }
            result += char; // Add the non-digit character (like spaces or letters)
        }
    }

    // Handle any number left at the end
    if (currentNumber !== '') {
        result += (parseFloat(currentNumber) / 2).toString();
    }

    document.getElementById("decrypted-value").innerText = result;
}

function removeComma() {
    const inputText = document.getElementById("decrypted-value").innerText;
    const finalResult = inputText.replace(/, +/g, ' ').replace(/\s+/g, ' ').trim(); // Remove commas and excess spaces
    document.getElementById("decrypted-value").innerText = finalResult;
}
    function removeAllSpaces(input) {
    return input.replace(/\s+/g, ''); // Remove all spaces
}

function removeSpaces() {
            // Get the input text from the paragraph with id "final-result"
            const inputText = document.getElementById('decrypted-value').innerText;
            // Remove spaces from the input text
            const outputText = inputText.replace(/\s+/g, '');
            // Set the output text in the paragraph with id "removed-space-output"
            document.getElementById('decrypted-value').innerText = outputText;
        }
function convertDegreeToSpace() {
    const inputText = document.getElementById('decrypted-value').innerText;
    const outputText = inputText.replace(/°/g, ' ');
    document.getElementById('decrypted').value = outputText;
}

function convertInput() {
            var input = document.getElementById("decrypted").value;
            var output = input;

            // Replace all occurrences of "(+-/-+)" with ","
            output = output.split("(+-/-+)").join(",");

            // Replace all occurrences of "(+-:-+)" with "°"
            output = output.split("(+-:-+)").join("°");

            // Display the result
            document.getElementById("decrypted").value = output;
        }

// Event listener for the button

function processAndEncrypt() {
    // Trigger the process-b
    let inputValue = document.getElementById('format-input').value;
    
    // Format the input
    let formattedValue = formatInput(inputValue);
    document.getElementById('formatted-output').innerText = `Formatted output: ${formattedValue}`;
    document.getElementById('formatted-output').style.display = 'block'; 

    // Convert to numeric
    let numericValue = convertToNumeric(formattedValue);
    document.getElementById('formatted-output').value = numericValue; 
    document.getElementById('formatted-output').innerText = `Numeric output: ${numericValue}`;
    document.getElementById('formatted-output').style.display = 'block'; 

    // Multiply numbers in string
    let multipliedResult = multiplyNumbersInString(numericValue);
    document.getElementById('formatted-output').value = multipliedResult; 
    document.getElementById('formatted-output').innerText = `Multiplied output: ${multipliedResult}`;

    // Trigger the encrypt-btn functionality
    let publicKey = document.getElementById('encrypt-key').value.split(',');
    let e = parseInt(publicKey[0].replace('(', '').trim());
    let n = parseInt(publicKey[1].trim());
    let i = parseInt(publicKey[2].replace(')', '').trim());
    let values = multipliedResult.split(',');

    let encryptedValues = [];
    for (let value of values) {
        let trimmedValue = value.trim();
        if ((trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) || 
            (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) || 
            (trimmedValue.startsWith('<') && trimmedValue.endsWith('>'))) {
            let num = trimmedValue.slice(1, -1);
            let encryptedValue = parseInt(num);
            for (let j = 0; j < i; j++) {
                encryptedValue = powMod(encryptedValue, e, n);
            }
            encryptedValues.push(trimmedValue[0] + encryptedValue + trimmedValue[trimmedValue.length - 1]);
        } else {
            if (!isNaN(trimmedValue) && trimmedValue !== '') {
                let encryptedValue = parseInt(trimmedValue);
                for (let j = 0; j < i; j++) {
                    encryptedValue = powMod(encryptedValue, e, n);
                }
                encryptedValues.push(encryptedValue);
            } else {
                encryptedValues.push(trimmedValue); 
            }
        }
    }

    document.getElementById('encrypted').value = `${encryptedValues.join(', ')}`;
}

// Event listener for a button to trigger both process and encrypt
 document.getElementById('process-and-encrypt-btn').addEventListener('click', processAndEncrypt);




function executeDecryptionProcess() {
    // Decrypt the values
    let privateKey = document.getElementById('decrypt-key').value.split(',');
    let d = parseInt(privateKey[0].replace('(', '').trim());
    let n = parseInt(privateKey[1].trim());
    let i = parseInt(privateKey[2].replace(')', '').trim());
    let values = document.getElementById('decrypt-value').value.split(',');

    let decryptedValues = values.map(value => {
        let trimmedValue = value.trim();
        if ((trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) || 
            (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) || 
            (trimmedValue.startsWith('<') && trimmedValue.endsWith('>'))) {
            let num = trimmedValue.slice(1, -1);
            let decryptedValue = parseInt(num);
            for (let j = 0; j < i; j++) {
                decryptedValue = powMod(decryptedValue, d, n);
            }
            return trimmedValue[0] + decryptedValue + trimmedValue[trimmedValue.length - 1];
        } else {
            if (!isNaN(trimmedValue) && trimmedValue !== '') {
                let decryptedValue = parseInt(trimmedValue);
                for (let j = 0; j < i; j++) {
                    decryptedValue = powMod(decryptedValue, d, n);
                }
                return decryptedValue;
            }
            return trimmedValue; 
        }
    });

    // Convert decrypted values to text
    const convertedText = convertDecryptedToText(decryptedValues);
    document.getElementById('decrypted-value').innerText = convertedText;

    // Divide by two
    divideByTwo();

    // Remove commas
    removeComma();

    // Remove spaces
    removeSpaces();

    // Convert degree to space
    convertDegreeToSpace();
    
    convertInput();
}

function preventGeneratePQIfFilled() {
  const p1 = document.getElementById('p1');
  const p2 = document.getElementById('p2');
  const generatePQButton = document.getElementById('generate-pq');

  // Check if both p1 and p2 are filled
  if (p1.value.trim() !== '' && p2.value.trim() !== '') {
    // Disable the generate-pq button if both inputs are filled
    generatePQButton.disabled = true;
  } else {
    // Enable the generate-pq button if any input is empty
    generatePQButton.disabled = false;
  }
}

// Attach the function to the input fields' events (on input change)
document.getElementById('p1').addEventListener('input', preventGeneratePQIfFilled);
document.getElementById('p2').addEventListener('input', preventGeneratePQIfFilled);

// Also, run the function once on page load to set the correct button state
window.onload = preventGeneratePQIfFilled;

 