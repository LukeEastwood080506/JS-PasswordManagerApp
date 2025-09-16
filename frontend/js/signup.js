// DOM elements
const emailInput = document.getElementById("email-input");
const confirmEmailInput = document.getElementById("confirm-email-input");
const passwordInput = document.getElementById("password-input");
const signUpBtn = document.getElementById("sign-up-button");

const dynamicModal = document.getElementById("dynamic-signup-modal-container");
const closeDynamicModalBtn = document.getElementById("dynamic-signup-modal-close-button");
const dynamicModalOkBtn = document.getElementById("ok-button");
const dynamicModalTitle = document.getElementById("dynamic-signup-modal-title");
const dynamicModalMessage = document.getElementById("dynamic-signup-modal-message");

function confirmSignUp() {
  // Validate email and password fields before attempting signup
  let emailEnds = ['.com', '.co.uk'];
  const email = emailInput.value;
  let stringIncludesEnd = emailEnds.some(end => email.includes(end));
  if (!emailInput.value.includes("@") || !stringIncludesEnd) {
    setUpDynamicModal("sign-up-fail");
    showDynamicModal();
  } else if (confirmEmailInput.value != emailInput.value) {
    setUpDynamicModal("non-identical-emails");
    showDynamicModal();
  }
  // check for the input of a strong password.
  else if (passwordInput.value.length <= 12) {
    setUpDynamicModal("sign-up-password-fail");
    showDynamicModal();
  } else {
    saveUserCredentials(emailInput.value, passwordInput.value);
  }
}

function saveUserCredentials(email, password) {
  // Sends a POST request to the backend server to sign up the user with an email and password.
  fetch("http://127.0.0.1:6969/users/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    // Converts the raw HTTP response into JSON.
    .then((response) => response.json())
    // Handles the data returned by the backend
    .then((data) => {
      if (data.success) {
        setUpDynamicModal("sign-up-success");
        showDynamicModal();
      } else {
        // Show specific error if email is already registered
        if(data.message === "Email is registered under an account!"){
          setUpDynamicModal("sign-up-fail-email");
          showDynamicModal();
        } else {
          setUpDynamicModal("sign-up-fail");
          showDynamicModal();
        }
      }
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function setUpDynamicModal(result) {
  switch (result) {
    case "sign-up-success":
      dynamicModalTitle.textContent = "Sign Up Successful!";
      dynamicModalMessage.textContent = "Sign Up Successful! Click ok to navigate to the login page!";
      dynamicModalOkBtn.onclick = () => {
        window.location.href = "loginpg.html";
      };
      break;
    case "sign-up-fail":
      dynamicModalTitle.textContent = "Sign Up Unsuccessful!";
      dynamicModalMessage.textContent = "Sign Up Unsuccessful! Click ok to retry!";
      dynamicModalOkBtn.onclick = () => {
        hideDynamicModal();
        clearInputs();
      };
      break;
    case "sign-up-fail-email":
      dynamicModalTitle.textContent = "Sign Up Unsuccessful!";
      dynamicModalMessage.textContent = "Sign Up Unsuccessful! Email is already registered under an account! Click ok to retry!";
      dynamicModalOkBtn.onclick = () => {
        hideDynamicModal();
        clearInputs();
      };
      break;
    case "sign-up-password-fail":
      dynamicModalTitle.textContent = "Sign Up Unsuccessful!";
      dynamicModalMessage.textContent = "Sign Up Unsuccessful! Password must be at least 12 characters!";
      dynamicModalOkBtn.onclick = () => {
        hideDynamicModal();
        clearInputs();
      }
      break;
    case "non-identical-emails":
      dynamicModalTitle.textContent = "Sign Up Unsuccessful!";
      dynamicModalMessage.textContent = "Sign Up Unsuccessful! You must enter the same email for the 'confirm email' field!";
      dynamicModalOkBtn.onclick = () => {
        hideDynamicModal();
        clearInputs();
      };
      break;
    default:
      break;
  }
}

function showDynamicModal() {
  dynamicModal.style.display = "flex";
}

function hideDynamicModal() {
  dynamicModal.style.display = "none";
}

function clearInputs() {
  emailInput.value = "";
  confirmEmailInput.value = "";
  passwordInput.value = "";
}

// Add Enter key support for all input fields
emailInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    confirmSignUp();
  }
});
confirmEmailInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    confirmSignUp();
  }
});
passwordInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    confirmSignUp();
  }
});

if (closeDynamicModalBtn) {
  closeDynamicModalBtn.addEventListener("click", () => hideDynamicModal());
}

if (signUpBtn) {
  signUpBtn.addEventListener("click", () => confirmSignUp());
}