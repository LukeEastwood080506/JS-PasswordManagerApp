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
  detailsCheck(emailInput.value, passwordInput.value);
}

function detailsCheck(email, password) {
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
      console.log("Login successful!");
      setUpDynamicModal("login-success");
      showDynamicModal();
    }
    else{
      console.log(data.message || "Login Unsuccessful!");
      setUpDynamicModal("login-fail");
      showDynamicModal();
    }
  })
  .catch((err) =>{
    console.error(err.message);
  });
}

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
      dynamicModalMessage.textContent = "Login Unsuccessful! Click ok to retry!";
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

if(loginButton){
  loginButton.addEventListener("click", submitLogin);
}

if(closeDynamicModalBtn){
  closeDynamicModalBtn.addEventListener("click", () => hideDynamicModal());
}

window.addEventListener("pageshow", (event) => {
  // Checks if page is loading from cache.
  if(event.persisted){
    // Clear the input form states if the page is restored from cache.
    document.querySelectorAll("input").forEach(input => input.value = "");
    // Hide modals
    hideDynamicModal();
  }
});