// Defining API endpoint URLs
const port =3030;
const apiUrl = `https://localhost:${port}`
const loginEndpoint = '/users/login';
const boardsEndpoint = '/boards';

// Handle user login
async function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try{
        const response = await fetch(`${apiUrl}${loginEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            const token = data.token;
            // Store token in localStorage
            localStorage.setItem('token', token);
            //Redirect to WebSocket page? kanske
        } else {
            // Handle login error, kanske onödig om vi ren har en catch?
            console.error('Login failed');
        }
    } catch (error) {
        console.error(error);
    }
}

// Fetch user's boards
async function fetchBoards() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirect to the login page if the user is not authenticated
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}${boardsEndpoint}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            const boards = data.boards;
            // Display the user's boards in the UI
            renderBoards(boards);
        } else {
            // Handle authentication error
            console.error('Authentication failed');
            // Redirect to the login page
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
// Render the user's boards in the UI
function renderBoards(boards) {
    const boardList = document.getElementById('board-list');
    boardList.innerHTML = '';

    boards.forEach((board) => {
        const boardItem = document.createElement('li');
        boardItem.textContent = board.name;
        boardList.appendChild(boardItem);
    });
}

// Event listeners and initialization of the app
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginUser();
    });
// Fetch and display user's boards when the page is loaded
    fetchBoards();
});