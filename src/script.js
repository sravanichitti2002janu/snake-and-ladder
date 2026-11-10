const board = document.getElementById("board");
const message = document.getElementById("message");
const turn = document.getElementById("turn");
const diceDisplay = document.getElementById("dice");
const rollButton = document.getElementById("rollButton");

let positions = [0, 0];
let currentPlayer = 0;
let gameOver = false;

const snakes = {
    16: 6,
    47: 26,
    49: 11,
    56: 53,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 78
};

const ladders = {
    2: 38,
    7: 14,
    8: 31,
    15: 26,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    78: 98
};

function createBoard() {
    board.innerHTML = "";

    for (let row = 9; row >= 0; row--) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";

            const rowFromBottom = 9 - row;
            const number = rowFromBottom * 10 +
                (rowFromBottom % 2 === 0 ? col + 1 : 10 - col);

            let special = "";

            if (snakes[number]) {
                special = "🐍";
            } else if (ladders[number]) {
                special = "🪜";
            }

            cell.innerHTML = `
                <span>${number}</span>
                <span class="special">${special}</span>
                <span class="players" id="players-${number}"></span>
            `;

            board.appendChild(cell);
        }
    }

    updatePlayers();
}

function updatePlayers() {
    document.querySelectorAll(".players").forEach(cell => {
        cell.textContent = "";
    });

    positions.forEach((position, index) => {
        if (position > 0) {
            const cell = document.getElementById(`players-${position}`);

            if (cell) {
                cell.textContent += index === 0 ? "🔴" : "🔵";
            }
        }
    });
}

function rollDice() {
    if (gameOver) return;

    const dice = Math.floor(Math.random() * 6) + 1;

    diceDisplay.textContent = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][dice - 1];

    let playerName = `Player ${currentPlayer + 1}`;

    let newPosition = positions[currentPlayer] + dice;

    if (newPosition > 100) {
        message.textContent =
            `${playerName} needs an exact number to reach 100!`;
    } else {
        positions[currentPlayer] = newPosition;

        if (snakes[newPosition]) {
            positions[currentPlayer] = snakes[newPosition];

            message.textContent =
                `${playerName} got bitten by a snake! 🐍`;
        } else if (ladders[newPosition]) {
            positions[currentPlayer] = ladders[newPosition];

            message.textContent =
                `${playerName} climbed a ladder! 🪜`;
        } else {
            message.textContent =
                `${playerName} rolled ${dice} and moved to ${positions[currentPlayer]}.`;
        }

        updatePlayers();

        if (positions[currentPlayer] === 100) {
            message.textContent = `${playerName} WON THE GAME! 🎉`;
            turn.textContent = "Congratulations! 🏆";
            gameOver = true;
            rollButton.disabled = true;
            return;
        }
    }

    currentPlayer = 1 - currentPlayer;

    turn.textContent = `Player ${currentPlayer + 1}'s Turn ${
        currentPlayer === 0 ? "🔴" : "🔵"
    }`;
}

function resetGame() {
    positions = [0, 0];
    currentPlayer = 0;
    gameOver = false;

    diceDisplay.textContent = "🎲";
    message.textContent = "Click Roll Dice to start playing!";
    turn.textContent = "Player 1's Turn 🔴";
    rollButton.disabled = false;

    updatePlayers();
}

createBoard();
