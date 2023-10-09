document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("#login-form");
    const statusElement = document.querySelector("#status");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        try {
            const response = await fetch("http://localhost:3030/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                })
            });

            if (response.ok) {
                const data = await response.json();
                statusElement.innerHTML = `Welcome ${data.userEmail.split("@")[0]}!`;
                localStorage.setItem("access_token", data.token);
                // Redirect to the dashboard page
                window.location.href = "/public/dashboard/index.html";

            } else {
                statusElement.innerHTML = "Login failed. Please check your credentials.";
                console.error("Login failed");
            }
        } catch (error) {
            statusElement.innerHTML = "An error occurred. Please try again later.";
            console.error(error);
        }
    });
});
