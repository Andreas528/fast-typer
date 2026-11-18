const textDisplay = document.getElementById("text-display");
const typingInput = document.getElementById("typing-input");

const cursor = document.createElement("span");
cursor.classList.add("cursor");

const wordPool = [
    "the", "quick", "brown", "fox",
    "jumps", "over", "lazy", "dog",
    "computer", "keyboard", "coding", "javascript",
    "program", "developer", "function", "variable"
];

function generateText() {
    const selectedWords = [];
    const randomIndex = Math.floor(Math.random() * wordPool.length);
    const randomWord = wordPool[randomIndex]
    selectedWords.push(randomWord)
    return selectedWords
}

const sentences = [
    generateText(),
    generateText(),
    generateText()
];

console.log(sentences)

// Create a span for every character
textDisplay.innerHTML = "";
textDisplay.appendChild(cursor);

for (let character of targetText) {
    const span = document.createElement("span");
    span.innerText = character;
    textDisplay.appendChild(span);
}

function updateCursor() {
    const typedLength = typingInput.value.length;
    const characters = textDisplay.querySelectorAll("span:not(.cursor)");

    if (typedLength < characters.length) {
        textDisplay.insertBefore(cursor, characters[typedLength]);
    } else {
        textDisplay.appendChild(cursor);
    }
}

// Activate typing when clicking the text
typingInput.focus();

typingInput.addEventListener("input", () => {
    const typedText = typingInput.value;
    const characters = textDisplay.querySelectorAll("span:not(.cursor)");

    for (let i = 0; i < characters.length; i++) {
        if (i < typedText.length) {
            if (typedText[i] === targetText[i]) {
                characters[i].style.color = "white";
            } else {
                characters[i].style.color = "red";
            }
        } else {
            characters[i].style.color = "";
        }
    } updateCursor();
});

typingInput.addEventListener("keydown", (event) => {
    const typedText = typingInput.value;

    // Block Undo
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
    }

    // Block deleting an entire word
    if (event.ctrlKey && event.key === "Backspace") {
        event.preventDefault();
    }

    // Find the beginning of the current word
    if (event.key === "Backspace") {
        const lastSpace = typedText.lastIndexOf(" ");

        if (lastSpace === -1 && typedText.length === 0) {
            event.preventDefault();
        } else if (typedText.length === lastSpace + 1) {
            event.preventDefault();
        }
    }
});