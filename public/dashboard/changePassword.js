// Get references to the relevant HTML elements
const currentPasswordInput = document.querySelector('#currentPassword');
const newPasswordInput = document.querySelector('#newPassword');
const confirmNewPasswordInput = document.querySelector('#confirmNewPassword');
const passwordChangeForm = document.querySelector('#passwordChangeForm');
const passwordChangePopup = document.querySelector('#passwordChangePopup');
const closePasswordChangePopupBtn = document.querySelector('#closePasswordChangePopup');

// Function to open the password change pop-up
function openPasswordChangePopup() {
    passwordChangePopup.style.display = 'block';
}

// Function to close the password change pop-up
function closePasswordChangePopup() {
    passwordChangePopup.style.display = 'none';
}

// Add a click event listener to the "Change Password" button to open the pop-up
document.querySelector('#changePasswordBtn').addEventListener('click', openPasswordChangePopup);

// Add a click event listener to the "Close" button within the pop-up to close it
closePasswordChangePopupBtn.addEventListener('click', closePasswordChangePopup);

// Add a submit event listener to the password change form
passwordChangeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get the values entered by the user
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    // Check if the new password and confirm new password match
    if (newPassword !== confirmNewPassword) {
        alert('New password and confirm new password do not match.');
        return;
    }
    try {
        // Send a PATCH request to update the password
        const response = await fetch(`http://localhost:3030/users/${payload.sub}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${WS_TOKEN}`
            },
            body: JSON.stringify({
                password: confirmNewPassword
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.token)
            localStorage.setItem("access_token", data.token)
            WS_TOKEN = localStorage.getItem("access_token")
            // Password changed successfully
            alert('Password changed successfully!');
            // Close the password change pop-up
            closePasswordChangePopup();
        } else {
            // Handle errors if the password change request fails
            alert('Password change failed. Please check your current password and try again.');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
});
