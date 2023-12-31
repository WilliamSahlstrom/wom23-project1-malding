let WS_TOKEN = localStorage.getItem('access_token');
let payload;
let boardIds;

parsePayload(WS_TOKEN);
//Check if the JWT is in local storage and retrieve the payload
async function parsePayload(token) {
    if (token) {
        try {
            const tokenParts = token.split('.');
            payload = JSON.parse(atob(tokenParts[1]));
            boardIds = payload.boardIds;
            localStorage.setItem('currentBoard', boardIds[0]);
        } catch (e) {
            console.error(e);
        }
    } else {
        console.error('JWT token not found in localStorage.');
    }
}


const boardIdsString = boardIds.join('&board=');
// Construct the URL with boardIds as URL parameters
const baseUrl = `wss://malding-ws-api.azurewebsites.net?access_token=${WS_TOKEN}`;
const WS_URL = `ws://localhost:5500?access_token=${WS_TOKEN}&board=${boardIdsString}`;


let noteText;
let noteId;
let noteColor;
//Retrieve the notes from the board saved in localStorage
async function getNotes() {
    try {
        const boardId = localStorage.getItem('currentBoard');
        const response = await fetch(`http://localhost:3030/notes/${boardId}`, {
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
            })
        } else {
            console.error("not good :(");
        }
    } catch (error) {
        console.error(error);
    }
}
//Post the notes
async function postNote() {
    try {
        const boardId = localStorage.getItem('currentBoard');
        const response = await fetch(`http://localhost:3030/notes/${boardId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${WS_TOKEN}`
            },
            body: JSON.stringify({
                text: noteText,
                color: noteColor,
            })
        });
        if (response.ok) {
            const data = await response.json();
            // Create a new note locally on the client
            divStyle(data.note);
            // Now, call the function to send the WebSocket message
            sendWebSocketMessage(data.note);
        } else {
            console.error(`Failed to create note`);
        }
    } catch (error) {
        console.error(error);
    }
}
async function deleteNoteFromDatabase(noteId) {
    try {
        const response = await fetch(`http://localhost:3030/notes/${noteId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${WS_TOKEN}`
            }
        });
        if (response.ok) {
            const data = await response.json();
        } else {
            console.error(`Failed to delete note with ID ${noteId}.`);
        }
    } catch (error) {
        console.error(error);
    }
}
async function patchNoteInDatabase(noteId, editedText) {
    try {
        const response = await fetch(`http://localhost:3030/notes/${noteId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${WS_TOKEN}`
            },
            body: JSON.stringify({
                text: editedText,
            })
        });
        if (response.ok) {
            const data = await response.json();
            // Call a function to Websocket server for broadcasting the edit
            await sendWebSocketEditMessage(data.note);
        } else {
            console.error(`Failed to edit note with ID ${noteId}.`);
        }
    } catch (error) {
        console.error(error);
    }
}

// Function to patch the color of the note in the database
async function patchNoteColorInDatabase(noteId, newColor) {
    try {
        const response = await fetch(`http://localhost:3030/notes/${noteId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${WS_TOKEN}`
            },
            body: JSON.stringify({
                color: newColor,
            })
        });
        if (response.ok) {
            const data = await response.json();
            const noteDiv = document.querySelector(`[data-note-id="${noteId}"]`);
            // Set the background color using setAttribute
            noteDiv.setAttribute('style', `background-color: ${newColor}`);
            // Call a function to Websocket server for broadcasting the color change
            await sendWebSocketEditMessage(data.note);
        } else {
            console.error(`Failed to patch note color with ID ${noteId}.`);
        }
    } catch (error) {
        console.error(error);
    }
}

/* Websocket delen */
// Create a WebSocket connection
const socket = new WebSocket(WS_URL, ['Bearer', WS_TOKEN]);

// Connection established 
socket.onopen = function (event) {
    console.log('Connected to WebSocket server', event);
    getNotes();
};

// Function to handle WebSocket messages
socket.onmessage = function (event) {
    console.log('Received message:', event.data);
    const data = JSON.parse(event.data);
    console.log(data);

    if (data.type === 'createNote') {
        // Call divStyle to create note on all clients who have currently selected the board
        // that was updated when a "createNote" message is received
        if (localStorage.getItem('currentBoard') === data.board) divStyle(data);
    }

    if (data.type === 'editNote') {
        if (localStorage.getItem('currentBoard') === data.board) divEdit(data);
    }

    if (data.type === 'deleteNote') {
        // Remove the note from the DOM on the client if it exists
        divRemove(data.id);
    }

    if (data.type === 'moveNote') {
        const noteElement = document.querySelector(`[data-note-id="${data.id}"]`);
        if (noteElement) {
            // Set the new position of the note based on the mouse cursor position
            noteElement.style.position = 'absolute';
            noteElement.style.left = data.position.left;
            noteElement.style.top = data.position.top;
        }
    }

    if (data.type === 'selectBoard') {
        getNotes();
    }

    if (data.type === 'addUser') {
        if (data.email === payload.email) {
            updateAddedUsersClient(data.email);
            sendWebSocketUpdateMyClient(data);
        }
    }

    if (data.type === 'error') {
        console.log('Error' + data.type);
    }
};

// Handle WebSocket errors
socket.onerror = function (error) {
    console.error('WebSocket error:', error);
};

// Connection closed 
socket.onclose = function (event) {
    console.log('Connection closed');
};

// Function to send WebSocket creation message
async function sendWebSocketUpdateMyClient(data) {
    if (socket.readyState === WebSocket.OPEN) {
        // WebSocket message to broadcast the note creation
        socket.send(JSON.stringify({
            type: 'updateUserToBoard',
            board: data.board
        }));
    } else {
        console.error('WebSocket is not open yet. Wait for the connection to establish.');
    }
}