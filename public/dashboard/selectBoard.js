const url = WS_URL.slice(1)
        const urlParams = new URLSearchParams(url.slice(url.indexOf("?") + 1));
        console.log(urlParams.getAll('board'))

        boards = urlParams.getAll('board');
        const userBoards = []
        boards.forEach(board => {
            userBoards.push(board)
        })
        
        addBoardsFromArray(userBoards);

function addBoardsFromArray(boardNames) {
    var dropdown = document.getElementById("boardDropdown");

    // Clear existing options
    dropdown.innerHTML = "";

    // Add options from the array
    boardNames.forEach(function (boardName) {
        var option = document.createElement("option");
        option.value = boardName;
        option.text = boardName;
        dropdown.add(option);
    });

    // Add corresponding boards to the document
    boardNames.forEach(function (boardName) {
        var board = document.createElement("div");
        board.id = boardName;
        board.className = "board";
        document.body.appendChild(board);
    });
}
function changeBoard() {
    // Hide all notes and input fields when changing boards
    var boards = document.querySelectorAll('.board');
    console.log(boards);
    boards.forEach(function (board) {
        board.classList.remove('active');
        var notes = board.querySelectorAll('.note');
        notes.forEach(function (note) {
            note.style.display = 'none';
        });
    });
}