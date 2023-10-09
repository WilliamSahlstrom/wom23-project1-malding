// hårdkodat för test, sätt in i WS_TOKEN i .env
let WS_TOKEN = localStorage.getItem('access_token')
let payload
let boardIds

parsePayload(WS_TOKEN)
// Checkar om JWT finns i localstorage och hämtar payloaden
async function parsePayload(token) {
    if (token) {
        try {
            const tokenParts = token.split('.')
            payload = JSON.parse(atob(tokenParts[1]))
            boardIds = payload.boardIds
            localStorage.setItem('currentBoard', boardIds[0])
        } catch (e) {
            console.error(e)
        }
    } else {
        console.error('JWT token not found in localStorage.')
    }
}


const boardIdsString = boardIds.join('&board=')
// Construct the URL with boardIds as URL parameters
const baseUrl = `wss://malding-ws-api.azurewebsites.net?access_token=${WS_TOKEN}`
const WS_URL = `ws://localhost:5500?access_token=${WS_TOKEN}&board=${boardIdsString}`
console.log('Constructed URL with boardIds:', WS_URL)


let noteText;
let noteId;
let noteColor;
// Hämtar notes för den boarden som sparats i localstorage 
// och när man bytit board via dropdown
async function test() {
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
            console.log(data.note);
            // Create a new note locally on the client
            divStyle(data.note);
            // Now, call the function to send the WebSocket message
            sendWebSocketMessage(data.note);
        } else {
            console.error("not good :(");
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
            console.log(`Note with ID ${noteId} deleted successfully from board with ID ${data.board.id}.`);
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
            console.log(`Note with ID ${data.note.id} edited successfully on board with ID ${data.note.boardIds[0]}.`);
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
            console.log(`Note with ID ${noteId} color patched successfully on board with ID ${data.note.boardIds[0]}.`);
            const noteDiv = document.querySelector(`[data-note-id="${noteId}"]`)
            // Set the background color using setAttribute
            noteDiv.setAttribute('style', `background-color: ${newColor}`)
            // Call a function to Websocket server for broadcasting the color change
            await sendWebSocketEditMessage(data.note)
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
    test();
};

// Function to handle WebSocket messages
socket.onmessage = function (event) {
    console.log('Received message:', event.data);
    const data = JSON.parse(event.data);
    console.log(data)

    if (data.type === 'createNote') {
        // Call divStyle to create note on all clients who have currently selected the board
        // that was updated when a "createNote" message is received
        if (localStorage.getItem('currentBoard') === data.board) divStyle(data)
    }

    if (data.type === 'editNote') {
        if (localStorage.getItem('currentBoard') === data.board) divEdit(data)
    }

    if (data.type === 'deleteNote') {
        // Remove the note from the DOM on the client if it exists
        divRemove(data.id);
    }

    if (data.type === 'moveNote') {
        const noteElement = document.querySelector(`[data-note-id="${data.id}"]`)
        if (noteElement) {
            // Set the new position of the note based on the mouse cursor position
            noteElement.style.position = 'absolute';
            noteElement.style.left = data.position.left;
            noteElement.style.top = data.position.top;
        }
    }

    if (data.type === 'selectBoard') {
        test();
    }

    if (data.type === 'addUser') {
        if (data.email === payload.email) {
            updateAddedUsersClient(data.email)
            sendWebSocketUpdateMyClient(data)
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
    if (event.wasClean) {
        console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
    } else {
        console.error('Connection abruptly closed');
    }
};

// Function to send WebSocket creation message
async function sendWebSocketUpdateMyClient(data) {
    if (socket.readyState === WebSocket.OPEN) {
        // Send a WebSocket message to the server to broadcast the note creation
        socket.send(JSON.stringify({
            type: 'updateUserToBoard',
            board: data.board
        }));
    } else {
        console.error('WebSocket is not open yet. Wait for the connection to establish.');
    }
}