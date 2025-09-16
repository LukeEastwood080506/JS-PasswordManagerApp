// DOM elements
const backBtn = document.getElementById("back-btn");
const displayEmail = document.getElementById("email-display");

const changeEmailModal = document.getElementById("change-email-modal-container");
const changeMasterPasswordModal = document.getElementById("change-password-modal-container");
const logOutModal = document.getElementById("log-out-modal-container");
const deleteAccountModal = document.getElementById("delete-account-modal-container");
const dynamicModal = document.getElementById("dynamic-settings-modal-container");

const openEmailModalBtn = document.getElementById("change-email-btn");
const closeEmailModalBtn = document.getElementById("change-email-close-button");
const changeEmailBtn = document.getElementById("change-email-button");
const openMasterPasswordModalBtn = document.getElementById("change-master-password-btn");
const closeMasterPasswordModalBtn = document.getElementById("change-password-close-button");
const changeMasterPasswordBtn = document.getElementById("change-password-button");
const openlogOutModalBtn = document.getElementById("log-out-modal-btn");
const openDeleteAccountModalBtn = document.getElementById("delete-account-btn");
const closelogOutModalBtn = document.getElementById("log-out-close-button");
const logOutBtn = document.getElementById("log-out-button");
const closeDeleteAccountModalBtn = document.getElementById("delete-account-close-button");
const deleteAccountBtn = document.getElementById("delete-account-button");

const closeDynamicModalBtn = document.getElementById("dynamic-settings-modal-close-button");
const dynamicModalOkBtn = document.getElementById("ok-button");
const dynamicModalTitle = document.getElementById("dynamic-settings-modal-title");
const dynamicModalMessage = document.getElementById("dynamic-settings-modal-message");

function showEmail() {
    // Retrieve and display the email of the currently signed-in user
    fetch("http://127.0.0.1:6969/users/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Change the text content of display email to the email from the message.
                displayEmail.textContent = "Email: " + data.message;
            } else {
                displayEmail.textContent = "Email: N/A (Not signed in)";
            }
        })
        .catch((err) => {
            console.error(err.message);
        })
}

function changeEmail(originalEmail, newEmail) {
    // Send request to change the user's email
    fetch("http://127.0.0.1:6969/users/emails/change", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ originalEmail, newEmail }),
    })
        .then((response) => response.json())
        .then((data) => {
            if(data.success){
                // Email changed successfully.
                setUpDynamicModal("change-email-success");
                showModal("dynamic-modal");
                return;
            } else {
                setUpDynamicModal("change-email-fail");
                hideModal("change-email-modal");
                showModal("dynamic-modal");
            }
        })
        .catch((err) => {
            console.error(err.message);
        })
}   

function changeMasterPassword(originalPassword, newPassword) {
    // Send request to change the user's master password
    fetch("http://127.0.0.1:6969/passwords/edit/master", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ originalPassword, newPassword }),
    })
        .then((response) => response.json())
        .then((data) => {
            if(data.success){
                // Master password changed successfully.
                setUpDynamicModal("change-master-password-success");
                hideModal("change-password-modal");
                showModal("dynamic-modal");
                return;
            } else {
                setUpDynamicModal("change-master-password-fail");
                hideModal("change-password-modal");
                showModal("dynamic-modal");
            }
        })
        .catch((err) => {
            console.error(err.message);
        })
}

function logOut() {
    // Properly log out by clearing session and cookies.
    fetch("http://127.0.0.1:6969/users/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    })
        .then((response) => response.json())
        .then((data) => {
            if(data.success){
                setUpDynamicModal("log-out-success");
                showModal("dynamic-modal");
                return;
            } else {
                setUpDynamicModal("log-out-fail");
                showModal("dynamic-modal");
            }
        })
        .catch((err) => {
            console.error(err.message);
        })
}

function deleteAccount(password) {
    // Send request to delete the user's account
    fetch("http://127.0.0.1:6969/users/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if(data.success){
                setUpDynamicModal("delete-account-success");
                hideModal("delete-account-modal");
                showModal("dynamic-modal");
                return;
            } else {
                setUpDynamicModal("delete-account-fail");
                hideModal("delete-account-modal");
                showModal("dynamic-modal");
            }
        })
        .catch((err) => {
            console.error(err.message);
        })
} 

function clearModalInputs(modal) {
    switch (modal) {
        case "change-email-modal":
            // Clears change email modal inputs
            document.getElementById("original-email-input").value = "";
            document.getElementById("new-email-input").value = "";
            break;
        case "change-password-modal":
            // Clears change master password modal inputs.
            document.getElementById("original-password-input").value = "";
            document.getElementById("new-password-input").value = "";
            break;
        case "delete-account-modal":
            // Clears delete account modal inputs.
            document.getElementById("password-input").value = "";
            break;
        default:
            break;
    }
}

function showModal(modal) {
    // Show the specified modal and clear its inputs
    clearModalInputs(modal);
    switch (modal) {
        case "change-email-modal":
            changeEmailModal.style.display = "block";
            break;
        case "change-password-modal":
            changeMasterPasswordModal.style.display = "block";
            break;
        case "log-out-modal":
            logOutModal.style.display = "block";
            break;
        case "delete-account-modal":
            deleteAccountModal.style.display = "block";
            break;
        case "dynamic-modal":
            dynamicModal.style.display = "flex";
            break;
    }
}

function hideModal(modal) {
    // Hide the specified modal
    switch (modal) {
        case "change-email-modal":
            changeEmailModal.style.display = "none";
            break;
        case "change-password-modal":
            changeMasterPasswordModal.style.display = "none";
            break;
        case "log-out-modal":
            logOutModal.style.display = "none";
            break;
        case "delete-account-modal":
            deleteAccountModal.style.display = "none";
            break;
        case "dynamic-modal":
            dynamicModal.style.display = "none";
            break;
    }
}

// Set up and display the dynamic modal for feedback on settings actions
function setUpDynamicModal(result){
    switch(result){
        case "change-email-success":
            // Change the modal title and content.
            dynamicModalTitle.textContent = "Email successfully edited!";
            dynamicModalMessage.textContent = "Email successfully edited! Click ok to sign back in...";
            // Onclick listener to ensure only one handler is active at one time for the dynamic modal button.
            dynamicModalOkBtn.onclick = () => {
                window.location.href = "loginpg.html";
            };
            break;
        case "change-email-fail":
            dynamicModalTitle.textContent = "Email edit unsuccessful!";
            dynamicModalMessage.textContent = "Email edit unsuccessful! Please retry!";
            dynamicModalOkBtn.onclick = () => {
                // Hide dynamic modal
                hideModal("dynamic-modal");
                // Clear the change email inputs.
                clearModalInputs("change-email-modal");
                showModal("change-email-modal");
            };  
            break;
        case "change-master-password-success":
            dynamicModalTitle.textContent = "Master password successfully edited!";
            dynamicModalMessage.textContent = "Master password successfully edited! Click ok to sign back in...";
            dynamicModalOkBtn.onclick = () => {
                window.location.href = "loginpg.html";
            };
            break;
        case "change-master-password-fail":
            dynamicModalTitle.textContent = "Master password edit unsuccessful!";
            dynamicModalMessage.textContent = "Master password edit unsuccessful! Please retry!";
            dynamicModalOkBtn.onclick = () => {
                hideModal("dynamic-modal");
                clearModalInputs("change-password-modal");
                showModal("change-password-modal");
            };
            break;
        case "log-out-success":
            dynamicModalTitle.textContent = "Log Out Successful!";
            dynamicModalMessage.textContent = "Log Out Successful! Click ok to return to the login page...";
            dynamicModalOkBtn.onclick = () => {
                window.location.href = "loginpg.html";
            };
            break;
        case "log-out-fail":
            dynamicModalTitle.textContent = "";
            dynamicModalMessage.textContent = "Log Out Unsuccessful!";
            dynamicModalOkBtn.onclick = () => {
                hideModal("dynamic-modal");
            };
            break;
        case "delete-account-success":
            dynamicModalTitle.textContent = "Account successfully deleted!";
            dynamicModalMessage.textContent = "Account successfully deleted! Click ok to return to the login page...";
            dynamicModalOkBtn.onclick = () => {
                window.location.href = "loginpg.html";
            };
            break;
        case "delete-account-fail":
            dynamicModalTitle.textContent = "Account deletion unsuccessful!";
            dynamicModalMessage.textContent = "Account deletion unsuccessful! Click ok to retry!";
            dynamicModalOkBtn.onclick = () => {
                hideModal("dynamic-modal");
                clearModalInputs("change-password-modal");
                showModal("change-password-modal");
            };
            break;
        default:
            dynamicModalOkBtn.onclick = null;
            break;
    }
}


/* Event Listeners */
if (openEmailModalBtn) {
    openEmailModalBtn.addEventListener("click", () => showModal("change-email-modal"));
}

if (closeEmailModalBtn) {
    closeEmailModalBtn.addEventListener("click", () => hideModal("change-email-modal"));
}

if (changeEmailBtn) {
    changeEmailBtn.addEventListener("click", (event) => {
        event.preventDefault();
        const originalEmail = document.getElementById("original-email-input").value;
        const newEmail = document.getElementById("new-email-input").value;
        changeEmail(originalEmail, newEmail);
    });
}

if (openMasterPasswordModalBtn) {
    openMasterPasswordModalBtn.addEventListener("click", () => showModal("change-password-modal"));
}

if (closeMasterPasswordModalBtn) {
    closeMasterPasswordModalBtn.addEventListener("click", () => hideModal("change-password-modal"));
}

if (changeMasterPasswordBtn) {
    changeMasterPasswordBtn.addEventListener("click", (event) => {
        event.preventDefault();
        const originalPassword = document.getElementById("original-password-input").value;
        const newPassword = document.getElementById("new-password-input").value;
        changeMasterPassword(originalPassword, newPassword);
    });
}

if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.location.href = "mainpg.html";
    });
}

if (openlogOutModalBtn) {
    openlogOutModalBtn.addEventListener("click", () => showModal("log-out-modal"));
}

if (openDeleteAccountModalBtn) {
    openDeleteAccountModalBtn.addEventListener("click", () => showModal("delete-account-modal"));
}

if (closelogOutModalBtn) {
    closelogOutModalBtn.addEventListener("click", () => hideModal("log-out-modal"));
}

if (closeDeleteAccountModalBtn) {
    closeDeleteAccountModalBtn.addEventListener("click", () => hideModal("delete-account-modal"));
}

if (logOutBtn) {
    logOutBtn.addEventListener("click", () => logOut());
}

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", (event) => {
        event.preventDefault();
        const password = document.getElementById("password-input").value;
        deleteAccount(password);
    });
}

if (closeDynamicModalBtn){
    closeDynamicModalBtn.addEventListener("click", () => hideModal("dynamic-modal"));
}

document.addEventListener("DOMContentLoaded", () => {
    showEmail();
});