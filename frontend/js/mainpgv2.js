// Main page opens on the myvault page.
let currentPageOption = "myvault-link";
let currentPage = "myvault-page";
let accounts = [];

let originalAccount = null;

// Account class
class Account{
    constructor(service, email, password){
        this.service = service;
        this.email = email;
        this.password = password;
    }
}

// DOM elements
const vaultLink = document.getElementById("myvault-link");
const addPasswordModal = document.getElementById("add-password-container");
const editPasswordModal = document.getElementById("edit-password-container");

const addModalOpenButton = document.getElementById("add-password-button");
const modalAddPasswordBtn = document.getElementById("modal-add-button");
const addModalCloseButton = document.getElementById("add-close-button");
const editModalCloseButton = document.getElementById("edit-close-button");

const PAGE_MAPPING = {
    "myvault-link": "myvault-page",
    "generator-link": "generator-page",
    "recycle-bin-link": "recycle-bin-page"
}

function initialiseApp(){
    // Accounts array reset.
    accounts.length = 0;
    // fillAccounts();
    loadPage(currentPage, currentPageOption);
}

/* Add Password Record Method */
async function addPasswordRecord(service, email, password){
    // console.log("addPasswordRecord method ran");
    // console.log("Service:", service);
    // console.log("Email:", email);
    // console.log("Password:", password);
    try{
        const response = await fetch("http://localhost:6969/passwords/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ service, email, password }),
        });
        let data;
        try{
            data = await response.json();
        }
        catch(jsonError){
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }
        alert("Password created and added to vault successfully!");
    }
    catch(error){
        console.error("Fetch error:", error.message);
        alert("An error occurred: "+ error.message);
    }    
}


function loadPage(page, pageOption){
    const pageElement = document.getElementById(page);
    const optionElement = document.getElementById(pageOption);

    if(pageElement && optionElement){
        // Adds active to the class list - enabling the :active styling.
        optionElement.classList.add("active");
        // Displays the elements of the page which were previously hidden.
        pageElement.style.display = "block";
    }
}

function changePage(pageOption){
    if(currentPageOption === pageOption){
        // Page doesnt need changing.
        return;
    }
    // Gets the current page option and page.
    const currentOptionElement = document.getElementById(currentPageOption);
    const currentPageElement = document.getElementById(currentPage);
    if(currentOptionElement){
        // If the page option exists, active is removed from the class list - disabling the :active styling.
        currentOptionElement.classList.remove("active");
    }
    if(currentPageElement){
        /// If the page exists, it is hidden to facilitate the page change.
        currentPageElement.style.display = "none";
    }
    // The current page option is set to the page option parameter passed in.
    currentPageOption = pageOption;
    // The current page becomes the page that is found in the page mapping object at the index of the page option. 
    currentPage = PAGE_MAPPING[pageOption] || currentPage;
    loadPage(currentPage, currentPageOption);
}

function logOut(){
    // Need to add a feature that physically logs the user out as well as the redirect.
    // so that the user can't click on the forward arrow to get back in.
    window.location.href = "loginpg.html";
}

/* Add Modal Methods */
function showAddModal(){
    clearAddModalInputs();
    document.getElementById("modal-title").textContent = "Add New Password";
    modalAddPasswordBtn.innerHTML = `<span class="plus">+</span><span>Add</span>`;
    addPasswordModal.style.display = "block";
}

function hideAddModal(){
    addPasswordModal.style.display = "none";
}

function clearAddModalInputs(){
    document.getElementById("add-service-input").value = "";
    document.getElementById("add-email-input").value = "";
    document.getElementById("add-password-input").value = "";
}

function handleAccountSubmit(){
    console.log("handleAccountSubmit method ran");
    // Attempts to retrieve a service, email and password.
    const service = document.getElementById("add-service-input").value.trim();
    const email = document.getElementById("add-email-input").value.trim();
    const password = document.getElementById("add-password-input").value.trim();

    // console.log("Service: ", service);
    // console.log("Email: ", email);
    // console.log("Password: ", password);

    // Validates whether a service, email and password input are present.
    if(!service || !email || !password){
        alert("Please fill in all fields");
        return;
    }
    // If present, a new instance of the account class is instantiated and pushed into the accounts array.
    const newAccount = new Account(service, email, password);
    accounts.push(newAccount);
    // fillAccounts();
    // Adds the password record to the backend database.
    addPasswordRecord(service, email, password);
}

/* Edit Modal Methods */
function showEditModal(account){
    if(!account){
        return;
    }
    originalAccount = account;
    document.getElementById("edit-modal-title").textContent = "Edit Password";
    document.getElementById("edit-service-input").value.trim() = account.service;
    document.getElementById("edit-email-input").value.trim() = account.email;
    document.getElementById("edit-password-input").value.trim() = account.password;
    editPasswordModal.style.display = "block";
}

function hideEditModal(){
    editPasswordModal.style.display = "none";
}


/* Event Listeners */
vaultLink.addEventListener("click", loadPage("myvault-page", "myvault-link"));
addModalOpenButton.addEventListener("click", showAddModal);
modalAddPasswordBtn.addEventListener("click", handleAccountSubmit);
addModalCloseButton.addEventListener("click", hideAddModal);

document.addEventListener("DOMContentLoaded", function(){
    initialiseApp();
})