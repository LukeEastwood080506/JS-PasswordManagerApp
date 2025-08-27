// DOM elements
const backBtn = document.getElementById("back-btn");
const displayEmail = document.getElementById("email-display");

const changeEmailModal = document.getElementById("change-email-modal-container");
const changeMasterPasswordModal = document.getElementById("change-password-modal-container");

const openEmailModalBtn = document.getElementById("change-email-btn");
const closeEmailModalBtn = document.getElementById("change-email-close-button");
const changeEmailBtn = document.getElementById("change-email-button");
const openMasterPasswordModalBtn = document.getElementById("change-master-password-btn");
const closeMasterPasswordModalBtn = document.getElementById("change-password-close-button");
const changeMasterPasswordBtn = document.getElementById("change-password-button");

const logOutBtn = document.getElementById("log-out-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");

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

function changeEmail() {

}

function changeMasterPassword() {

}

function logOut() {
    window.location.href = "loginpg.html";
}

function deleteAccount() {
    alert("Delete account button clicked");
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

}

if (openMasterPasswordModalBtn) {
    openMasterPasswordModalBtn.addEventListener("click", () => showModal("change-password-modal"));
}

if (closeMasterPasswordModalBtn) {
    closeMasterPasswordModalBtn.addEventListener("click", () => hideModal("change-password-modal"));
}

if (changeMasterPasswordBtn) {

}

if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.location.href = "mainpg.html";
    });
}

if (logOutBtn){
    logOutBtn.addEventListener("click", () => logOut());
}

if (deleteAccountBtn){
    deleteAccountBtn.addEventListener("click", () => deleteAccount())
}




showEmail();