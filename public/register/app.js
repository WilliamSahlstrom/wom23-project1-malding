/**
 * Perform registration functionality upon the completion of DOM content loading.
 * Attach an event listener to the registration form submission.
 * Sends a POST request to the server for user registration.
 * Handles response and displays appropriate messages.
 *
 * @param {Event} event - The event object for the form submission.
 */
document.addEventListener("DOMContentLoaded", function () {
    // Select the registration form and status element from the DOM.
    const registerForm = document.querySelector("#send"); // Ensure that the ID matches the button ID in the HTML.
    const statusElement = document.querySelector("#status");

    // Add an event listener to the registration form submission.
    registerForm.addEventListener("click", async function (event) { // Change to "click" event
        event.preventDefault(); // Prevent the default form submission behavior.

        // Retrieve user input values for username, email, password, and confirm password.
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Check if the provided password and confirm password match.
        if (password !== confirmPassword) {
            alert("Passwords do not match"); // Display an alert for password mismatch.
            return;
        }

        // Create a user data object with the collected information.
        const userData = {
            name: username,
            email: email,
            password: password,
        };

        try {
            // Send a POST request to the server for user registration.
            const response = await fetch("http://localhost:3030/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            // Handle the response from the server.
            if (response.ok) {
                alert("Registration successful!"); // Display a success alert for successful registration.
                // You can redirect the user to the login page or perform other necessary actions here.
            } else {
                const data = await response.json();
                alert(`Registration failed: ${data.error}`); // Display an alert with the specific registration failure reason.
            }
        } catch (error) {
            console.error("Error:", error); // Log the specific error to the console for debugging purposes.
            alert("Registration failed. Please try again later."); // Display a generic error alert for any unexpected errors.
        }
    });
});
