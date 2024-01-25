const input = document.getElementById("input");
const coded = document.getElementById("coded");
const fixed = document.getElementById("fixed");
const resultBlock = document.getElementById("result__block");
const resultText = document.getElementById("result__text");

const inputButton = document.getElementById("input-button");
const fixButton = document.getElementById("fix-button");
const resetButton = document.getElementById("reset-button")


const CONTEXT = {
    input: "",
    coded: "",
    broken: "",
    fixed: "",

    clear() {
        this.input = "";
        this.coded = "";
        this.broken = "";
        this.fixed = "";
    }
}


const addControlBits = (bitString) => {
    const bits = bitString;
    const controlBits =
        ((1 * bits[0] + 1 * bits[1] + 1 * bits[3]) & 1).toString()
        + ((1 * bits[1] + 1 * bits[2] + 1 * bits[3]) & 1).toString()
        + ((1 * bits[0] + 1 * bits[2] + 1 * bits[3]) & 1).toString();
    return bits + controlBits;
}


const moreThanOneError = () => {
    const codedString = CONTEXT.coded;
    const brokenString = CONTEXT.broken;

    if (codedString.length != brokenString.length) {
        console.error("Diffrent length");
        return true;
    }

    let differentBits = 0;
    for (let i = 0; i < codedString.length; i++) {
        if (codedString[i] != brokenString[i]) {
            differentBits++;
        };
    }

    return differentBits > 1;
}


const findErrorIndex = (bitString) => {
    const bits = bitString;
    const diagram1Parity =
        (1 * bits[0] + 1 * bits[1] + 1 * bits[3] + 1 * bits[4]) & 1;
    const diagram2Parity =
        (1 * bits[1] + 1 * bits[2] + 1 * bits[3] + 1 * bits[5]) & 1;
    const diagram3Parity =
        (1 * bits[0] + 1 * bits[2] + 1 * bits[3] + 1 * bits[6]) & 1;
    const sum = (diagram1Parity << 2) + (diagram2Parity << 1) + diagram3Parity;

    /*
     * 000 (0) -> nul
     * 001 (1) -> 6
     * 010 (2) -> 5
     * 011 (3) -> 2
     * 100 (4) -> 4
     * 101 (5) -> 0
     * 110 (6) -> 1
     * 111 (7) -> 3
     */

    let indexOfError;
    switch (sum) {
        case 0:
            indexOfError = null;
            break;
        case 1:
            indexOfError = 6;
            break;
        case 2:
            indexOfError = 5;
            break;
        case 3:
            indexOfError = 2;
            break;
        case 4:
            indexOfError = 4;
            break;
        case 5:
            indexOfError = 0;
            break;
        case 6:
            indexOfError = 1;
            break;
        case 7:
            indexOfError = 3;
            break;
    }

    return indexOfError;
}


const fixError = (bitString, errorIndex) => {
    const bits = bitString;
    const indexOfError = errorIndex;

    let fixedString = bitString;
    let resultMessage = "Ошибки не было.";

    if (indexOfError != null) {
        fixedString =
            bits.substring(0, indexOfError)
            + ((1 * bits[indexOfError]) ? "0" : "1")
            + bits.substring(indexOfError + 1, bits.length);
        resultMessage = "Ошибка была в бите по номеру " + (indexOfError + 1)
            + ", если считать слева направо.";
    }

    return { fixedString, resultMessage }
}


const showMessage = (message) => {
    resultText.textContent = message;
    resultBlock.classList.remove("__hidden");
}


const hideMessage = () => {
    resultBlock.classList.add("__hidden");
}


const reset = () => {
    input.disabled = false;
    input.value = "";
    coded.disabled = false;
    coded.value = "";
    fixed.value = "";

    fixButton.disabled = false;
    inputButton.disabled = false;

    hideMessage();
    resultText.textContent = "";

    CONTEXT.clear();
}


inputButton.addEventListener("click", (e) => {
    hideMessage();

    if (!/^[0-1]{4}$/.test(input.value)) {
        showMessage("Введённое число не удовлетворяет условию!")
        return;
    };

    input.disabled = true;
    e.target.disabled = true;

    CONTEXT.input = input.value;
    CONTEXT.coded = addControlBits(CONTEXT.input);

    coded.value = CONTEXT.coded;
});

fixButton.addEventListener("click", (e) => {
    hideMessage();

    if (!/^[0-1]{7}$/.test(coded.value)) {
        showMessage("Введённое число не удовлетворяет условию!")
        return;
    }

    coded.disabled = true;
    e.target.disabled = true;

    CONTEXT.broken = coded.value;

    let message;
    if (moreThanOneError()) {
        message = "Ошибка: больше одной ошибки или не хватает бита!";
    } else {
        const errorIndex = findErrorIndex(coded.value);
        let { fixedString, resultMessage } = fixError(CONTEXT.broken, errorIndex);
        CONTEXT.fixed = fixedString;
        message = resultMessage;
    }
    
    showMessage(message);
    fixed.value = CONTEXT.fixed;
});

resetButton.addEventListener("click", reset);

