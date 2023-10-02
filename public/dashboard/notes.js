// Select the element with the class 'createBox' and get the first matching element
/*let createBox = document.getElementsByClassName('createBox')[0];

// Select the element with the class 'notes' and get the first matching element
let notes = document.getElementsByClassName('notes')[0];

// Select the element with the ID 'userInput'
let input = document.getElementById('userInput');

// Initialize a variable to keep track of the color index
let i = 0;

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

// Add a 'keydown' event listener to the 'createBox' element
createBox.addEventListener('keydown', content);

// Add a 'click' event listener to the element with the ID 'create'
document.getElementById("create").addEventListener("click", function () {
    // Display the 'createBox' element by setting its style to "block"
    createBox.style.display = "block";
});

// Function to handle the 'keydown' event
function content(e) {
    // Check if the key code of the pressed key is '13' (Enter key)
    if (e.keyCode == 13) {
        // Call the 'divStyle' function with the input value
        const noteText = input.value;

        // Create a new note locally on the client
        divStyle(noteText);

        // Send a WebSocket message to the server to broadcast the note creation
        socket.send(JSON.stringify({
            type: 'createNote',
            text: noteText,
        }));

        // Clear the input field
        input.value = "";
        // Hide the 'createBox' element by setting its style to "none"
        createBox.style.display = "none";
    }
}

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
*/