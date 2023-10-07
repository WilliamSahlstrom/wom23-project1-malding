/* Notes delen */
// Select the element with the class 'createBox' and get the first matching element
let createBox = document.getElementsByClassName('createBox')[0];

// Select the element with the class 'notes' and get the first matching element
let notes = document.getElementsByClassName('notes')[0];

// Select the element with the ID 'userInput'
let input = document.getElementById('userInput');

// Initialize a variable to keep track of the color index
let iColor = 0;

// Add a 'click' event listener to the element with the ID 'create'
document.getElementById("create").addEventListener("click", function () {
    // Display the 'createBox' element by setting its style to "block"
    createBox.style.display = "block";
});

// Function to generate a random color
function color() {
    let randomColor = ["#c2ff3d", "#ff3de8", "3dc2ff", "#04e022", "#bc83e6", "#ebb328"];
    // Check if the index 'i' exceeds the color array length, and reset it if necessary
    if (iColor > randomColor.length - 1) {
        iColor = 0;
    }
    // Return the color at the current index and increment 'i'
    return randomColor[iColor++];
}

// Function to create and style a new note
function divStyle(note) {
    let div = document.createElement('div');
    div.className = 'note';
    div.setAttribute('data-note-id', note.id);
    // Set the inner HTML with a div for the note and h3 for its text
    div.innerHTML = '<div class="details">' + '<h3>' + note.text + '<h3>' + '</div>';
    // Set the background color of the note
    div.setAttribute('style', 'background:' + note.color + '');
    // Append the new note to the 'notes' container
    notes.appendChild(div);

    // Add a 'dblclick' event listener to the new 'div' element for removing the note
    div.addEventListener('dblclick', async function () {
        // Get the note's ID from the data attribute
        const noteId = div.getAttribute('data-note-id');
        console.log(noteId);
        // Call a function to delete the note from the database
        await deleteNoteFromDatabase(noteId);
        // Call a function to Websocket server for broadcasting the deletion
        await sendWebSocketDeleteMessage(noteId)
        // Remove the note from the DOM
        div.remove();
    });
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

// Function to send WebSocket creation message
async function sendWebSocketMessage(note) {
    if (socket.readyState === WebSocket.OPEN) {
        // Send a WebSocket message to the server to broadcast the note creation
        socket.send(JSON.stringify({
            type: 'createNote',
            text: note.text,
            color: note.color,
            id: note.id,
            board: note.boardIds[0]
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
        noteText = input.value;
        noteColor = color();
        // Call postNote to save the note to the server/database
        await postNote();
        // Clear the input field
        input.value = "";
        // Hide the 'createBox' element by setting its style to "none"
        createBox.style.display = "none";
    }
})