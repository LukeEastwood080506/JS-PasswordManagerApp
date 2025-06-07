const tempEmail = "admin@gmail.com";
const tempPassword = "password";

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginButton = document.getElementById("login-button");

function submitLogin() {
  console.log("Login attempted with:", emailInput.value);

  // if the email and password match the temporary values, or detailsCheck is true, login succeeds
  if (
    (emailInput.value.trim() === tempEmail && passwordInput.value.trim() === tempPassword) ||
    detailsCheck()
  ) {
    alert("Login successful!");

    // Store current user's email for use in other pages
    localStorage.setItem("currentUser", emailInput.value);

    // Mark session as logged in
    sessionStorage.setItem("isLoggedIn", "true");

    // Redirect to home page
    window.location.href = "mainpg.html";
  }
  // Check that verifies whether an email was actually entered.
  // It checks for an @ symbol in the email input.
  else if (!emailInput.value.includes("@")) {
    alert("Please enter a valid email address.");
    emailInput.value = "";
    passwordInput.value = "";
    sessionStorage.setItem("isLoggedIn", "false");
  }
  else {
    alert("Invalid email or password. Please try again.");
    emailInput.value = "";
    passwordInput.value = "";
    sessionStorage.setItem("isLoggedIn", "false");
  }
}

function detailsCheck() {
  // Attempt to retrieve user data from localStorage.
  const storedUserJSON = localStorage.getItem(emailInput.value);
  if (!storedUserJSON) {
    return false;
  }
  try {
    // parses JSON string into an object
    const storedUserData = JSON.parse(storedUserJSON);
    // Compare the entered password with the stored password (the value from the object) in localStorage.
    if (storedUserData.password === passwordInput.value.trim()) {
      return true;
    }
    return false;
  }
  catch (error) {
    console.error(error);
    return false;
  }
}

loginButton.addEventListener("click", submitLogin);