const tempEmail = "admin@gmail.com";
const tempPassword = "password";

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginButton = document.getElementById("login-button");

function submitLogin() {
  console.log("Login attempted with:", emailInput.value);
  if (emailInput.value === tempEmail && passwordInput.value === tempPassword) {
    alert("Login successful!");
    sessionStorage.setItem("isLoggedIn", "true");
    window.location.href = "mainpg.html";
  } else {
    alert("Invalid username or password. Please try again.");
    sessionStorage.setItem("isLoggedIn", "false");
    emailInput.value = "";
    passwordInput.value = "";
  }
}

// Move the event listener inside DOMContentLoaded
loginButton.addEventListener("click", submitLogin);
