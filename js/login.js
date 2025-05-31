const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");

const tempEmail = "admin@gmail.com";
const tempPassword = "password";

function submitLogin() {
  // if the username and password match the temporary values, redirect to the home page.
  if (
    userNameInput.value === tempUsername &&
    passwordInput.value === tempPassword
  ) {
    alert("Login successful!");
    sessionStorage.setItem("isLoggedIn", "true");
    window.location.href = "mainpg.html";
  } else {
    alert("Invalid username or password. Please try again.");
    sessionStorage.setItem("isLoggedIn", "false");
    userNameInput.value = "";
    passwordInput.value = "";
  }
}
