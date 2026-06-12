let deck = [];
let playerHand = [];
let computerHand = [];
let discardPile = [];

let currentColor = "";
let playerTurn = true;
let gameOver = false;

const colors = ["red", "blue", "green", "yellow"];

function createDeck() {
    deck = [];

    for (const color of colors) {
        deck.push({ color, value: "0" });

        for (let i = 1; i <= 9; i++) {
            deck.push({ color, value: String(i) });
            deck.push({ color, value: String(i) });
        }

        for (let i = 0; i < 2; i++) {
            deck.push({ color, value: "Skip" });
            deck.push({ color, value: "Reverse" });
            deck.push({ color, value: "+2" });
        }
    }

    for (let i = 0; i < 4; i++) {
        deck.push({ color: "black", value: "Wild" });
        deck.push({ color: "black", value: "+4" });
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
        [array[j], array[i]];
    }
}

function drawCard(hand) {
    if (deck.length === 0) {
        reshuffleDeck();
    }

    if (deck.length > 0) {
        hand.push(deck.pop());
    }
}

function reshuffleDeck() {
    if (discardPile.length <= 1) return;

    const topCard = discardPile.pop();

    deck = [...discardPile];
    discardPile = [topCard];

    shuffle(deck);
}

function dealCards() {
    for (let i = 0; i < 7; i++) {
        drawCard(playerHand);
        drawCard(computerHand);
    }
}

function startDiscardPile() {
    let card;

    do {
        card = deck.pop();
    }
    while (card.color === "black");

    discardPile.push(card);
    currentColor = card.color;
}

function getTopCard() {
    return discardPile[discardPile.length - 1];
}

function canPlay(card) {
    const top = getTopCard();

    return (
        card.color === currentColor ||
        card.value === top.value ||
        card.color === "black"
    );
}

function createCardElement(card, index) {
    const div = document.createElement("div");

    div.classList.add("card");
    div.classList.add(card.color);

    div.textContent = card.value;

    div.addEventListener("click", () => {
        playPlayerCard(index);
    });

    return div;
}

function render() {

    const handDiv =
        document.getElementById("player-hand");

    handDiv.innerHTML = "";

    playerHand.forEach((card, index) => {
        handDiv.appendChild(
            createCardElement(card, index)
        );
    });

    const top = getTopCard();

    const discard =
        document.getElementById("discard-pile");

    discard.className = "pile";
    discard.classList.add(top.color);

    // Show BOTH color and value
    discard.textContent =
        `${top.color.toUpperCase()}\n${top.value}`;

    document.getElementById(
        "computer-count"
    ).textContent =
        `Cards: ${computerHand.length}`;

    document.getElementById(
        "current-color"
    ).textContent =
        `Current Color: ${currentColor.toUpperCase()}`;
}

function updateStatus(text) {
    document.getElementById(
        "status"
    ).textContent = text;
}

function chooseColor(hand) {
    const counts = {
        red: 0,
        blue: 0,
        green: 0,
        yellow: 0
    };

    hand.forEach(card => {
        if (counts[card.color] !== undefined) {
            counts[card.color]++;
        }
    });

    let best = "red";

    for (const color in counts) {
        if (counts[color] > counts[best]) {
            best = color;
        }
    }

    return best;
}

function applyCardEffect(card, targetHand) {

    if (card.value === "+2") {
        drawCard(targetHand);
        drawCard(targetHand);
    }

    if (card.value === "+4") {
        for (let i = 0; i < 4; i++) {
            drawCard(targetHand);
        }
    }
}

function playPlayerCard(index) {

    if (!playerTurn || gameOver) return;

    const card = playerHand[index];

    if (!canPlay(card)) return;

    playerHand.splice(index, 1);

    discardPile.push(card);

    if (card.color !== "black") {
        currentColor = card.color;
    } else {
        currentColor =
            prompt(
                "Choose color: red, blue, green, yellow"
            )?.toLowerCase();

        if (!colors.includes(currentColor)) {
            currentColor = "red";
        }
    }

    handleActionCard(card, computerHand);

    render();

    if (checkWinner()) return;

    playerTurn = false;

    setTimeout(computerTurn, 1000);
}

function handleActionCard(card, targetHand) {

    if (
        card.value === "+2" ||
        card.value === "+4"
    ) {
        applyCardEffect(card, targetHand);
    }

    if (
        card.value === "Skip" ||
        card.value === "Reverse"
    ) {
        playerTurn = true;
    }
}

function computerTurn() {

    if (gameOver) return;

    updateStatus("Computer Thinking...");

    setTimeout(() => {

        let playableIndex = -1;

        for (let i = 0; i < computerHand.length; i++) {
            if (canPlay(computerHand[i])) {
                playableIndex = i;
                break;
            }
        }

        if (playableIndex === -1) {

            drawCard(computerHand);

            playableIndex =
                computerHand.length - 1;

            if (
                !canPlay(
                    computerHand[playableIndex]
                )
            ) {
                playerTurn = true;
                updateStatus("Your Turn");
                render();
                return;
            }
        }

        const card =
            computerHand.splice(
                playableIndex,
                1
            )[0];

        discardPile.push(card);

        if (card.color !== "black") {
            currentColor = card.color;
        } else {
            currentColor =
                chooseColor(computerHand);
        }

        if (
            card.value === "+2" ||
            card.value === "+4"
        ) {
            applyCardEffect(
                card,
                playerHand
            );
        }

        render();

        if (computerHand.length === 1) {
            updateStatus(
                "Computer says UNO!"
            );
        }

        if (checkWinner()) return;

        if (
            card.value === "Skip" ||
            card.value === "Reverse"
        ) {
            setTimeout(
                computerTurn,
                1000
            );
            return;
        }

        playerTurn = true;
        updateStatus("Your Turn");

    }, 1000);
}

function playerDraw() {

    if (!playerTurn || gameOver) return;

    drawCard(playerHand);

    render();

    playerTurn = false;

    setTimeout(computerTurn, 1000);
}

function checkWinner() {

    if (playerHand.length === 0) {

        updateStatus(
            "🎉 You Win!"
        );

        gameOver = true;

        return true;
    }

    if (computerHand.length === 0) {

        updateStatus(
            "💻 Computer Wins!"
        );

        gameOver = true;

        return true;
    }

    return false;
}

function init() {

    createDeck();

    shuffle(deck);

    dealCards();

    startDiscardPile();

    render();

    document
        .getElementById("draw-btn")
        .addEventListener(
            "click",
            playerDraw
        );

    updateStatus("Your Turn");
}

init();