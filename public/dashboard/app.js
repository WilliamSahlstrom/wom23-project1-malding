/*if (!localStorage.getItem('access_token')) {
            localStorage.setItem('access_token', urlParams.get('access_token'));
        }
        if (!localStorage.getItem('board')) {
            localStorage.setItem('board', urlParams.get('board'));
        }*/

// hårdkodat för test, sätt in i WS_TOKEN i .env
let WS_TOKEN = localStorage.getItem('access_token');
let payload;
let boardIds
if (WS_TOKEN) {
    try {
        const tokenParts = WS_TOKEN.split('.');
        payload = JSON.parse(atob(tokenParts[1]));
        boardIds = payload.boardIds;
        console.log(boardIds);
    } catch (e) {
        console.error(e);
    }
} else {
    console.error('JWT token not found in localStorage.');
}

const boardIdsString = boardIds.join('&board=');
// Construct the URL with boardIds as URL parameters
const baseUrl = `wss://malding-ws-api.azurewebsites.net?access_token=${WS_TOKEN}`;
const WS_URL = `${baseUrl}&board=${boardIdsString}`;
console.log('Constructed URL with boardIds:', WS_URL);

//console.log(WS_TOKEN)
//console.log(board)

// wss = SSL-krypterad
// WS_URL = `wss://ws-pastebin-niklas.azurewebsites.net?token=${WS_TOKEN}`

//console.log(WS_URL)

// Create a WebSocket connection
const socket = new WebSocket(WS_URL);

// Connection established 
socket.onopen = function (event) {
    console.log('Connected to WebSocket server', event);

    if (socket.readyState === WebSocket.OPEN) {
        content();
        // Send a WebSocket message to the server to broadcast the note creation
        socket.send(JSON.stringify({
            type: 'createNote',
            text: noteText,
        }));
    } else {
        console.error('WebSocket is not open yet. Wait for the connection to establish.');
    }
};
// Function to handle WebSocket messages
socket.onmessage = function (event) {
    console.log('Received message:', event.data);
    const data = JSON.parse(event.data);

    if (data.type == 'error') {
        // Handle error messages if needed
        console.log(data.msg);
    } else if (data.type == 'createNote') {
        // Call divStyle to create the note on all clients when a "createNote" message is received
        divStyle(data.text);
    }
};
// Connection closed 
socket.onclose = function (event) {
    console.log('Connection closed');
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
function divStyle(text) {
    // Create a new 'div' element
    let div = document.createElement('div');
    // Add a class 'note' to the new 'div' element
    div.className = 'note';
    // Set the inner HTML of the 'div' element with the provided text
    div.innerHTML = '<div class="details">' + '<h3>' + text + '<h3>' + '</div>';

    // Add a 'dblclick' event listener to the new 'div' element for removing the note
    div.addEventListener('dblclick', function () {
        div.remove();
    });

    // Set the background color of the 'div' element using the 'color' function
    div.setAttribute('style', 'background:' + color() + '');

    // Append the new 'div' element to the 'notes' container
    notes.appendChild(div);
}

// Add a 'keydown' event listener to the 'createBox' element
createBox.addEventListener('keydown', content);

// Function to handle the 'keydown' event
function content(e) {
    // Check if the key code of the pressed key is '13' (Enter key)
    if (e.keyCode == 13) {

        // Call the 'divStyle' function with the input value
        const noteText = input.value;
        // Create a new note locally on the client
        divStyle(noteText);
        // Clear the input field
        input.value = "";
        // Hide the 'createBox' element by setting its style to "none"
        createBox.style.display = "none";

    }
}