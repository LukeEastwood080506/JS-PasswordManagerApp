let currentPageOption = "myvault-link";
let currentPage = "myvault-page";
let accounts = [];
let deletedAccounts = [];
let notifications = [];

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
  constructor(deletedService, deletedEmail, deletedPassword) {
    this.deletedService = deletedService;
    this.deletedEmail = deletedEmail;
    this.deletedPassword = deletedPassword;
  }
}

// Notification class for the notification modal.
class Notification {
  constructor(title, content) {
    this.title = title;
    this.content = content;
  }
}

// DOM elements
const vaultLink = document.getElementById("myvault-link");
const addPasswordModal = document.getElementById("add-password-container");
const editPasswordModal = document.getElementById("edit-password-container");
const notificationsModal = document.getElementById(
  "notifications-modal-container"
);

const addModalOpenButton = document.getElementById("add-password-button");
const modalAddPasswordBtn = document.getElementById("modal-add-button");
const addModalCloseButton = document.getElementById("add-close-button");
const editModalCloseButton = document.getElementById("edit-close-button");
const notificationsCloseButton = document.getElementById(
  "notifications-close-button"
);

const notificationsIcon = document.querySelector("#notification-bell img");

const PAGE_MAPPING = {
  "myvault-link": "myvault-page",
  "generator-link": "generator-page",
  "recycle-bin-link": "recycle-bin-page",
};

function initialiseApp() {
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
      // alert("Error fetching passwords: ", err);
      console.error("Error fetching passwords:", err);
    });
  // Fetch deleted passwords for recycle bin.
  fetch("http://localhost:6969/deletedPasswords/all")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        data.data.forEach((deletedAcc) => {
          if (
            deletedAcc &&
            deletedAcc.deletedService &&
            deletedAcc.deletedEmail &&
            deletedAcc.deletedPassword
          ) {
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
      // alert("Error fetching deleted passwords: ", err);
      console.error("Error fetching deleted passwords:", err);
    });
  // Fetch notifications for notifications modal.
  // (PROBABLY DONT NEED THIS RUNNING ON APP LAUNCH COULD JUST DO IT WHEN NOTIFICATIONS BELL IS CLICKED)
  fetch("http://localhost:6969/notifications/all")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        data.data.forEach((noti) => {
          if (noti && noti.title && noti.content) {
            const existing = notifications.find(
              (n) => n.title === noti.title && n.content === noti.content
            );
            notificationsIcon.src = "../assets/bell-red-circle.png";
            notifications.push(noti);
          }
        });
        fillNotifications();
      } else {
        console.error("Failed to load notifications from backend");
      }
    })
    .catch((err) => {
      // alert("Error fetching notifications: ", err);
      console.error("Error fetching notifications: ", err);
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
      await togglePassword(false, viewIcon, passwordElement, account);
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
    if (
      !dacc?.deletedService ||
      !dacc?.deletedEmail ||
      !dacc?.deletedPassword
    ) {
      console.warn("Invalid account skipped:", dacc);
      return;
    }

    const clone = template.cloneNode(true);
    clone.classList.remove("template");
    clone.style.display = "flex";

    // Fill data
    clone.querySelector(".recycled-service").textContent = dacc.deletedService;
    clone.querySelector(".recycled-email").textContent = dacc.deletedEmail;

    const passwordElement = clone.querySelector(".recycled-password");
    passwordElement.textContent = "password";
    passwordElement.dataset.visible = "false";

    const viewIcon = clone.querySelector(".view-deleted-password-icon");
    const restoreIcon = clone.querySelector(".restore-password-icon");
    const permaDeleteIcon = clone.querySelector(".permenant-delete-icon");

    viewIcon.addEventListener("click", async () => {
      await togglePassword(true, viewIcon, passwordElement, dacc);
    });

    restoreIcon.addEventListener("click", () => {
      restorePassword(dacc.deletedService, dacc.deletedEmail, dacc.deletedPassword);
    });

    permaDeleteIcon.addEventListener("click", () => {
      // Function that permenantly deletes the record in the recycle bin.
      permaDelete(dacc.deletedService, dacc.deletedEmail, dacc.deletedPassword);
    });

    deletedAccountsContainer.appendChild(clone);
  });
}

function fillNotifications() {
  const notificationsContainer = document.getElementById(
    "notifications-section"
  );
  const template = document.querySelector(".notification.template");

  // Clear existing notifications
  const existingNotifications = notificationsContainer.querySelectorAll(
    ".notification:not(.template)"
  );
  existingNotifications.forEach((noti) => noti.remove());

  notifications.forEach((notification) => {
    if (!notification?.title || !notification?.content) {
      console.warn("Invalid notification skipped:", notification);
      return;
    }

    const clone = template.cloneNode(true);
    clone.classList.remove("template");
    clone.style.display = "flex";

    // Fill notifications
    clone.querySelector(".notification-title").textContent = notification.title;
    clone.querySelector(".notification-content").textContent =
      notification.content;

    const deleteIcon = clone.querySelector(".delete-notification-icon");
    // Add event listener for delete icon.
    deleteIcon.addEventListener("click", () => {
      deleteNotification(notification.title, notification.content);
    });

    notificationsContainer.appendChild(clone);
  });
}

function sliderFunction(){
  const slider = document.getElementById("lengthRangeSlider");
  let sliderText = document.getElementById("slider-text");
  slider.oninput = function(){
    sliderText.textContent = "Password Length: " + this.value;
    generatePassword(this.value);
  }
}

function generatePassword(length = 12) {
  const generatedPassword = document.getElementById("generated-password");
  // Character groups
  const charGroups = {
    letters: "abcdefghijklmnopqrstuvwxyz",
    mixedCase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    punctuation: "!@#$%^&*()",
  };
  // Build list of selected groups
  const selectedGroups = [];
  if (document.getElementById("letters-checkbox").checked) selectedGroups.push(charGroups.letters);
  if (document.getElementById("mixed-case-checkbox").checked) selectedGroups.push(charGroups.mixedCase);
  if (document.getElementById("numbers-checkbox").checked) selectedGroups.push(charGroups.numbers);
  if (document.getElementById("punctuation-checkbox").checked) selectedGroups.push(charGroups.punctuation);
  // Fallback if nothing is selected.
  if(selectedGroups.length === 0) selectedGroups.push(charGroups.letters);
  console.log("Selected char groups: " + selectedGroups);
  // Pick one character from each group to start building the password.
  let passwordChars = selectedGroups.map(group => group[Math.floor(Math.random() * group.length)]);
  console.log("Chars (one from each group): " + passwordChars);
  // Fill remaining length with random characters from combined pool.
  const combinedPool = selectedGroups.join("");
  console.log("Combined pool: " + combinedPool);
  for(let i = passwordChars.length; i < length; i++){
    passwordChars.push(combinedPool[Math.floor(Math.random() * combinedPool.length)]);
  }
  // Shuffle the password so the guaranteed characters aren't in fixed positions.
  passwordChars = passwordChars.sort(() => Math.random() - 0.5);
  console.log("Password chars: " + passwordChars);

  // Display password
  const password = passwordChars.join("");
  generatedPassword.textContent = password;

  // Run extra functions
  strengthChecker(password);
  return password;
}

document.getElementById("add-to-vault").addEventListener("click", () => {
  const password = document.getElementById("generated-password").textContent
  addGeneratedPassword(password);
});
document.getElementById("restore-settings").addEventListener("click", () => {
  restoreGeneratorSettings();
});

function strengthChecker(password) {
  const mixedCaseCheck = document.getElementById("mixed-case-checkbox").checked;
  const numbersCheck = document.getElementById("numbers-checkbox").checked;
  const punctuationCheck = document.getElementById("punctuation-checkbox").checked;
  const passwordStrengthHeading = document.getElementById("display-password-strength");
  switch (true) {
    // Password too short
    case (password.length < 8):
      passwordStrengthHeading.textContent = "Password Strength: Very Weak";
      break;
    case (password.length < 12):
      passwordStrengthHeading.textContent = "Password Strength: Weak";
      break;
    // Password is long but is lacking variety.
    case (password.length >= 12 && (!mixedCaseCheck || !numbersCheck)):
      passwordStrengthHeading.textContent = "Password Strength: Moderate";
      break;
    // Password is long and varied but lacking punctuation.
    case (password.length >= 12 && mixedCaseCheck && numbersCheck && !punctuationCheck):
      passwordStrengthHeading.textContent = "Password Strength: Strong";
      break;
    default:
      passwordStrengthHeading.textContent = "Password Strength: Very Strong";
  }
}

function initialiseCheckboxListeners() {
  const checkboxes = document.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // Regenerates password on toggle of any checkbox.
      generatePassword();
    });
  });
}

function addGeneratedPassword(password) {
  const generatedPassword = password;
  // console.log("Password passed to addGeneratedPassword method: ", password);
  // Ask the user the service they want to attach the generated password to, in the vault.
  const vaultService = prompt("Type a service from the vault for which you want the generated password to be attached to: ");
  if (vaultService === null) {
    return;
  }
  fetch("http://localhost:6969/generator/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ generatedPassword, vaultService }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // console.log("The generated password has successfully been added to the vault for the service: " + vaultService);
        alert("The generated password has successfully been added to the vault for the service: " + vaultService);
      } else {
        alert(data.message || "The generated password could not be added to the vault!");
      }
    })
    .catch((error) => {
      console.error(error.message);
      console.log(error.message);
    })
}

function restoreGeneratorSettings() {
  // Reset checkboxes to default checked state.
  document.getElementById("letters-checkbox").checked = true;
  document.getElementById("mixed-case-checkbox").checked = true;
  document.getElementById("numbers-checkbox").checked = true;
  document.getElementById("punctuation-checkbox").checked = true;
  // Reset slider for default password length - 12.
  const slider = document.getElementById("lengthRangeSlider");
  slider.value = 12;
  let sliderText = document.getElementById("slider-text");
  sliderText.textContent = "Password Length: 12";
  // Regenerate password.
  generatePassword();
}

function recycleBin(deletedService, deletedEmail, deletedPassword) {
  return fetch("http://localhost:6969/deletedPasswords/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deletedService, deletedEmail, deletedPassword }),
  }).then((response) => response.json());
}

function handleAccountSubmit(isEditMode) {
  if (!isEditMode) {
    const service = document.getElementById("add-service-input").value.trim();
    const email = document.getElementById("add-email-input").value.trim();
    const password = document.getElementById("add-password-input").value.trim();

    if (!service || !email || !password) {
      // alert("Please fill in all fields");
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
      // alert("Please fill in all fields");
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
            // alert("Credentials for website/app updated successfully!");
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
            // alert(data.message || "Credentials could not be edited");
          }
        })
        .catch((err) => {
          // alert(err.message);
        });
    }
  }
  isEditMode = false;
  originalAccount = null;
  hideAddModal();
  hideEditModal();
  clearModalInputs();
}

async function togglePassword(
  isRecycleBin,
  iconElement,
  passwordElement,
  account
) {
  // Sets a data attribute.
  const isVisible = passwordElement.dataset.visible === "true";

  // Toggle hide on password record tile.
  if (isVisible) {
    updatePasswordUI(false, iconElement, passwordElement, "password");
    return;
  }

  // Show password on password record tile.
  try {
    const password = await fetchPassword(isRecycleBin, account);
    if (password) {
      updatePasswordUI(true, iconElement, passwordElement, password);
    } else {
      // alert("Password cannot be displayed");
    }
  } catch (err) {
    // alert(err.message);
  }
}

async function fetchPassword(isRecycleBin, account) {
  const url = isRecycleBin
    ? "http://localhost:6969/deletedPasswords/show"
    : "http://localhost:6969/passwords/show";
  const body = isRecycleBin
    ? {
      deletedService: account.deletedService,
      deletedEmail: account.deletedEmail,
      deletedPassword: account.deletedPassword,
    }
    : {
      service: account.service,
      email: account.email,
      password: account.password,
    };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data.success ? data.message : null;
}

function updatePasswordUI(show, iconElement, passwordElement, text) {
  passwordElement.textContent = text;
  passwordElement.style.display = show ? "block" : "none";
  passwordElement.dataset.visible = show ? "true" : "false";
  iconElement.src = show
    ? "../assets/eye-icon.svg"
    : "../assets/eye-crossed-icon.svg";
}

function toggleNotificationsModal() {
  if (
    notificationsModal.style.display === "none" ||
    notificationsModal.style.display === ""
  ) {
    fillNotifications();
    notificationsModal.style.display = "block";
  } else {
    notificationsModal.style.display = "none";
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
        // alert("Password record created and added to vault successfully!");
        // POST request needed to /notifications/new
        const title = "Vault - Add Notification";
        const content = "Password record added to vault!";
        addNotification(title, content);
        refreshNotificationsDiv(title, content);
      } else {
        // alert(data.message || "Password Creation Unsuccessful!");
      }
    })
    .catch((error) => {
      // alert(error.message);
    });
}

function deleteAccount(deletedService, deletedEmail, deletedPassword) {
  fetch("http://localhost:6969/passwords/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deletedService, deletedEmail, deletedPassword }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // alert("Password record deleted from vault successfully!");
        refreshVaultDiv(service, email);
        const title = "Vault - Delete Notification";
        const content = "Password deleted from vault and moved to recycle bin!";
        addNotification(title, content);
        refreshNotificationsDiv(title, content);
        deletedAccounts.push({
          deletedService,
          deletedEmail,
          deletedPassword,
        });
        recycleBin(deletedService, deletedEmail, deletedPassword)
          .then((data) => {
            if (data.success) {
              fillDeletedAccounts();
            } else {
              // alert(data.message || "Recycle bin addition unsuccessful!");
            }
          })
          .catch((error) => {
            // alert(error.message);
          });
      } else {
        // alert(data.message || "Password Deletion Unsuccessful!");
      }
    })
    .catch((error) => {
      // alert(error.message);
    });
}

function restorePassword(deletedService, deletedEmail, deletedPassword) {
  fetch("http://localhost:6969/deletedPasswords/restore", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deletedService, deletedEmail, deletedPassword }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // alert("Password successfully restored to the vault!");
        const title = "Recycle Bin - Restore Notification";
        const message = "Recycled record has been restored to vault!";
        addNotification(title, message);
        accounts.push({
          deletedService,
          deletedEmail,
          deletedPassword
        });
        // Need some way to refresh the vault div.
        refreshRecycleBinDiv();
        refreshVaultDiv();
      } else {
        // alert(data.message || "Recycle bin record restoration unsuccessful!");
      }
    })
    .catch((error) => {
      // alert(error.message);
    })
}

function permaDelete(deletedService, deletedEmail, deletedPassword) {
  fetch("http://localhost:6969/deletedPasswords/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deletedService, deletedEmail, deletedPassword }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // alert the user that the records been permenantly deleted.
        // refresh the recycle bin div somehow by filling the deletedAccounts again to remove
        // the recently deleted recycle bin record onscreen.
        alert(
          "The password record has been permenantly deleted from the recycle bin!"
        );
        const title = "Recycle Bin - Delete Notification";
        const content = "Password permenantly deleted from recycle bin!";
        addNotification(title, content);
        refreshNotificationsDiv(title, content);
        refreshRecycleBinDiv(deletedService, deletedEmail);
      } else {
        // alert(data.message || "Recycle Bin Password Deletion Unsuccessful!");
      }
    })
    .catch((error) => {
      // alert(error.message);
    });
}

function addNotification(title, content) {
  fetch("http://localhost:6969/notifications/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("New message added to notifications");
      } else {
        console.log(
          data.message || "New message could not be added to notifications"
        );
      }
    })
    .catch((error) => {
      console.error(error.message);
    });
  // Need a way of refreshing the notifications modal.
  fillNotifications();
}

function deleteNotification(title, content) {
  fetch("http://localhost:6969/notifications/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // alert("This notification has been deleted!");
        refreshNotificationsDiv(title, content);
      } else {
        // alert(data.message || "Notification deletion unsuccessful!");
      }
    })
    .catch((error) => {
      // alert(error.message);
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

  if (pageOption === "recycle-bin-link") {
    fillDeletedAccounts();
  }

  if (pageOption === "generator-link") {
    generatePassword();
  }
}

function logOut() {
  // Need to add a feature that physically logs the user out as well as the redirect.
  // so that the user can't click on the forward arrow to get back in.
  window.location.href = "loginpg.html";
}

function refreshVaultDiv(service, email) {
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].service === service && accounts[i].email === email) {
      accounts.splice(i, 1);
      break;
    }
  }
  fillAccounts();
}

function refreshRecycleBinDiv(deletedService, deletedEmail) {
  for (let i = 0; i < deletedAccounts.length; i++) {
    if (
      deletedAccounts[i].deletedService === deletedService &&
      deletedAccounts[i].deletedEmail === deletedEmail
    ) {
      deletedAccounts.splice(i, 1);
      break;
    }
  }
  fillDeletedAccounts();
}

function refreshNotificationsDiv(deletedTitle, deletedContent) {
  for (let i = 0; i < notifications.length; i++) {
    if (
      notifications[i].title === deletedTitle &&
      notifications[i].content === deletedContent
    ) {
      notifications.splice(i, 1);
      break;
    }
  }
  fillNotifications();
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

if (notificationsIcon) {
  notificationsIcon.addEventListener("click", () => {
    toggleNotificationsModal(); // Show notifications modal.
  });
}

if (notificationsCloseButton) {
  notificationsCloseButton.addEventListener("click", () => {
    notificationsModal.style.display = "none";
  });
}

window.addEventListener("click", (event) => {
  if (event.target === addPasswordModal) {
    hideAddModal();
  }
  if (event.target === notificationsModal) {
    notificationsModal.style.display = "none";
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
      // alert("clearing");
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
  generatePassword();
  initialiseCheckboxListeners();
  sliderFunction();
});
