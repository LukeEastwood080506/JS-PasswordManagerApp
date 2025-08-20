const emailInput = document.getElementById("email-input");
const confirmEmailInput = document.getElementById("confirm-email-input");
const passwordInput = document.getElementById("password-input");

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

function confirmSignUp() {
  // check if the email input contains an @ sign - to verify its a valid email address.
  if (!emailInput.value.includes("@")) {
    // alert("Please enter a valid email address.");
    // clear the input fields.
    emailInput.value = "";
    confirmEmailInput.value = "";
  } else if (confirmEmailInput.value != emailInput.value) {
    // alert(
      "To confirm your email address, please enter the same email address you entered above."
    );
    // clear the input fields.
    emailInput.value = "";
    confirmEmailInput.value = "";
  }
  // check for the input of a strong password.
  else if (passwordInput.value.length < 12) {
    // alert("Please enter a password that is at least 12 characters long.");
    passwordInput.value = "";
  } else {
    // Call method which saves account details to local storage.
    saveUserCredentials(emailInput.value, passwordInput.value);
    // Successful Sign-Up
    // alert("Sign Up Successful!");
    window.location.href = "loginpg.html";
  }
}

function saveUserCredentials(email, password) {
  // Sends a POST request to the backend server to sign up the user with an email and password.
  fetch("http://localhost:6969/users/signup", {
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
        // alert("Sign-Up Successful!");
        window.location.href = "loginpg.html";
      } else {
        // alert(data.message || "Sign Up Unsuccessful!");
      }
    })
    .catch((error) => {
      // alert(error.message);
    });
}
