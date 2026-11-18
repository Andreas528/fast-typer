const textDisplay = document.getElementById("text-display");
const typingInput = document.getElementById("typing-input");
const cursor = document.createElement("span");

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

function measureTextWidth(text) {
    context.font = getComputedStyle(textDisplay).font;
    return context.measureText(text).width;
}
console.log(measureTextWidth("hello world"));
console.log(textDisplay.clientWidth);
cursor.classList.add("cursor");

const wordPool = [
    "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
    "computer", "keyboard", "coding", "javascript", "program",
    "developer", "function", "variable", "software", "hardware",
    "screen", "window", "mouse", "button", "folder", "file",
    "internet", "website", "browser", "server", "network",

    "house", "room", "table", "chair", "door", "window",
    "garden", "street", "city", "country", "world", "place",
    "people", "person", "friend", "family", "child", "mother",
    "father", "school", "teacher", "student", "book", "paper",

    "small", "large", "little", "great", "happy", "quiet",
    "fast", "slow", "bright", "dark", "strong", "weak",
    "simple", "complex", "beautiful", "strange", "mysterious",
    "ferocious", "ancient", "modern", "different", "important",

    "run", "walk", "think", "write", "read", "learn", "build",
    "create", "change", "move", "watch", "listen", "speak",
    "open", "close", "start", "finish", "follow", "choose",
    "remember", "discover", "explore", "understand"
];

const usedWords = [];

let targetText = "";
let wordSequences = [];
let currentRow = 0;

// TODO:
// Add timer, accuracy and WPM calculation
let testDuration = 30;
let timeLeft = testDuration;
let timer = null;
let testStarted = false;

function generateText() {
    const selectedWords = [];

    // width to 90% of available text display
    const targetWidth = textDisplay.clientWidth * 0.9;

    // randomly chooses a number between 10-15
    const wordCount = Math.floor(Math.random() * 6) + 10;

    // finds words that hasn't already been used, so duplicates are avoided, 
    // meaning you can't meet the same word twice
    while (selectedWords.length < wordCount) {
        const availableWords = wordPool.filter(word => {
            return !selectedWords.includes(word) && !usedWords.includes(word);
        });

        if (availableWords.length === 0) {
            break;
        }

        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const randomWord = availableWords[randomIndex];

        const testText = [...selectedWords, randomWord].join(" ");

        if (measureTextWidth(testText) > targetWidth && selectedWords.length >= 10) {
            break;
        }

        selectedWords.push(randomWord);
        usedWords.push(randomWord);
    }

    return selectedWords.join(" ");
}

// Generates the three rows based on our filtered usedWords so no word is repeated in the rows.
function startTest() {
    usedWords.length = 0;

    wordSequences = [
        generateText(),
        generateText(),
        generateText()
    ];

    currentRow = 0;
    targetText = wordSequences[currentRow];
    displayText();
}

startTest();

// Keep typing input as focus
typingInput.focus();
typingInput.addEventListener("blur", () => {
    typingInput.focus();
});

function displayText() {
    textDisplay.innerHTML = "";

    wordSequences.forEach((sequence, rowIndex) => {
        const row = document.createElement("div");
        row.classList.add("text-row");

        for (let character of sequence) {
            const span = document.createElement("span");
            span.innerText = character;
            row.appendChild(span);
        }

        textDisplay.appendChild(row)
        if (rowIndex === 0) {
            row.insertBefore(cursor, row.firstChild);
        }
    });
}

// Creates one row and returns it without adding it to the page yet
function createRow(sequence) {
    const row = document.createElement("div");
    row.classList.add("text-row");

    for (let character of sequence) {
        const span = document.createElement("span");
        span.innerText = character;
        row.appendChild(span);
    }

    return row;
}
// Update the cursor to follow the typed characters
function updateCursor() {
    const row = textDisplay.children[currentRow];
    const characters = row.querySelectorAll("span:not(.cursor)");
    const typedLength = typingInput.value.length;

    if (typedLength < characters.length) {
        row.insertBefore(cursor, characters[typedLength]);
    } else {
        row.appendChild(cursor);
    }
}

function moveToNextRow() {
    typingInput.value = "";
    
    if (currentRow === 0) {
        currentRow++;
    } else if (currentRow === 1) {
        // Shifts the array removing the first element
        wordSequences.shift();
        textDisplay.children[0].remove();
        // Creates a new row, containing the next element in the array (4, index 3)
        // But since we shift it, it's actually index 2
        wordSequences.push(generateText());
        textDisplay.appendChild(createRow(wordSequences[2]));
    }

    targetText = wordSequences[currentRow];
    textDisplay.children[currentRow].insertBefore(
        cursor, textDisplay.children[currentRow].firstChild
    );
}
// User input and character logic
typingInput.addEventListener("input", () => {
    const typedText = typingInput.value;
    const characters = textDisplay.children[currentRow]
    .querySelectorAll("span:not(.cursor)");

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
    if (typedText.length === targetText.length) {
        moveToNextRow();
    }
});

function isWordCorrect(typedWord, targetWord) {
    return typedWord === targetWord;
}

typingInput.addEventListener("keydown", (event) => {
    const typedText = typingInput.value;

    // Block CTRL + Z
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        return;
    }

    // Block CTRL + Backspace
    if (event.ctrlKey && event.key === "Backspace") {
        event.preventDefault();
        return;
    }

    if (event.key !== "Backspace") return;

    const cursorPosition = typingInput.selectionStart;

    if (cursorPosition === 0) return;

    // Find the word containing the character before the cursor
    const textBeforeCursor = typedText.slice(0, cursorPosition);
    const wordStart = textBeforeCursor.search(/\S+$/);

    if (wordStart === -1) return;

    const typedWord = textBeforeCursor.slice(wordStart);

    // Find the corresponding word in the target text
    const wordIndex = textBeforeCursor
        .slice(0, wordStart)
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    const targetWord = targetText.split(/\s+/)[wordIndex];

    // Protect correct words
    if (typedWord === targetWord) {
        event.preventDefault();
    }
});