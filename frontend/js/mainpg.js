let currentPageOption = "menu-option-myvault";
let currentPage = "myvault-page";
let accounts = [];

let isEditMode = false;
let originalAccount = null;

const addPasswordModal = document.getElementById("add-password-modal");
const addButton = document.getElementById("add-password-button");
const modalCloseButton = document.getElementsByClassName("close")[0];

class Account {
  constructor(service, email, password) {
    this.service = service;
    this.email = email;
    this.password = password;
  }
}

function showPassword(service, email, password){
  fetch("http://localhost:6969/passwords/show", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ service, email, password })
  })
  .then((response) => response.json())
  .then((data) =>{
    if(data.success){
      alert("Password has been displayed!");
      const password = data.message;
      const passwordElement = document.getElementById("account-password");
      // const accountElement = document.getElementById("account");
      if(passwordElement){
        passwordElement.textContent = password;
        passwordElement.style.display = "block";
        // accountElement.style.display = "block";
      }
    }
    else{
      alert(data.message || "Password cannot be displayed");
    }
  })
  .catch((error) =>{
    alert(error.message);
  })
}

function save(service, email, password) {
  fetch("http://localhost:6969/passwords/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ service, email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Password created and added to vault successfully!");
      } else {
        alert(data.message || "Password Creation Unsuccessful!");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

function deleteAccount(service, email, password) {
  fetch("http://localhost:6969/passwords/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ service, email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Password deleted from vault successfully!");
        refreshDiv(service, email);
      } else {
        alert(data.message || "Password Deletion Unsuccessful!");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

const PAGE_MAPPING = {
  "menu-option-myvault": "myvault-page",
  "menu-option-generator": "generator-page",
  "menu-option-recyclebin": "recyclebin-page",
};

// function checkLoggedIn() {
//   if (sessionStorage.getItem("isLoggedIn") === "true") {
//     initializeApp();
//   } else {
//     window.location.href = "loginpg.html";
//   }
// }

function initializeApp() {
  accounts.length = 0;
  fetch("http://localhost:6969/passwords/all")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        data.data.forEach((acc) => {
          if (acc && acc.service && acc.email && acc.password) {
            const existing = accounts.find(
              (a) => a.service === acc.service && a.email === acc.email
            );
            if(existing){
              // Keeps the plaintext password stored in memory.
              accounts.push(existing);
            }
            else{
              console.warn("Skpping backend account due to original password being missing", acc);
            }
          }
        });
        fillAccounts();
      } else {
        console.error("Failed to load passwords from backend");
      }
    })
    .catch((err) => {
      console.error("Error fetching passwords:", err);
    });
  loadPage(currentPage, currentPageOption);
}

function refreshDiv(service, email) {
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].service === service && accounts[i].email === email) {
      accounts.splice(i, 1);
      break;
    }
  }
  fillAccounts();
}

function loadPage(page, pageOption) {
  const pageElement = document.getElementById(page);
  const optionElement = document.getElementById(pageOption);

  if (pageElement && optionElement) {
    optionElement.classList.add("active");
    pageElement.style.display = "block";
  }
}

function changePage(pageOption) {
  console.log("Changing to page:", pageOption);

  if (currentPageOption === pageOption) {
    return;
  }

  const currentOptionElement = document.getElementById(currentPageOption);
  const currentPageElement = document.getElementById(currentPage);

  if (currentOptionElement) currentOptionElement.classList.remove("active");
  if (currentPageElement) currentPageElement.style.display = "none";

  currentPageOption = pageOption;
  currentPage = PAGE_MAPPING[pageOption] || currentPage;

  loadPage(currentPage, currentPageOption);
}

function showModal(account = null) {
  const isEditing = account !== null;
  isEditMode = isEditing;
  originalAccount = isEditing ? account : null;

  addPasswordModal.style.display = "block";
  const title = document.getElementById("modal-title");
  const button = document.getElementById("modal-add-button");

  if (isEditing) {
    title.textContent = "Edit Password";
    button.innerHTML = `<span class = "plus">&#9998;</span><span>Update</span>`;

    document.getElementById("add-service-input").value = account.service;
    document.getElementById("add-email-input").value = account.email;
    document.getElementById("add-password-input").value = account.password;
  } else {
    title.textContent = "Add New Password";
    button.innerHTML = `<span class="plus">+</span><span>Add</span>`;
    clearModalInputs();
  }
}

function hideModal() {
  addPasswordModal.style.display = "none";
}

function clearModalInputs() {
  const inputs = [
    document.getElementById("add-service-input"),
    document.getElementById("add-email-input"),
    document.getElementById("add-password-input"),
  ];

  inputs.forEach((input) => {
    if (input) input.value = "";
  });
}

// function getFaviconUrl(domain) {
//   return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
// }

function handleAccountSubmit() {
  const service = document.getElementById("add-service-input").value.trim();
  const email = document.getElementById("add-email-input").value.trim();
  const password = document.getElementById("add-password-input").value.trim();

  if (!service || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  if (isEditMode && originalAccount) {
    // Send to edit route
    fetch("http://localhost:6969/passwords/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originalService: originalAccount.service,
        originalEmail: originalAccount.email,
        originalPassword: originalAccount.password,
        newService: service,
        newEmail: email,
        newPassword: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Password updated successfully!");
          // Update local array
          const idx = accounts.findIndex(
            (a) =>
              a &&
              a.service === originalAccount.service &&
              a.email === originalAccount.email
          );
          if (idx !== -1) {
            accounts[idx] = new Account(service, email, password);
          }
          fillAccounts();
        } else {
          alert(data.message || "Password record could not be edited");
        }
      })
      .catch((err) => {
        alert(err.message);
      });
  } else {
    const newAccount = new Account(service, email, password);
    accounts.push(newAccount);
    fillAccounts();
    save(service, email, password);
  }
  isEditMode = false;
  originalAccount = null;
  hideModal();
  clearModalInputs();
}

function fillAccounts() {
  const accountsContainer = document.getElementById("accounts-section");

  const existingAccounts = accountsContainer.querySelectorAll(
    ".account:not(#account)"
  );
  existingAccounts.forEach((acc) => acc.remove());

  console.log("Filling accounts:", accounts);
  accounts.forEach((account, index) => {
    if (!account || !account.service || !account.email || !account.password) {
      console.warn("Invalid account skipped:", account);
      return;
    }

    const template = document.getElementById("account");
    const clone = template.cloneNode(true);
    clone.style.display = "flex";
    clone.removeAttribute("id");

    clone.querySelector(".account-service").textContent = account.service;
    clone.querySelector(".account-email").textContent = account.email;
    // clone.querySelector(".account-icon").src = getFaviconUrl(account.service);

    clone
      .querySelector(".eye-icon")
      .addEventListener("click", () =>
        showPassword(account.service, account.email, account.password)
      );
    clone
      .querySelector(".edit-icon")
      .addEventListener("click", () => showModal(account));
    clone
      .querySelector(".delete-icon")
      .addEventListener("click", () =>
        deleteAccount(account.service, account.email, account.password)
      );

    accountsContainer.appendChild(clone);
  });
}

// function editAccount(index) {
//   const acc = accounts[index];
//   if(!acc){
//     console.error("Invalid account index:", index, accounts);
//     return;
//   }
//   showModal(acc);
// }

function logOut() {
  console.log("Logging out user");
  sessionStorage.setItem("isLoggedIn", "false");
  window.location.href = "loginpg.html";
}

if (addButton) {
  addButton.addEventListener("click", showModal());
}

if (modalCloseButton) {
  modalCloseButton.addEventListener("click", hideModal);
}

window.addEventListener("click", (event) => {
  if (event.target === addPasswordModal) {
    hideModal();
  }
});

document.addEventListener("keydown", function (event) {
  const activeElement = document.activeElement;

  if (
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA"
  ) {
    return;
  } else {
    if (event.key === "#") {
      alert("clearing");
      accounts = [];
      save();
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  if(addButton){
    addButton.addEventListener("click", () => showModal());
  }
});

// window.addEventListener("load", checkLoggedIn);
