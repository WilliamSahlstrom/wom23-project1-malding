/* Add user to board delen */
// Patchar boarden med addade användaren
async function addUser(userEmail) {
    try {
        const boardId = localStorage.getItem('currentBoard');
        const response = await fetch(`http://localhost:3030/boards/${boardId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${WS_TOKEN}`
            },
            body: JSON.stringify({
                email: userEmail
            })
        });
        if (response.ok) {
            const data = await response.json();
            sendWebSocketAddUserMessage(data);
        } else {
            console.error("not good :(");
        }
    } catch (error) {
        console.error(error);
    }
}

// Skickar datan till websocket servern
async function sendWebSocketAddUserMessage(data) {
    if (socket.readyState === WebSocket.OPEN) {
        // Datan som blir broadcastad till varje client
        socket.send(JSON.stringify({
            type: 'addUser',
            email: data.user.email,
            board: data.board.id
        }));
    } else {
        console.error('WebSocket is not open yet. Wait for the connection to establish.');
    }
}

// Hämtar updaterade jwtn efter användaren addats till en ny board
async function updateAddedUsersClient(userEmail) {
    try {
        const response = await fetch(`http://localhost:3030/boards`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${WS_TOKEN}`
            }
        });
        if (response.ok) {
            const data = await response.json()
            localStorage.setItem("access_token", data.token)
            WS_TOKEN = localStorage.getItem("access_token")
            parsePayload(WS_TOKEN)
            createArrayFromBoards(boardIds)
        } else {
            console.error("user not found");
        }
    } catch (error) {
        console.error(error);
    }
}

// Addar efter DOM:en laddats eventlisteners för Add User knappen 
// och för popup windown som öppnas från den
document.addEventListener('DOMContentLoaded', function () {
    const addUserBtn = document.getElementById('addUserBtn');
    const addUserPopup = document.getElementById('addUserPopup');

    addUserBtn.addEventListener('click', function () {
        addUserPopup.style.display = 'flex';
    });

    const cancelAddUserBtn = document.getElementById('cancelAddUserBtn');
    cancelAddUserBtn.addEventListener('click', function () {
        addUserPopup.style.display = 'none';
    });
});

// Hanterar användarens handlingar i popup windown
document.addEventListener('DOMContentLoaded', function () {
    const addUserPopup = document.getElementById('addUserPopup');
    const confirmAddUserBtn = document.getElementById('confirmAddUserBtn');
    const cancelAddUserBtn = document.getElementById('cancelAddUserBtn');
    const userEmailInput = document.getElementById('userEmailInput');

    confirmAddUserBtn.addEventListener('click', async function () {
        // Addar en användare till den boarden man är på och stänger popup windown
        const userEmail = userEmailInput.value;
        addUser(userEmail)
        addUserPopup.style.display = 'none';
    });

    cancelAddUserBtn.addEventListener('click', function () {
        // Avbryter och stänger popup windown
        addUserPopup.style.display = 'none';
    });
});