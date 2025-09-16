// DOM elements
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginButton = document.getElementById("login-button");

const dynamicModal = document.getElementById("dynamic-login-modal-container");
const closeDynamicModalBtn = document.getElementById("dynamic-login-modal-close-button");
const dynamicModalTitle = document.getElementById("dynamic-login-modal-title");
const dynamicModalMessage = document.getElementById("dynamic-login-modal-message");
const dynamicModalOkButton = document.getElementById("ok-button");

function submitLogin() {
  // Validate and submit login form
  detailsCheck(emailInput.value, passwordInput.value);
}

function detailsCheck(email, password) {
  let emailEnds = ['.com', '.co.uk'];
  let stringIncludesEnd = emailEnds.some(end => email.includes(end));
  if(!email.includes("@") || !stringIncludesEnd){
    setUpDynamicModal("login-fail");
    showDynamicModal();
    return;
  }
  // Send login request to backend
  fetch("http://127.0.0.1:6969/users/login",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Sends cookies with the request.
    body: JSON.stringify({ email, password })
  })
  .then((response) => response.json())
  .then((data) =>{
    if(data.success){
      setUpDynamicModal("login-success");
      showDynamicModal();
    }
    else{
      setUpDynamicModal("login-fail");
      showDynamicModal();
    }
  })
  .catch((err) =>{
    console.error(err.message);
  });
}

// Set up and display the dynamic modal for login feedback
function setUpDynamicModal(result){
  switch(result){
    case "login-success":
      dynamicModalTitle.textContent = "Login Successful!";
      dynamicModalMessage.textContent = "Login Successful! Click ok to navigate to the main page!";
      dynamicModalOkButton.onclick = () => {
        window.location.href = "mainpg.html";
      };
      break;
    case "login-fail":
      dynamicModalTitle.textContent = "Login Unsuccessful!";
      dynamicModalMessage.textContent = "Login Unsuccessful! Invalid email or password!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        clearInputs();
      };
      break;
    default:
      break;
  }
}

function showDynamicModal(){
  dynamicModal.style.display = "flex";
}

function hideDynamicModal(){
  dynamicModal.style.display = "none";
}

function clearInputs(){
  emailInput.value = "";
  passwordInput.value = "";
}

// Event listeners for login and modal actions
if(loginButton){
  loginButton.addEventListener("click", submitLogin);
}

if(closeDynamicModalBtn){
  closeDynamicModalBtn.addEventListener("click", () => hideDynamicModal());
}

// Add Enter key support for all input fields
emailInput.addEventListener("keyup", function(event){
  if(event.key === "Enter"){
    submitLogin();
  }
});

passwordInput.addEventListener("keyup", function(event){
  if(event.key === "Enter"){
    submitLogin();
  }
});

window.addEventListener("pageshow", (event) => {
  // Checks if page is loading from cache.
  if(event.persisted){
    // Clear the input form states if the page is restored from cache.
    document.querySelectorAll("input").forEach(input => input.value = "");
    // Hide modals
    hideDynamicModal();
  }
});