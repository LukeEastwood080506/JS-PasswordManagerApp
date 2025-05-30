const emailInput = document.getElementById("email-input");
const confirmEmailInput = document.getElementById("confirm-email-input");
const passwordInput = document.getElementById("password-input");

function confirmSignUp(){
    // check if the email input contains an @ sign - to verify its a valid email address.
    if(!emailInput.value.includes("@")){
        alert("Please enter a valid email address.");
        // clear the input fields.
        emailInput.value = "";
        confirmEmailInput.value = "";
    }
    else if(confirmEmailInput.value != emailInput.value){
        alert("To confirm your email address, please enter the same email address you entered above.");
        // clear the input fields.
        emailInput.value = "";
        confirmEmailInput.value = "";
    }
    // check for the input of a strong password.
    else if(passwordInput.value.length < 12){
        alert("Please enter a password that is at least 12 characters long.");
        passwordInput.value = "";
    }
    else{
        // Call method which saves account details to local storage.
        saveUserCredentials(emailInput.value, passwordInput.value);
        // Successful Sign-Up
        alert("Sign Up Successful!");
        window.location.href = "loginpg.html";
    }
}

function saveUserCredentials(email, password){
    // Initialises a user object which takes the inputted email and password as credentials.
    const userDetails = {
        email: email,
        password: password
    };
    // Converts the userDetails object into a JSON string.
    const userDetailsToJSON = JSON.stringify(userDetails);
    // Stores the JSON string as the value in local storage with the email being the key.
    localStorage.setItem(email, userDetailsToJSON);
}