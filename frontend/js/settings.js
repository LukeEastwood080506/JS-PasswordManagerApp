// DOM elements
const backBtn = document.getElementById("back-btn");
const displayEmail = document.getElementById("email-display");

const changeEmailModal = document.getElementById("change-email-modal-container");
const changeMasterPasswordModal = document.getElementById("change-password-modal-container");
const logOutModal = document.getElementById("log-out-modal-container");
const deleteAccountModal = document.getElementById("delete-account-modal-container");

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

function showEmail() {
    // Retrieve email from currently signed in user.
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
                console.log(data.message || "Email display unsuccessful!");
            }
        })
        .catch((err) => {
            console.error(err.message);
        })
}

function changeEmail(originalEmail, newEmail) {
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
                alert("Email has been successfully edited! Redirecting to login page...");
                window.location.href = "loginpg.html";
                return;
            } else {
                alert(data.message || "Email edit unsuccessful!");
                console.log(data.message || "Email edit unsuccessful!");
                clearModalInputs("change-email-modal");
            }
        })
        .catch((err) => {
            console.error(err.message);
        })
}   

function changeMasterPassword(originalPassword, newPassword) {
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
                alert("Master password has been successfully edited! Redirecting to login page...");
                window.location.href = "loginpg.html";
                return;
            } else {
                alert(data.message || "Master password edit unsuccessful!");
                console.log("Master password edit unsuccessful!");
            }
        })
        .catch((err) => {
            console.error(err.message);
        })
}

function logOut() {
    // Properly log out by clearing sess`ion and cookies.
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
                window.location.href = "loginpg.html";
            } else {
                alert("Logout failed: " + (data.message || ""));
            }
        })
        .catch((err) => {
            console.error(err.message);
        })
}

function deleteAccount(password) {
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
                // console.log("Delete response:", data);
                alert("Account has been successfully deleted! Redirecting to login page...");
                window.location.href = "loginpg.html";
                return;
            } else {
                console.log(data.message || "Account deletion unsuccessful!");
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
        default:
            break;
    }
}

function showModal(modal) {
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
    }
}

function hideModal(modal) {
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

document.addEventListener("DOMContentLoaded", () => {
    showEmail();
}); 