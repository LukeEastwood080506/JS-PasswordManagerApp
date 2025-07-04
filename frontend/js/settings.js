const emailText = document.getElementById("email-display");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const contrastModeToggle = document.getElementById("contrast-mode-toggle");

function decideRedirect(){
  // Check if the user is logged in
  // If they are logged in the back button should redirect them to the main page.
  // Else, redirect the user back to the login page.
  const currentUser = retrieveEmail();
  if(currentUser){
    window.location.href = "mainpg.html";
  }
  else{
    window.location.href = "loginpg.html";
  }
}

function displayEmail() {
  const email = retrieveEmail();
  if (email) {
    emailText.textContent = "Email: " + email;
  } else {
    emailText.textContent = "Email could not be found.";
  }
}

function retrieveEmail() {
  // Get the current logged in user email and store it in local storage.
  const userEmail = localStorage.getItem("currentUser");
  if (!userEmail) {
    return null;
  }
  return userEmail;
}

function changeEmail() {
  // Check if user is logged in.
  const currentUser = retrieveEmail();
  if (!currentUser) {
    alert("You must be logged in to change your email.");
    return;
  }
  // Ask for the user's current email and verify it.
  const currentEmail = prompt("Enter your current email:");
  if (currentEmail === null) {
    return;
  }
  // Retrieve current email from local storage to verify the currentEmail user input.
  const userJSON = localStorage.getItem(currentUser);
  const storedUserData = JSON.parse(userJSON);
  // Flags if there is not stored user data or if the email stored in local storage is
  // not equal to the current email.
  if (!storedUserData || storedUserData.email !== currentEmail) {
    alert("You did not enter your current email.");
    return;
  }

  let newEmail = prompt("Enter a new email:");
  if (newEmail === null) {
    return;
  }

  // Validation can be improved upon - only presuming a valid email address has been entered from the fact the input contains an @.
  while (!newEmail.includes("@")) {
    alert("You entered an invalid email address.");
    newEmail = prompt("Enter a valid email address.");
    if (newEmail === null) {
      return;
    }
  }
  // Valid new email address.
  storedUserData.email = newEmail;
  localStorage.setItem(newEmail, JSON.stringify(storedUserData));

  // Delete the user data from local storage and remove the current session.
  localStorage.removeItem(currentUser);
  localStorage.removeItem("currentUser");
  alert(
    "Email address has been updated. Please log back in again with your new email address."
  );
  window.location.href = "loginpg.html";
}

function changeMasterPassword() {
  // Check if the user is logged in
  const currentUser = retrieveEmail();
  if (!currentUser) {
    alert("You must be logged in to change your password.");
    return;
  }
  // Ask for the user's current password and verify it.
  const currentPassword = prompt("Enter your current master password:");
  if (currentPassword === null) {
    return;
  }
  // Retrieve current password from local storage to verify the currentPassword user input.
  const userJSON = localStorage.getItem(currentUser);
  const storedUserData = JSON.parse(userJSON);
  // Flags if there is not stored user data or if the password stored in local storage is
  // not equal to the current password.
  if (!storedUserData || storedUserData.password !== currentPassword) {
    alert("You did not enter your current password.");
    return;
  }
  // The user can now enter their new password.
  let newMasterPassword = prompt("Enter a new master password:");
  // Check for nulls e.g. user cancels.
  if (newMasterPassword === null) {
    return;
  }
  while (
    newMasterPassword.length < 12 ||
    newMasterPassword === currentPassword
  ) {
    alert("Enter a unique master password that has at least 12 characters.");
    newMasterPassword = prompt("Enter a valid new master password:");
    // Still need to check for nulls in case a user cancels.
    if (newMasterPassword === null) {
      return;
    }
  }
  // Valid new master password - overwrite previous password stored in localStorage.
  // Redirect the user back to the sign in page to sign in with the new master password.
  storedUserData.password = newMasterPassword;
  localStorage.setItem(currentUser, JSON.stringify(storedUserData));
  alert(
    "Master password has been updated. Please log back in again with your new password."
  );
  localStorage.removeItem("currentUser");
  window.location.href = "loginpg.html";
}

function logOut() {
  // Remove the current user from localStorage.
  localStorage.removeItem("currentUser");
  alert("You have been logged out successfully.");
  // Redirect the user to the login page.
  window.location.href = "loginpg.html";
}

function deleteAccount() {
  // Check if user is logged in
  const currentUser = retrieveEmail();
  if (!currentUser) {
    alert("You must be logged in to delete your account.");
    return;
  }
  if (confirm("Are you sure you want to delete your account?")) {
    // Ask for password to confirm identity
    const password = prompt(
      "Please enter your password to confirm account deletion:"
    );
    if (password === null) {
      return;
    }
    // Verify password
    const userJSON = localStorage.getItem(currentUser);
    const userData = JSON.parse(userJSON);
    if (!userData || userData.password !== password) {
      alert("Incorrect password. Account deletion cancelled.");
      return;
    }
    // Delete the actual user data from localStorage
    localStorage.removeItem(currentUser);

    // Also remove the current session
    localStorage.removeItem("currentUser");

    alert("Your account has been successfully deleted.");
    window.location.href = "loginpg.html";
  }
}

function toggleDarkMode() {
  let rootElement = document.documentElement;

  // Check if contrast mode is active and disable it before toggling dark mode
  if (rootElement.classList.contains("contrast-mode")) {
    rootElement.classList.remove("contrast-mode");
    localStorage.setItem("contrastMode", "disabled");
    contrastModeToggle.checked = false;
  }
  rootElement.classList.toggle("dark-mode");

  // Save enabled/disabled state to local storage.
  if (rootElement.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
  } else {
    localStorage.setItem("darkMode", "disabled");
  }
}

function toggleContrastMode() {
  let rootElement = document.documentElement;

  // Check if dark mode is active and disable it before enabling contrast mode.
  if (rootElement.classList.contains("dark-mode")) {
    rootElement.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
    darkModeToggle.checked = false;
  }
  rootElement.classList.toggle("contrast-mode");

  if (rootElement.classList.contains("contrast-mode")) {
    localStorage.setItem("contrastMode", "enabled");
  } else {
    localStorage.setItem("contrastMode", "disabled");
  }
}

function changeFontSize() {
  const fontSize = prompt("Enter a font size:");
  if (fontSize === null || isNaN(fontSize)) {
    alert("Enter a valid font size!");
    return;
  }
  
  // Store the font size preference in localStorage.
  localStorage.setItem("fontSize", fontSize);

  // Apply the font size to the root element of the document.
  document.documentElement.style.fontSize = fontSize + "px";
}

function restoreToggleStates(){
  // Retrieve theme settings from localStorage.
  // Boolean variables - returns true if the 'enabled' strings are stored in localStorage
  // under the keys 'darkMode' and 'contrastMode'.
  const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
  const contrastModeEnabled = localStorage.getItem('contrastMode') === 'enabled';

  // Set toggle states based on the current theme settings.
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const contrastModeToggle = document.getElementById('contrast-mode-toggle');

  // Set the dark mode and contrast mode toggles
  darkModeToggle.checked = darkModeEnabled;
  contrastModeToggle.checked = contrastModeEnabled;

}

restoreToggleStates();
displayEmail();
