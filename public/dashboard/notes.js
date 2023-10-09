/* Notes delen */
// Select the element with the class 'createBox' and get the first matching element
let createBox = document.getElementsByClassName('createBox')[0];

// Select the element with the class 'notes' and get the first matching element
let notes = document.getElementsByClassName('notes')[0];

// Select the element with the ID 'userInput'
let input = document.getElementById('userInput');

// Initialize a variable to keep track of the color index
let iColor = 0;
const randomColor = [
    "rgb(194, 255, 61)",
    "rgb(255, 61, 232)",
    "rgb(61, 194, 255)",
    "rgb(4, 224, 34)",
    "rgb(188, 131, 230)",
    "rgb(235, 179, 40)"
];

// Add a 'click' event listener to the element with the ID 'create'
document.getElementById("create").addEventListener("click", function () {
    // Display the 'createBox' element by setting its style to "block"
    createBox.style.display = "block";
});

// Function to generate a random color
function color(color) {
    // Check if the index 'i' exceeds the color array length, and reset it if necessary
    if (color > randomColor.length - 1) {
        color = 0;
    }
    iColor++
    // Return the color
    return randomColor[color];
}

// Function to create and style a new note
function divStyle(note) {
    let div = document.createElement('div');
    div.className = 'note';
    div.setAttribute('data-note-id', note.id);
    // Track whether the note is being edited
    div.setAttribute('data-editing', 'false');
    div.setAttribute('draggable', 'true');
    div.addEventListener('dragstart', function (event) {
        // Check if the note is being edited, and if so, prevent the drag operation
        if (div.getAttribute('data-editing') === 'false') {
            event.dataTransfer.setData('text/plain', note.id);
        } else {
            event.preventDefault();
        }
    });
    // Set the inner HTML with a div for the note, h3 for its text, and a button for color cycling
    div.innerHTML = `
        <div class="details">
            <button class="colorButton"></button>
            <h3 class="note-text" contenteditable="false">${note.text}</h3>
        </div>
    `;
    // Set the background color of the note
    div.setAttribute('style', `background-color: ${note.color}`)
    // Append the new note to the 'notes' container
    notes.appendChild(div);

    // Add a 'dblclick' event listener to the new 'div' element for removing the note
    div.addEventListener('dblclick', async function (event) {
        if (div.getAttribute('data-editing') === 'false') {
            // Check if the double-click target is not the color change button
            if (!event.target.classList.contains('colorButton')) {
                // Get the note's ID from the data attribute
                const noteId = div.getAttribute('data-note-id');
                // Call a function to delete the note from the database
                await deleteNoteFromDatabase(noteId);
                // Call a function to Websocket server for broadcasting the deletion
                await sendWebSocketDeleteMessage(noteId);
                // Remove the note from the DOM
                div.remove();
            }
        }
    });

    // Add a 'drag' event listener to continuously track and update the note's position during drag
    div.addEventListener('drag', function (event) {
        const noteId = div.getAttribute('data-note-id');

        // Calculate the position to center the note around the mouse cursor
        const newPosition = {
            left: (event.clientX - div.offsetWidth / 2) + 'px',
            top: (event.clientY - div.offsetHeight / 2) + 'px'
        };

        // Set the new position of the note
        div.style.position = 'absolute';
        div.style.left = newPosition.left;
        div.style.top = newPosition.top;

        // Call a function to send the note's position to the server continuously
        sendWebSocketPositionMessage(noteId, newPosition);
    });

    // Add a 'dragend' event listener to send the final note's position to the server
    div.addEventListener('dragend', async function (event) {
        const noteId = div.getAttribute('data-note-id');

        // Calculate the final position based on the mouse cursor position
        const finalPosition = {
            left: (event.clientX - div.offsetWidth / 2) + 'px',
            top: (event.clientY - div.offsetHeight / 2) + 'px'
        };

        // Set the final position of the note
        div.style.position = 'absolute';
        div.style.left = finalPosition.left;
        div.style.top = finalPosition.top;

        // Call a function to send the final note's position to the server
        await sendWebSocketPositionMessage(noteId, finalPosition);
    });

    // Add a 'click' event listener to the new 'div' element for editing the note
    div.addEventListener('click', function (event) {
        // Check if the click target is the h3 element
        if (event.target.tagName === 'H3') {
            if (div.getAttribute('data-editing') === 'false') {
                div.setAttribute('data-editing', 'true');
                const h3 = div.querySelector('h3');
                h3.contentEditable = 'plaintext-only';
                h3.focus();

                // Add a 'keydown' event listener to the h3 element for finishing editing
                h3.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        h3.blur();
                    }
                });

                // Add a 'blur' event listener to the h3 element for finishing editing
                h3.addEventListener('blur', async function () {
                    const editedText = h3.innerText.trim();
                    const editedNoteId = div.getAttribute('data-note-id');
                    div.setAttribute('data-editing', 'false');
                    h3.contentEditable = 'false';

                    // Call a function to patch the edited note in the database
                    await patchNoteInDatabase(editedNoteId, editedText);
                });
            }
        }
    });

    // Add a 'click' event listener to the color button for changing the note color
    const colorButton = div.querySelector('.colorButton')
    colorButton.addEventListener('dblclick', function (event) {
        // Prevent the double-click event from bubbling up to the parent div
        event.stopPropagation();
    });
    colorButton.addEventListener('click', async function (event) {
        const currentColorIndex = randomColor.indexOf(div.style.backgroundColor);
        const nextColorIndex = (currentColorIndex + 1) % randomColor.length;
        const newColor = randomColor[nextColorIndex];

        // Set the background color of the note
        div.setAttribute('style', `background-color: ${newColor}`);

        // Set the new color for the color button
        colorButton.style.backgroundColor = randomColor[((nextColorIndex + 1) % randomColor.length)];

        // Call a function to patch the color of the note in the database
        await patchNoteColorInDatabase(note.id, newColor);
    });

    const currentColorIndex = randomColor.indexOf(note.color);
    const nextColorIndex = (currentColorIndex + 1) % randomColor.length;
    colorButton.style.backgroundColor = randomColor[nextColorIndex];
    colorButton.style.width = '20px';
    colorButton.style.height = '20px';
    colorButton.style.margin = '5px';
    colorButton.style.border = '1px solid #000';
    colorButton.style.borderRadius = '3px';
    colorButton.style.float = 'right';
}

// Function to remove a note by its ID
function divRemove(noteId) {
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`)
    if (noteElement) {
        noteElement.remove()
    } else {
        console.log('Note element not found for ID:', noteId)
    }
}

// Function to edit a note
function divEdit(note) {
    const noteElement = document.querySelector(`[data-note-id="${note.id}"]`)
    if (noteElement) {
        noteElement.querySelector('h3').innerHTML = note.text
        noteElement.setAttribute('style', `background-color: ${note.color}`);
    } else {
        console.log('Note element not found for ID:', note.id)
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

// Function to send WebSocket edit message
async function sendWebSocketEditMessage(note) {
    if (socket.readyState === WebSocket.OPEN) {
        // Send a WebSocket message to the server to broadcast the note edit
        socket.send(JSON.stringify({
            type: 'editNote',
            text: note.text,
            color: note.color,
            id: note.id,
            board: note.boardIds[0]
        }));
    } else {
        console.error('WebSocket is not open yet. Wait for the connection to establish.');
    }
}

// Function to handle the 'keydown' event
document.querySelector('.createBox').addEventListener('keydown', async (e) => {
    // Check if the key code of the pressed key is '13' (Enter key)
    if (e && e.keyCode == 13) {
        noteText = input.value
        noteColor = color(iColor)
        // Call postNote to save the note to the server/database
        await postNote();
        // Clear the input field
        input.value = ""
        // Hide the 'createBox' element by setting its style to "none"
        createBox.style.display = "none"
    }
})

// Add a 'dragover' event listener to the 'notes' container
document.addEventListener('dragover', function (event) {
    event.preventDefault(); // Prevent the default behavior to allow dropping
});

// Add a 'drop' event listener to the document to handle the drop operation
document.addEventListener('drop', function (event) {
    event.preventDefault();
    const noteId = event.dataTransfer.getData('text/plain');
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);

    if (noteElement) {
        // Set the new position of the note based on the mouse cursor position
        noteElement.style.position = 'absolute';
        noteElement.style.left = (event.clientX - noteElement.offsetWidth / 2) + 'px';
        noteElement.style.top = (event.clientY - noteElement.offsetHeight / 2) + 'px';
    }
});

// Update the WebSocket position message sending function to accept continuous updates
async function sendWebSocketPositionMessage(noteId, position) {
    if (socket.readyState === WebSocket.OPEN) {
        // Send a WebSocket message to the server to broadcast the note's position
        socket.send(JSON.stringify({
            type: 'moveNote',
            id: noteId,
            position: position
        }));
    } else {
        console.error('WebSocket is not open yet. Wait for the connection to establish.');
    }
}