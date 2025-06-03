const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");

const tempEmail = "admin@gmail.com";
const tempPassword = "password";

// Event listener methods for enter key submission.
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

function submitLogin(){
    // if the email and password match the temporary values, redirect to the home page.
    // Alternatively, if the detailsCheck method returns true, redirect to the home page.
    // If true is returned from the detailsCheck method it means that the inputted details match those that are stored in local storage (user details that were submitted on sign-up).
    if(emailInput.value.trim() === tempEmail && passwordInput.value.trim() === tempPassword || detailsCheck()){
        alert("Login successful!");
        
        // Store the current user's email for use in other pages
        localStorage.setItem("currentUser", emailInput.value);
        console.log(localStorage);
        
        // Add link to the home page upon completion.
        // window.location.href = "mainpg.html";
    }
    // Check that verifies whether an email was actually entered.
    // It checks for an @ symbol in the email input.
    else if(!emailInput.value.includes("@")){
        alert("Please enter a valid email address.");
        emailInput.value = "";
        passwordInput.value = "";
    }
    else{
        alert("Invalid email or password. Please try again.");
        emailInput.value = "";
        passwordInput.value = "";
    }
}

function detailsCheck(){
    // Attempt to retrieve user data from localStorage.
    const storedUserJSON = localStorage.getItem(emailInput.value);
    if(!storedUserJSON){
        return false;
    }
    try{
        // parses JSON string into an object
        const storedUserData = JSON.parse(storedUserJSON);
        // Compare the entered password with the stored password (the value from the object) in localStorage.
        if(storedUserData.password === passwordInput.value.trim()){
            return true;
        }
        return false;
    }
    catch(error){
        console.error(error);
        return false;
    }
}
