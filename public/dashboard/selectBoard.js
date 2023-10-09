// Define a global variable to store board data
let boardData = [];

// Define the addBoardsFromArray function
function addBoardsFromArray(boardData) {
    var dropdown = document.getElementById("boardDropdown");

    // Clear existing options
    dropdown.innerHTML = "";

    // Add options from the array
    boardData.forEach(function (board) {
        var option = document.createElement("option");
        option.value = board.name; // Use board name for dropdown
        option.text = board.name; // Use board name for dropdown
        option.setAttribute("id", board.id); // Set board ID as an attribute
        dropdown.add(option);

        // Create corresponding boards in the document
        var boardDiv = document.createElement("div");
        boardDiv.id = board.name; // Use board name for div ID
        boardDiv.className = "board";
        document.body.appendChild(boardDiv);
    });
}

// Define the createArrayFromBoards function
async function createArrayFromBoards(boardIds) {
    const userBoards = [];

    // Fetch board names and IDs based on board IDs
    for (const boardId of boardIds) {
        try {
            const response = await fetch(`http://localhost:3030/boards/${boardId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${WS_TOKEN}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.board && data.board.name) {
                    userBoards.push({ id: data.board.id, name: data.board.name });
                } else {
                    console.error(`Board name not found in data for board ID ${boardId}.`);
                }
            } else {
                console.error(`Failed to fetch board name for board ID ${boardId}.`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Store board data globally
    boardData = userBoards;

    // Add boards to the dropdown and document
    addBoardsFromArray(boardData);
}



// Add data attribute to notes to associate them with a board
const boardNotes = document.querySelectorAll('.note');
boardNotes.forEach(function (note) {
    const boardId = note.getAttribute('data-board-id');
    note.dataset.boardId = boardId;
});

async function changeBoard() {
    const dropdown = document.getElementById("boardDropdown");
    const selectedBoardId = dropdown.selectedOptions[0].id;
    localStorage.setItem('currentBoard', selectedBoardId);

    // Show notes for the selected board and hide notes for others
    const notes = document.querySelectorAll('.note');
    notes.forEach(e => e.remove());

    // Fetch and display notes for the selected board
    try {
        const response = await fetch(`http://localhost:3030/notes/${selectedBoardId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${WS_TOKEN}`
            },
        });
        if (response.ok) {
            const data = await response.json();
            data.notes.forEach(note => {
                divStyle(note);
            });
        } else {
            console.error("Failed to fetch notes for the selected board.");
        }
    } catch (error) {
        console.error(error);
    }
}

// Call the createArrayFromBoards function with your boardIds
createArrayFromBoards(boardIds);
