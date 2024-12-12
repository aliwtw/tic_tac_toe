// Game Settings and State Variables
let counter = 0; // Keeps track of the current turn
let gridSize = 3; // Initial size of the grid
let winSize = 3; // Number of cells required to win
let highlighted = 0; // Tracks the number of highlighted cells for win display
let gridArray = null; // 2D array representing the grid
let players = 2; // Number of players
let winArray = []; // Stores the winning cells for highlighting

// Player symbols
const symbols = {
    0: "x",
    1: "o",
    2: "Δ",
    3: "Ω"
};

// Initialize the grid
function setGrid(size = 3) {
    const grid = document.createElement('table');
    grid.id = "grid";

    for (let row = 0; row < size; row++) {
        const newRow = document.createElement("tr");
        for (let col = 0; col < size; col++) {
            const newCell = document.createElement('td');
            newCell.addEventListener('click', (event) => cellClicked(event)); // Attach click event listener
            newRow.appendChild(newCell);
        }
        grid.appendChild(newRow);
    }

    document.getElementById("gridContainer").appendChild(grid);
}

// Update the displayed current player
function setCurrentPlayer() {
    const player = document.getElementById("player");
    player.innerHTML = symbols[counter % players];
    player.className = symbols[counter % players];
}

// Handle a cell click
function cellClicked(event) {
    const element = event.target;
    const value = element.innerHTML;

    if (value == "") {
        element.innerHTML = symbols[counter % players];
        element.className = symbols[counter % players];
        counter++;
        setCurrentPlayer();
        getCellLocation(element);
    }
}

// Extend the grid by adding rows and columns around the edges
function extendGrid() {
    gridSize += 2; // Increase the grid size
    const grid = document.getElementById("grid");

    // Add new top and bottom rows
    const newRowUp = document.createElement('tr');
    const newRowDown = document.createElement('tr');

    for (let index = 0; index < grid.children.length; index++) {
        const newCell = document.createElement('td');
        newCell.addEventListener('click', (event) => cellClicked(event));

        const newCellDown = document.createElement('td');
        newCellDown.addEventListener('click', (event) => cellClicked(event));

        newRowUp.appendChild(newCell);
        newRowDown.appendChild(newCellDown);
    }

    grid.prepend(newRowUp);
    grid.appendChild(newRowDown);

    // Add cells to the left and right of existing rows
    Array.from(grid.children).forEach((row) => {
        const newCellLeft = document.createElement('td');
        const newCellRight = document.createElement('td');
        newCellLeft.addEventListener('click', (event) => cellClicked(event));
        newCellRight.addEventListener('click', (event) => cellClicked(event));
        row.prepend(newCellLeft);
        row.appendChild(newCellRight);
    });

    extendGridArray(); // Update the grid array for logic
}

// Get the location of a cell in the grid
function getCellLocation(element) {
    const allRows = Array.from(document.getElementById("grid").children);
    const currentRow = element.parentNode;
    const cols = Array.from(currentRow.children);

    const colNum = cols.indexOf(element);
    const rowNum = allRows.indexOf(currentRow);

    setArrayValue(rowNum, colNum, element.innerHTML);
}

// Initialize the grid array
function setArray(size) {
    gridArray = Array.from({ length: size }, () => new Array(size).fill(null));
}

// Update the grid array and check for a win
function setArrayValue(rowNum, colNum, val) {
    gridArray[rowNum][colNum] = val;

    if (counter >= (winSize * players) - 1) { // Check only after minimum moves for a win
        if (checkWin(rowNum, colNum, val)) win();
    }
}

// Check if the last move resulted in a win
function checkWin(x, y, val) {
    return (
        linesChecker(1, 0, x, y, val) ||  // Horizontal
        linesChecker(0, 1, x, y, val) ||  // Vertical
        linesChecker(1, 1, x, y, val) ||  // Diagonal /
        linesChecker(-1, 1, x, y, val)    // Diagonal \
    );
}

// Helper function to check lines for winning conditions
function linesChecker(xInc, yInc, x0, y0, val) {
    let matchCount = 1;
    let winLine = [{ row: x0, col: y0 }];

    for (let direction of [1, -1]) { // Check both forward and backward
        for (let index = 1; index < winSize; index++) {
            const x = x0 + (index * xInc * direction);
            const y = y0 + (index * yInc * direction);

            if (gridArray[x]?.[y] !== val) break;

            matchCount++;
            winLine.push({ row: x, col: y });
        }
    }

    if (matchCount >= winSize) {
        winArray.push(...winLine);
        return true;
    }

    return false;
}

// Handle winning the game
function win() {
    const { row, col } = winArray[winArray.length - 1];
    const winnerSymbol = gridArray[row][col];

    highlightWin();
    congratulations(winnerSymbol);

    // Update scoreboard
    const scoreBoard = document.getElementById("winners");
    scoreBoard.style.display = "flex";
    scoreBoard.children[1].innerHTML += `&nbsp;${winnerSymbol}`;
}

// Reset the game
function reset() {
    window.location.reload();
}

// Extend the grid array to accommodate the extended grid
function extendGridArray() {
    const newGridArray = Array.from({ length: gridSize }, (_, i) => (
        i === 0 || i === gridSize - 1
            ? new Array(gridSize).fill(null)
            : [null, ...gridArray[i - 1], null]
    ));
    gridArray = newGridArray;
}

// Show a congratulatory message
function congratulations(winner = "") {
    const text = document.getElementById("congrats");
    text.innerHTML = `✨🎉 Congratulations 🎉✨ <br/>${winner}`;
    text.style.display = 'block';

    setTimeout(() => {
        text.style.display = 'none';
    }, 3000);
}

// Highlight winning cells
function highlightWin() {
    const rows = Array.from(document.getElementById("grid").children);
    for (let index = highlighted; index < winArray.length; index++) {
        const { row, col } = winArray[index];
        rows[row].children[col].className = "highlight";
    }
    highlighted = winArray.length;
}

// Initial setup
setGrid(gridSize);
setCurrentPlayer();
setArray(gridSize);

// Event listeners
document.getElementById("addCells").addEventListener('click', extendGrid);
document.getElementById("winSize").addEventListener('change', (event) => {
    winSize = +event.target.value;
});
document.getElementById("players").addEventListener('change', (event) => {
    players = +event.target.value;
    document.getElementById("displayPlayers").innerHTML = players;
    setCurrentPlayer()
});
document.getElementById("reset").addEventListener('click', reset);
