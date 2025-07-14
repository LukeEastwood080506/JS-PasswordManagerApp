let currentPageOption = "menu-option-myvault";
let currentPage = "myvault-page";
let accounts = [];

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
  try {
    const savedAccounts = localStorage.getItem("accounts");
    if (savedAccounts) {
      const parsedAccounts = JSON.parse(savedAccounts);
      accounts.length = 0; // Clear existing accounts
      parsedAccounts.forEach((acc) => {
        if (acc && acc.service && acc.email && acc.password) {
          accounts.push(new Account(acc.service, acc.email, acc.password));
        }
      });
    }
  } catch (error) {
    console.error("Error loading accounts:", error);
    localStorage.removeItem("accounts"); // Clear invalid data
    accounts.length = 0;
  }

  loadPage(currentPage, currentPageOption);
  fillAccounts();
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

function showModal() {
  addPasswordModal.style.display = "block";
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

function getFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
}

function addAccount() {
  const serviceInput = document.getElementById("add-service-input");
  const emailInput = document.getElementById("add-email-input");
  const passwordInput = document.getElementById("add-password-input");

  if (!serviceInput || !emailInput || !passwordInput) {
    console.error("Required input elements not found");
    return;
  }

  const service = serviceInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!service || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  const newAccount = new Account(service, email, password);
  accounts.push(newAccount);

  const template = document.getElementById("account");
  const accountClone = template.cloneNode(true);

  accountClone.style.display = "flex";
  const serviceElement = accountClone.querySelector(".account-service");
  const emailElement = accountClone.querySelector(".account-email");
  const iconElement = accountClone.querySelector(".account-icon");

  if (serviceElement) {
    serviceElement.textContent = service;
  }

  if (emailElement) {
    emailElement.textContent = email;
  }

  if (iconElement) {
    iconElement.src = getFaviconUrl(service);
  }

  const editButton = accountClone.querySelector(".edit-icon");
  const deleteButton = accountClone.querySelector(".delete-icon");

  editButton.addEventListener("click", () => editAccount());
  deleteButton.addEventListener("click", () => {
    deleteAccount(service, email, password)
  });

  document.getElementById("accounts-section").appendChild(accountClone);

  clearModalInputs();
  hideModal();

  console.log("New account added:", newAccount);
  save(service, email, password);
}

function fillAccounts() {
  const accountsContainer = document.getElementById("accounts-section");

  const existingAccounts = accountsContainer.querySelectorAll(
    ".account:not(#account)"
  );
  existingAccounts.forEach((acc) => acc.remove());

  accounts.forEach((account, index) => {
    const template = document.getElementById("account");
    const accountClone = template.cloneNode(true);

    accountClone.style.display = "flex";
    accountClone.removeAttribute("id");

    const serviceElement = accountClone.querySelector(".account-service");
    const emailElement = accountClone.querySelector(".account-email");
    const iconElement = accountClone.querySelector(".account-icon");

    if (serviceElement) serviceElement.textContent = account.service;
    if (emailElement) emailElement.textContent = account.email;
    if (iconElement) iconElement.src = getFaviconUrl(account.service);

    const editButton = accountClone.querySelector(".edit-icon");
    const deleteButton = accountClone.querySelector(".delete-icon");

    if (editButton)
      editButton.addEventListener("click", () => editAccount(index));
    if (deleteButton)
      deleteButton.addEventListener("click", () => {
        deleteAccount(account.service, account.email, account.password);
      });

    accountsContainer.appendChild(accountClone);
  });
}

function logOut() {
  console.log("Logging out user");
  sessionStorage.setItem("isLoggedIn", "false");
  window.location.href = "loginpg.html";
}

if (addButton) {
  addButton.addEventListener("click", showModal);
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

// window.addEventListener("load", checkLoggedIn);
