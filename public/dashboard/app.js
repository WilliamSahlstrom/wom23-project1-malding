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
            console.log("här: ", boardIds, payload.email)
            localStorage.setItem('currentBoard', boardIds[0])
            localStorage.setItem('userEmail', payload.email)
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

//console.log(WS_URL)
let noteText;
let noteId;

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
                for (let i = 0; i < data.notes.length; i++) {
                    if (note.id == data.notes[i].id) {
                        console.log(data.notes[i].text);
                        divStyle(data.notes[i].text, data.notes[i].id);
                    }
                }
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
                text: noteText
            })
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data.note);
            noteId = data.note.id
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
            console.log(`Note with ID ${data.note.id} deleted successfully.`);
            noteId = data.note.id
        } else {
            console.error(`Failed to delete note with ID ${noteId}.`);
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
        // Call divStyle to create the note on all clients when a "createNote" message is received
        divStyle(data.text, data.id);
    }

    if (data.type === 'selectBoard') {
        test();
    }

    if (data.type === 'deleteNote') {
        // Remove the note from the DOM on the client if it exists
        divRemove(data.id);
    }

    if (data.type === 'addUser') {
        if (data.email === payload.email) updateAddedUsersClient(data.email)
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

/* Notes delen */
// Select the element with the class 'createBox' and get the first matching element
let createBox = document.getElementsByClassName('createBox')[0];

// Select the element with the class 'notes' and get the first matching element
let notes = document.getElementsByClassName('notes')[0];

// Select the element with the ID 'userInput'
let input = document.getElementById('userInput');

// Initialize a variable to keep track of the color index
let i = 0;

// Add a 'click' event listener to the element with the ID 'create'
document.getElementById("create").addEventListener("click", function () {
    // Display the 'createBox' element by setting its style to "block"
    createBox.style.display = "block";
});

// Function to generate a random color
function color() {
    let randomColor = ["#c2ff3d", "#ff3de8", "3dc2ff", "#04e022", "#bc83e6", "#ebb328"];
    // Check if the index 'i' exceeds the color array length, and reset it if necessary
    if (i > randomColor.length - 1) {
        i = 0;
    }
    // Return the color at the current index and increment 'i'
    return randomColor[i++];
}

// Function to create and style a new note
function divStyle(text, noteId) {
    // Create a new 'div' element
    let div = document.createElement('div');
    // Add a class 'note' to the new 'div' element
    div.className = 'note';
    // Set the inner HTML of the 'div' element with the provided text
    div.innerHTML = '<div class="details">' + '<h3>' + text + '<h3>' + '</div>';

    div.setAttribute('data-note-id', noteId);
    // Add a 'dblclick' event listener to the new 'div' element for removing the note
    div.addEventListener('dblclick', async function () {
        // Get the note's ID from the data attribute
        const noteId = div.getAttribute('data-note-id');
        console.log(noteId);
        // Call a function to delete the note from the database
        await deleteNoteFromDatabase(noteId);

        await sendWebSocketDeleteMessage(noteId)
        // Remove the clicked note from the DOM
        div.remove();
    });

    // Set the background color of the 'div' element using the 'color' function
    div.setAttribute('style', 'background:' + color() + '');

    // Append the new 'div' element to the 'notes' container
    notes.appendChild(div);
}

// Function to remove a note by its ID
function divRemove(noteId) {
    console.log('Removing note with ID:', noteId);
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (noteElement) {
        console.log('Found element to remove:', noteElement);
        noteElement.remove();
    } else {
        console.log('Note element not found for ID:', noteId);
    }
}

// Modify the sendWebSocketMessage function to only send WebSocket message
async function sendWebSocketMessage() {
    if (socket.readyState === WebSocket.OPEN) {
        // Send a WebSocket message to the server to broadcast the note creation
        socket.send(JSON.stringify({
            type: 'createNote',
            text: noteText,
            id: noteId
        }));
    } else {
        console.error('WebSocket is not open yet. Wait for the connection to establish.');
    }
}

async function sendWebSocketDeleteMessage(noteId) {
    if (socket.readyState === WebSocket.OPEN) {
        // Send a WebSocket message to the server to broadcast the note deletion
        socket.send(JSON.stringify({
            type: 'deleteNote',
            id: noteId,
        }));
    } else {
        console.error('WebSocket is not open yet. Wait for the connection to establish.');
    }
}

// Function to handle the 'keydown' event
document.querySelector('.createBox').addEventListener('keydown', async (e) => {
    // Check if the key code of the pressed key is '13' (Enter key)
    if (e && e.keyCode == 13) {
        // Call the 'divStyle' function with the input value
        noteText = input.value;
        // Call postNote to save the note to the server/database
        await postNote();
        // Create a new note locally on the client
        divStyle(noteText, noteId);
        // Clear the input field
        input.value = "";
        // Hide the 'createBox' element by setting its style to "none"
        createBox.style.display = "none";
        // Now, call the function to send the WebSocket message
        sendWebSocketMessage();
    }
})