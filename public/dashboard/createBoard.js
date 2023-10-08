// Get references to the relevant HTML elements
const createNewBoardBtn = document.querySelector('#createNewBoard');
const createNewBoardPopup = document.querySelector('#createNewBoardPopup');
const closeCreateNewBoardPopupBtn = document.querySelector('#closeCreateNewBoardPopup');
const createNewBoardForm = document.querySelector('#createNewBoardForm');
const newBoardNameInput = document.querySelector('#newBoardName');

// Function to open the "Create New Board" popup
function openCreateNewBoardPopup() {
    createNewBoardPopup.style.display = 'block';
}

// Function to close the "Create New Board" popup
function closeCreateNewBoardPopup() {
    createNewBoardPopup.style.display = 'none';
}

// Add a click event listener to the "Create New Board" button to open the popup
createNewBoardBtn.addEventListener('click', openCreateNewBoardPopup);

// Add a click event listener to the "Close" button within the "Create New Board" popup to close it
closeCreateNewBoardPopupBtn.addEventListener('click', closeCreateNewBoardPopup);

// Add a submit event listener to the "Create New Board" form
createNewBoardForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get the value entered by the user for the new board name
    const newBoardName = newBoardNameInput.value;
    console.log(newBoardName);

    // Perform validation if needed

    try {
        // Send a POST request to create a new board
        const response = await fetch('http://localhost:3030/boards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WS_TOKEN}` // Include your authorization token
            },
            body: JSON.stringify({
                name: newBoardName
            })
        });

        if (response.ok) {
            // Board created successfully
            alert('Board created successfully!');
            // Close the "Create New Board" popup
            closeCreateNewBoardPopup();
            // Optionally, you can perform additional actions like updating the board list.
        } else {
            // Handle errors if the board creation request fails
            alert('Board creation failed. Please try again.');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
});
