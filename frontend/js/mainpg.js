let currentPageOption = "myvault-link";
let currentPage = "myvault-page";
let accounts = [];
let deletedAccounts = [];

let isEditMode = false;
let originalAccount = null;

// Account class
class Account {
  constructor(service, email, password) {
    this.service = service;
    this.email = email;
    this.password = password;
  }
}

// deletedAccount class for recycle bin
class deletedAccount {
  constructor(deletedService, deletedEmail) {
    this.deletedService = deletedService;
    this.deletedEmail = deletedEmail;
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
  "recycle-bin-link": "recycle-bin-page",
};

function initialiseApp() {
  // console.log("Accounts: ", accounts);
  // Fetch stored passwords.
  fetch("http://localhost:6969/passwords/all")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        data.data.forEach((acc) => {
          if (acc && acc.service && acc.email && acc.password) {
            const existing = accounts.find(
              (a) => a.service === acc.service && a.email === acc.email
            );
            accounts.push(acc);
          }
        });
        fillAccounts();
      } else {
        console.error("Failed to load passwords from backend");
      }
    })
    .catch((err) => {
      alert("Error fetching passwords: ", err);
      console.error("Error fetching passwords:", err);
    });
  // Fetch deleted passwords for recycle bin.
  fetch("http://localhost:6969/deletedPasswords/all")
    .then((response) => response.json())
    .then((data) => {
      // console.log("Deleted passwords data:", data);
      if (data.success) {
        data.data.forEach((deletedAcc) => {
          if (deletedAcc && deletedAcc.deletedService && deletedAcc.deletedEmail) {
            const existing = deletedAccounts.find(
              (da) =>
                da.service === deletedAcc.deletedService &&
                da.email === deletedAcc.deletedEmail
            );
            deletedAccounts.push(deletedAcc);
          }
        });
        // Call function to fill deleted accounts on the recycle bin page.
        fillDeletedAccounts();
      } else {
        console.error("Failed to load deleted passwords from backend");
      }
    })
    .catch((err) => {
      alert("Error fetching deleted passwords: ", err);
      console.error("Error fetching deleted passwords:", err);
    });
  loadPage(currentPage, currentPageOption);
}

function fillAccounts() {
  const accountsContainer = document.getElementById("password-records-section");
  const template = document.querySelector(".account.template");

  // Clear existing accounts
  const existingAccounts = accountsContainer.querySelectorAll(
    ".account:not(.template)"
  );
  existingAccounts.forEach((acc) => acc.remove());

  accounts.forEach((account) => {
    if (!account?.service || !account?.email || !account?.password) {
      console.warn("Invalid account skipped:", account);
      return;
    }

    const clone = template.cloneNode(true);
    clone.classList.remove("template");
    clone.style.display = "flex";

    // Fill data
    clone.querySelector(".account-service").textContent = account.service;
    clone.querySelector(".account-email").textContent = account.email;

    const viewIcon = clone.querySelector(".view-password-icon");
    const passwordElement = clone.querySelector(".account-display-password");

    viewIcon.addEventListener("click", async () => {
      await togglePassword(viewIcon, passwordElement, account);
    });

    clone.querySelector(".edit-password-icon").addEventListener("click", () => {
      showEditModal(account);
    });

    clone
      .querySelector(".delete-password-icon")
      .addEventListener("click", () => {
        deleteAccount(account.service, account.email, account.password);
      });

    accountsContainer.appendChild(clone);
  });
}

function fillDeletedAccounts() {
  // console.log("Running fillDeletedAccounts, current deletedAccounts:", deletedAccounts);
  const deletedAccountsContainer = document.getElementById(
    "deleted-passwords-records-section"
  );
  const template = document.querySelector(".recyclebin.template");
  // Clear existing accounts
  const existingAccounts = deletedAccountsContainer.querySelectorAll(
    ".recyclebin:not(.template)"
  );
  existingAccounts.forEach((acc) => acc.remove());

  deletedAccounts.forEach((dacc) => {
    if (!dacc?.deletedService || !dacc?.deletedEmail) {
      console.warn("Invalid account skipped:", dacc);
      return;
    }

    const clone = template.cloneNode(true);
    clone.classList.remove("template");
    clone.style.display = "flex";

    // Fill data
    clone.querySelector(".recycled-service").textContent = dacc.deletedService;
    clone.querySelector(".recycled-email").textContent = dacc.deletedEmail;

    const restoreIcon = clone.querySelector(".restore-password-icon");
    const permaDeleteIcon = clone.querySelector(".permenant-delete-icon");

    restoreIcon.addEventListener("click", () => {
      alert("Restore icon clicked");
    });

    permaDeleteIcon.addEventListener("click", () => {
      alert("permaDelete icon clicked");
    });

    deletedAccountsContainer.appendChild(clone);
  });
}

function recycleBin(deletedService, deletedEmail) {
  // console.log("Recycle bin function ran!");
  return fetch("http://localhost:6969/deletedPasswords/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deletedService, deletedEmail }),
  }).then((response) => response.json());
}

function handleAccountSubmit(isEditMode) {
  // console.log("isEditMode: ", isEditMode);
  if (!isEditMode) {
    const service = document.getElementById("add-service-input").value.trim();
    const email = document.getElementById("add-email-input").value.trim();
    const password = document.getElementById("add-password-input").value.trim();

    if (!service || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    const newAccount = new Account(service, email, password);
    accounts.push(newAccount);
    fillAccounts();
    save(service, email, password);
  } else {
    const service = document.getElementById("edit-service-input").value.trim();
    const email = document.getElementById("edit-email-input").value.trim();
    const password = document
      .getElementById("edit-password-input")
      .value.trim();
    const currentPassword = document
      .getElementById("edit-current-password-input")
      .value.trim();

    if (!service || !email || !password || !currentPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (originalAccount) {
      fetch("http://localhost:6969/passwords/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalService: originalAccount.service,
          originalEmail: originalAccount.email,
          originalPassword: currentPassword,
          newService: service,
          newEmail: email,
          newPassword: password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Credentials for website/app updated successfully!");
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
            alert(data.message || "Credentials could not be edited");
          }
        })
        .catch((err) => {
          alert(err.message);
        });
    }
  }
  isEditMode = false;
  originalAccount = null;
  hideAddModal();
  hideEditModal();
  clearModalInputs();
}

async function togglePassword(iconElement, passwordElement, account) {
  // Sets a data attribute.
  const isVisible = passwordElement.dataset.visible === "true";

  if (isVisible) {
    // Hide password on password record tile.
    passwordElement.style.display = "none";
    passwordElement.textContent = "password";
    passwordElement.dataset.visible = "false";
    iconElement.src = "../assets/eye-crossed-icon.svg";
    alert("Password has been hidden!");
    return;
  }

  // Show password on password record tile.
  try {
    const response = await fetch("http://localhost:6969/passwords/show", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: account.service,
        email: account.email,
        password: account.password,
      }),
    });
    const data = await response.json();

    if (data.success) {
      // Changes the textContent of the password element to the password and displays the password element.
      // Changes the icon to the regular eye icon.
      alert("Password has been displayed");
      passwordElement.textContent = data.message;
      passwordElement.style.display = "block";
      passwordElement.dataset.visible = "true";
      iconElement.src = "../assets/eye-icon.svg";
    } else {
      alert(data.message || "Password cannot be displayed");
    }
  } catch (err) {
    alert(err.message);
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
        alert("Password record created and added to vault successfully!");
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
        alert("Password record deleted from vault successfully!");
        refreshDiv(service, email);
        deletedAccounts.push({
          service,
          email,
        });
        recycleBin(service, email)
          .then((data) => {
            if (data.success) {
              fillDeletedAccounts();
            } else {
              alert(data.message || "Recycle bin addition unsuccessful!");
            }
          })
          .catch((error) => {
            alert(error.message);
          });
      } else {
        alert(data.message || "Password Deletion Unsuccessful!");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

function loadPage(page, pageOption) {
  const pageElement = document.getElementById(page);
  const optionElement = document.getElementById(pageOption);

  if (pageElement && optionElement) {
    // Adds active to the class list - enabling the :active styling.
    optionElement.classList.add("active");
    // Displays the elements of the page which were previously hidden.
    pageElement.style.display = "block";
  }
}

function changePage(pageOption) {
  if (currentPageOption === pageOption) {
    // Page doesnt need changing.
    return;
  }
  // Gets the current page option and page.
  const currentOptionElement = document.getElementById(currentPageOption);
  const currentPageElement = document.getElementById(currentPage);
  if (currentOptionElement) {
    // If the page option exists, active is removed from the class list - disabling the :active styling.
    currentOptionElement.classList.remove("active");
  }
  if (currentPageElement) {
    /// If the page exists, it is hidden to facilitate the page change.
    currentPageElement.style.display = "none";
  }
  // The current page option is set to the page option parameter passed in.
  currentPageOption = pageOption;
  // The current page becomes the page that is found in the page mapping object at the index of the page option.
  currentPage = PAGE_MAPPING[pageOption] || currentPage;
  loadPage(currentPage, currentPageOption);

  if(pageOption === "recycle-bin-link"){
    fillDeletedAccounts();
  }
}

function logOut() {
  // Need to add a feature that physically logs the user out as well as the redirect.
  // so that the user can't click on the forward arrow to get back in.
  window.location.href = "loginpg.html";
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

/* Add Modal Methods */
function showAddModal() {
  clearModalInputs();
  document.getElementById("modal-title").textContent = "Add New Password";
  modalAddPasswordBtn.innerHTML = `<span class="plus">+</span><span>Add</span>`;
  addPasswordModal.style.display = "block";
}

function hideAddModal() {
  addPasswordModal.style.display = "none";
}

function clearModalInputs() {
  // Clears add modal inputs.
  document.getElementById("add-service-input").value = "";
  document.getElementById("add-email-input").value = "";
  document.getElementById("add-password-input").value = "";
  // Clears edit modal inputs.
  document.getElementById("edit-service-input").value = "";
  document.getElementById("edit-email-input").value = "";
  document.getElementById("edit-password-input").value = "";
  document.getElementById("edit-current-password-input").value = "";
}

/* Edit Modal Methods */
function showEditModal(account) {
  if (!account) {
    return;
  }
  originalAccount = account;
  document.getElementById("edit-modal-title").textContent = "Edit Password";
  document.getElementById("edit-service-input").value = account.service;
  document.getElementById("edit-email-input").value = account.email;
  document.getElementById("edit-password-input").value = account.password;
  editPasswordModal.style.display = "block";
}

function hideEditModal() {
  editPasswordModal.style.display = "none";
}

/* Event Listeners */
if (addModalOpenButton) {
  addModalOpenButton.addEventListener("click", showAddModal);
}

if (addModalCloseButton) {
  addModalCloseButton.addEventListener("click", hideAddModal);
}

if (editModalCloseButton) {
  editModalCloseButton.addEventListener("click", hideEditModal);
}

window.addEventListener("click", (event) => {
  if (event.target === addPasswordModal) {
    hideAddModal();
  }
});

document.querySelector(".add-pass-inputs").addEventListener("submit", (e) => {
  e.preventDefault();
  isEditMode = false;
  handleAccountSubmit(isEditMode);
});

document.querySelector(".edit-pass-inputs").addEventListener("submit", (e) => {
  e.preventDefault();
  isEditMode = true;
  handleAccountSubmit(isEditMode);
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
  initialiseApp();
  if (addModalOpenButton) {
    addModalOpenButton.addEventListener("click", () => showAddModal());
  }
});
