createArrayFromBoards(boardIds)

function createArrayFromBoards(boards) {
    const userBoards = []
    boards.forEach(board => {
        userBoards.push(board)
    })
    addBoardsFromArray(userBoards);
}

function addBoardsFromArray(boardNames) {
    var dropdown = document.getElementById("boardDropdown");

    // Clear existing options
    dropdown.innerHTML = "";

    // Add options from the array
    boardNames.forEach(function (boardName) {
        var option = document.createElement("option");
        option.setAttribute("id", boardName);
        option.value = boardName;
        option.text = boardName;
        dropdown.add(option);

        // Create corresponding boards in the document
        var board = document.createElement("div");
        board.id = boardName;
        board.className = "board";
        document.body.appendChild(board);
    });
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
            console.log(data.notes);
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
