/**
 * Perform login functionality upon the completion of DOM content loading.
 * Attach an event listener to the login form submission.
 * Sends a POST request to the server for user authentication.
 * Handles response and displays appropriate messages.
 *
 * @param {Event} event - The event object for the form submission.
 */
document.addEventListener("DOMContentLoaded", function () {
    // Select the login form and status element from the DOM.
    const loginForm = document.querySelector("#login-form");
    const statusElement = document.querySelector("#status");

    // Add an event listener to the login form submission.
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent the default form submission behavior.

        // Retrieve user input values for email and password.
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        try {
            // Send a POST request to the server for user login authentication.
            const response = await fetch("http://localhost:3030/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            // Handle the response from the server.
            if (response.ok) {
                const data = await response.json();
                // Update the status element with a welcome message and the user's JWT token.
                statusElement.innerHTML = `Welcome ${data.userEmail.split("@")[0]}!<p>Your JWT: <pre>${data.token}</pre></p>`;
                console.log(data); // Log the response data to the console.
            } else {
                // Display an error message if the login attempt fails.
                statusElement.innerHTML = "Login failed. Please check your credentials.";
                console.error("Login failed"); // Log a detailed error message to the console.
            }
        } catch (error) {
            // Display a generic error message in case of any unexpected errors.
            statusElement.innerHTML = "An error occurred. Please try again later.";
            console.error(error); // Log the specific error to the console for debugging purposes.
        }
    });
});
