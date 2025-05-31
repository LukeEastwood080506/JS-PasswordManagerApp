const emailInput = document.getElementById("email-input");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");
const newPasswordInput = document.getElementById("new-password-input");
const confirmPasswordInput = document.getElementById("confirm-password-input");
const newPasswordBtn = document.getElementById("new-password-btn");
const headingContent = document.getElementById("dymanic-heading");

let currentUserEmail = "";

emailInput.addEventListener("keyup", function(event){
    if(event.key === "Enter"){
        submitForgotPassword();
    }
});

newPasswordInput.addEventListener("keyup", function(event){
    if(event.key === "Enter"){
        submitNewPassword();
    }
});

confirmPasswordInput.addEventListener("keyup", function(event){
    if(event.key === "Enter"){
        submitNewPassword();
    }
});

function submitForgotPassword(){
    if(emailCheck()){
        // Reveal the new password and confirm password input fields, as well as the submission button.
        // whilst hiding the initial email input field and button and changing the heading text.
        emailInput.style.display = "none";
        forgotPasswordBtn.style.display = "none";
        headingContent.textContent = "Reset Password";
        newPasswordInput.style.display = "block";
        confirmPasswordInput.style.display = "block";
        newPasswordBtn.style.display = "block";
    }
    else{
        alert("Please enter a valid existing email address!");
        emailInput.value = "";
    }
}

function emailCheck(){
    const storedUserJSON = localStorage.getItem(emailInput.value);
    if(!storedUserJSON){
        return false;
    }
    try{
        const storedUserData = JSON.parse(storedUserJSON);
        if(storedUserData.email === emailInput.value){
            currentUserEmail = emailInput.value;
            emailInput.value = "";
            return true;
        }
        return false;
    }
    catch(error){
        console.error(error);
        return false;
    }
}

function passwordCheck(){
    const userJSON = localStorage.getItem(currentUserEmail);
    if(!userJSON){
        return false;
    }
    try{
        const userData = JSON.parse(userJSON);
        // Check for unique password.
        if(userData.password !== newPasswordInput.value){
            return true;
        }
        return false;
    }
    catch(error){
        console.error(error);
        return false;
    }
}

function submitNewPassword(){
    // Check if the new password meets the length requirements.
    if(newPasswordInput.value.length < 12){
        alert("Please enter a new password that is at least 12 characters long.");
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
    }
    // Check if the new password is equal to the old password.
    else if(!passwordCheck()){
        alert("Enter a new password, not your old one!");
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
    }
    // Check if the new password input is not equal to the confirm password input
    else if(newPasswordInput.value !== confirmPasswordInput.value){
        alert("The new password input and the confirm password input must be the same!");
    }
    else{
        // Store the new password and redirect the user to the login page.
        const userJSON = localStorage.getItem(currentUserEmail);
        if(userJSON){
            const userData = JSON.parse(userJSON);
            userData.password = newPasswordInput.value;
            localStorage.setItem(currentUserEmail, JSON.stringify(userData));
        }
        alert("Password reset successful!");
        window.location.href = "loginpg.html";
    }
}