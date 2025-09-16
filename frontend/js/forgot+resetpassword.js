// DOM elements
const emailInput = document.getElementById("email-input");
const newPasswordInput = document.getElementById("new-password-input");
const confirmPasswordInput = document.getElementById("confirm-password-input");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");
const submitNewPasswordBtn = document.getElementById("new-password-btn");

const dynamicModal = document.getElementById("dynamic-forgot-password-modal-container");
const closeDynamicModalBtn = document.getElementById("dynamic-forgot-password-modal-close-button");
const dynamicModalOkBtn = document.getElementById("ok-button");
const dynamicModalTitle = document.getElementById("dynamic-forgot-password-modal-title");
const dynamicModalMessage = document.getElementById("dynamic-forgot-password-modal-message");

let verifiedEmail = null;

// Check if the entered email is valid and exists in the backend
function checkEmail() {
    let emailEnds = ['.com', '.co.uk'];
    const email = emailInput.value;
    let stringIncludesEnd = emailEnds.some(end => email.includes(end));
    if (!email.includes("@") || !stringIncludesEnd) {
        setUpDynamicModal("email-fail");
        showDynamicModal();
    }
    fetch("http://127.0.0.1:6969/users/forgotpassword", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Existing email - Can now move on to the forgot password section.
                setUpDynamicModal("email-success");
                showDynamicModal();
            } else {
                setUpDynamicModal("email-fail");
                showDynamicModal();
            }
        })
}

// Check if new password and confirmation match, then submit to backend
function checkPasswords(email) {
    const newPassword = newPasswordInput.value;
    const confirmedPassword = confirmPasswordInput.value;
    // Flag if both inputs have not been filled.
    if (!newPassword || !confirmedPassword) {
        setUpDynamicModal("password-change-fail");
        showDynamicModal();
    }
    // Flag if both inputs are not equal to each other.
    if (newPassword !== confirmedPassword) {
        setUpDynamicModal("password-change-fail");
        showDynamicModal();
    }
    fetch("http://127.0.0.1:6969/users/forgotpassword/new", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, confirmedPassword }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                setUpDynamicModal("password-change-success");
                showDynamicModal();
            } else {
                // Check the contents of data.message before displaying the appropriate modal.
                if (data.message === "The new password is the same as the original password") {
                    setUpDynamicModal("same-forgot-password");
                    showDynamicModal();
                } else {
                    setUpDynamicModal("password-change-fail");
                    showDynamicModal();
                }
            }
        })
}

// Clear all input fields
function clearInputs() {
    emailInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
}

// Set up and display the dynamic modal for feedback
function setUpDynamicModal(result) {
    switch (result) {
        case "email-success":
            dynamicModalTitle.textContent = "Valid Email!";
            dynamicModalMessage.textContent = "Valid Email! Click ok to proceed to forgot password!";
            dynamicModalOkBtn.onclick = () => {
                hideDynamicModal();
                verifiedEmail = emailInput.value; // Store the verified email for password reset
                clearInputs();
                showForgotPasswordInputFields();
            }
            break;
        case "email-fail":
            dynamicModalTitle.textContent = "Invalid Email!";
            dynamicModalMessage.textContent = "Invalid Email! Click ok to retry!";
            dynamicModalOkBtn.onclick = () => {
                hideDynamicModal();
                clearInputs();
            };
            break;
        case "password-change-success":
            dynamicModalTitle.textContent = "Forgot Password Successful!";
            dynamicModalMessage.textContent = "Forgot Password Successful! Click ok to proceed to login!";
            dynamicModalOkBtn.onclick = () => {
                window.location.href = "loginpg.html";
            };
            break;
        case "password-change-fail":
            dynamicModalTitle.textContent = "Forgot Password Unsuccessful!";
            dynamicModalMessage.textContent = "Forgot Password Unsuccessful! Click ok to retry!";
            dynamicModalOkBtn.onclick = () => {
                hideDynamicModal();
                clearInputs();
            };
            break;
        case "same-forgot-password":
            dynamicModalTitle.textContent = "Forgot Password Unsuccessful!";
            dynamicModalMessage.textContent = "Forgot Password Unsuccessful! The new password is the same as the original password!";
            dynamicModalOkBtn.onclick = () => {
                hideDynamicModal();
                clearInputs();
            }
            break;
        default:
            break;
    }
}

// Show password input fields after email is verified
function showForgotPasswordInputFields() {
    emailInput.style.display = "none";
    forgotPasswordBtn.style.display = "none";
    newPasswordInput.style.display = "block";
    confirmPasswordInput.style.display = "block";
    submitNewPasswordBtn.style.display = "block";
}

function showDynamicModal() {
    dynamicModal.style.display = "flex";
}

function hideDynamicModal() {
    dynamicModal.style.display = "none";
}

// Event listeners for modal and form actions
if (closeDynamicModalBtn) {
    closeDynamicModalBtn.addEventListener("click", () => hideDynamicModal());
}

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", () => checkEmail())
}

if (submitNewPasswordBtn) {
    submitNewPasswordBtn.addEventListener("click", () => {
        checkPasswords(verifiedEmail);
    });
}
