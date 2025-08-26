const tempEmail = "admin@gmail.com";
const tempPassword = "password";

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginButton = document.getElementById("login-button");

function submitLogin() {
  detailsCheck(emailInput.value, passwordInput.value);
}

function detailsCheck(email, password) {
  fetch('http://localhost:6969/users/login',{
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Sends cookies with the request.
    body: JSON.stringify({email, password})
  })
  .then((response) => response.json())
  .then((data) =>{
    if(data.success){
      alert("Login successful!");
      window.location.href = "mainpg.html";
    }
    else{
      alert(data.message || "Login Unsuccessful!")
    }
  })
  .catch((error) =>{
    alert(error.message);
  });
}

loginButton.addEventListener("click", submitLogin);