// Add this script in a <script> tag before </body> in your HTML file

document.addEventListener("DOMContentLoaded", function () {
    const registrationForm = document.getElementById("registrationForm");
    const loginForm = document.getElementById("loginForm");

    registrationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Replace this with code to send a registration request to your backend
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Example: Sending data to the server
        fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle the response from the server (e.g., show a success message)
                console.log(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    });

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Replace this with code to send a login request to your backend
        const loginEmail = document.getElementById("loginEmail").value;
        const loginPassword = document.getElementById("loginPassword").value;

        // Example: Sending data to the server
        fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle the response from the server (e.g., redirect to a dashboard)
                console.log(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    });
});
