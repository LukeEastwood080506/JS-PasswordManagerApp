const userNameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");

const tempUsername = "admin";
const tempPassword = "password";

function submitLogin(){
    // if the username and password match the temporary values, redirect to the home page.
    if(userNameInput.value === tempUsername && passwordInput.value === tempPassword){
        alert("Login successful!");
        window.location.href = "../index.html";
    }
    else{
        alert("Invalid username or password. Please try again.");
        userNameInput.value = "";
        passwordInput.value = "";
    }
}