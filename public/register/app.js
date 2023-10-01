document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector("#send"); // Change to "#send" to match the button ID
    const statusElement = document.querySelector("#status");

    registerForm.addEventListener("click", async function (event) { // Change to "click" event
        event.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const userData = {
            name: username,
            email: email,
            password: password,
        };

        try {
            const response = await fetch("http://localhost:3030/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                alert("Registration successful!");
                // You can redirect the user to the login page or perform other actions here.
            } else {
                const data = await response.json();
                alert(`Registration failed: ${data.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Registration failed. Please try again later.");
        }
    });
});
