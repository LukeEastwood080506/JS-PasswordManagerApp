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
const dynamicModal = document.getElementById("dynamic-mainpg-modal-container");
const pinModal = document.getElementById("pin-modal-container");
const addToVaultModal = document.getElementById("add-to-vault-modal-container");

const addModalOpenButton = document.getElementById("add-password-button");
const modalAddPasswordBtn = document.getElementById("modal-add-button");
const addModalCloseButton = document.getElementById("add-close-button");
const editModalCloseButton = document.getElementById("edit-close-button");
const notificationsCloseButton = document.getElementById(
  "notifications-close-button"
);
const notificationsIcon = document.querySelector("#notification-bell img");
const closeDynamicModalBtn = document.getElementById("dynamic-mainpg-modal-close-button");
const dynamicModalTitle = document.getElementById("dynamic-mainpg-modal-title");
const dynamicModalMessage = document.getElementById("dynamic-mainpg-modal-message");
const dynamicModalOkButton = document.getElementById("ok-button");
const addPinButton = document.getElementById("add-pin-button");
const addToVaultModalOpenButton = document.getElementById("add-to-vault");
const addToVaultModalCloseButton = document.getElementById("add-to-vault-modal-close-button");
const addGeneratedPasswordBtn = document.getElementById("add-generated-password-button");
const generatorRestoreSettingsBtn = document.getElementById("restore-settings");

const PAGE_MAPPING = {
  "myvault-link": "myvault-page",
  "generator-link": "generator-page",
  "recycle-bin-link": "recycle-bin-page",
};

function initialiseApp() {
  // Fetch all password records for the vault
  fetch("http://127.0.0.1:6969/passwords/all", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        accounts = [];
        // Populate accounts array with valid records
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
      console.error("Error fetching passwords:", err);
    });
  // Fetch deleted passwords for recycle bin.
  fetch("http://127.0.0.1:6969/deletedPasswords/all", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        deletedAccounts = [];
        // Populate deletedAccounts array with valid records
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
        // Fill deleted accounts on the recycle bin page.
        fillDeletedAccounts();
      } else {
        console.error("Failed to load deleted passwords from backend");
      }
    })
    .catch((err) => {
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
    // Clone template and fill in account data for each record
    const clone = template.cloneNode(true);
    clone.classList.remove("template");
    clone.style.display = "flex";

    // Fill data
    clone.querySelector(".account-service").textContent = account.service;
    clone.querySelector(".account-email").textContent = account.email;

    const viewIcon = clone.querySelector(".view-password-icon");
    const passwordElement = clone.querySelector(".account-display-password");

    // Add event listeners for view, edit, and delete actions
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
    // Clone template and fill in deleted account data for each record
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

    // Add event listeners for view, restore, and permanent delete actions
    viewIcon.addEventListener("click", async () => {
      await togglePassword(true, viewIcon, passwordElement, dacc);
    });
    restoreIcon.addEventListener("click", () => {
      restorePassword(dacc.deletedService, dacc.deletedEmail, dacc.deletedPassword);
    });
    permaDeleteIcon.addEventListener("click", () => {
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
    if (!notification.id || !notification?.title || !notification?.content) {
      console.warn("Invalid notification skipped:", notification);
      return;
    }
    // Clone template and fill in notification data for each record
    const clone = template.cloneNode(true);
    clone.classList.remove("template");
    clone.style.display = "flex";

    // Fill notifications
    clone.querySelector(".notification-title").textContent = notification.title;
    clone.querySelector(".notification-content").textContent =
      notification.content;

    const deleteIcon = clone.querySelector(".delete-notification-icon");
    // Add event listener for delete icon
    deleteIcon.addEventListener("click", () => {
      deleteNotification(notification.id);
    });

    notificationsContainer.appendChild(clone);
  });
}

function sliderFunction() {
  const slider = document.getElementById("lengthRangeSlider");
  let sliderText = document.getElementById("slider-text");
  slider.oninput = function () {
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
  if (selectedGroups.length === 0) selectedGroups.push(charGroups.letters);
  // Pick one character from each group to start building the password.
  let passwordChars = selectedGroups.map(group => group[Math.floor(Math.random() * group.length)]);
  // Fill remaining length with random characters from combined pool.
  const combinedPool = selectedGroups.join("");
  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(combinedPool[Math.floor(Math.random() * combinedPool.length)]);
  }
  // Shuffle the password so the guaranteed characters aren't in fixed positions.
  passwordChars = passwordChars.sort(() => Math.random() - 0.5);

  // Display password
  const password = passwordChars.join("");
  generatedPassword.textContent = password;

  // Run extra functions
  strengthChecker(password);
  return password;
}

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
  const pin = localStorage.getItem("passedPin");
  const generatedPassword = password;
  const vaultService = document.getElementById("add-to-vault-service-input").value.trim();
  if (vaultService === null) {
    return;
  }
  fetch("http://127.0.0.1:6969/generator/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ generatedPassword, vaultService, pin }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        initialiseApp();
        setUpDynamicModal("generator-password-success");
        showDynamicModal();
        const title = "Vault - Generated Password Added";
        const content = "Generated password added to vault!";
        addNotification(title, content);
        refreshNotificationsDiv(title, content);
      } else {
        setUpDynamicModal("generator-password-fail");
        showDynamicModal();
      }
    })
    .catch((error) => {
      console.error(error.message);
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
  // Move a deleted password to the recycle bin (backend)
  let pin = localStorage.getItem("passedPin");
  return fetch("http://127.0.0.1:6969/deletedPasswords/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Sends cookies with the request.
    body: JSON.stringify({ deletedService, deletedEmail, deletedPassword, pin }),
  })
    .then(async (response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        console.error("Recycle bin did not return JSON: ", text);
        return {
          success: false,
          message: "Invalid server response"
        };
      }
    });
}

function handleAccountSubmit(isEditMode) {
  if (!isEditMode) {
    // Handle add password form submission
    const service = document.getElementById("add-service-input").value.trim();
    const email = document.getElementById("add-email-input").value.trim();
    const password = document.getElementById("add-password-input").value.trim();
    if (!service || !email || !password) {
      setUpDynamicModal("fill-in-add-fields");
      showDynamicModal();
      return;
    }
    let emailEnds = ['.com', '.co.uk'];
    let stringIncludesEnd = emailEnds.some(end => email.includes(end));
    if (!stringIncludesEnd) {
      setUpDynamicModal("add-fields-invalid-email");
      showDynamicModal();
      return;
    }
    const newAccount = new Account(service, email, password);
    accounts.push(newAccount);
    fillAccounts();
    const pin = localStorage.getItem("passedPin");
    // Ask for pin if not already stored
    if (!pin) {
      showPinModal();
      document.querySelector(".pin-inputs").addEventListener("submit", (e) => {
        e.preventDefault();
        checkPin(service, email, password);
      });
    } else {
      save(service, email, password, pin);
    }
  } else {
    // Handle edit password form submission
    const service = document.getElementById("edit-service-input").value.trim();
    const email = document.getElementById("edit-email-input").value.trim();
    const password = document
      .getElementById("edit-password-input")
      .value.trim();
    if (!service || !email || !password) {
      setUpDynamicModal("fill-in-edit-fields");
      showDynamicModal();
      return;
    }
    let emailEnds = ['.com', '.co.uk'];
    let stringIncludesEnd = emailEnds.some(end => email.includes(end));
    console.log(stringIncludesEnd);
    if (!stringIncludesEnd) {
      setUpDynamicModal("edit-fields-invalid-email");
      showDynamicModal();
      return;
    }
    if (originalAccount) {
      fetch("http://127.0.0.1:6969/passwords/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Sends cookies with the request.
        body: JSON.stringify({
          originalService: originalAccount.service,
          originalEmail: originalAccount.email,
          originalPassword: originalAccount.password,
          newService: service,
          newEmail: email,
          newPassword: password,
          pin: localStorage.getItem("passedPin")
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setUpDynamicModal("edit-record-success");
            showDynamicModal();
            initialiseApp();
          } else {
            setUpDynamicModal("edit-record-fail");
            showDynamicModal();
          }
        })
        .catch((err) => {
          console.error(err.message);
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
  // Toggle password visibility for a record (vault or recycle bin)
  const isVisible = passwordElement.dataset.visible === "true";
  if (isVisible) {
    updatePasswordUI(false, iconElement, passwordElement, "password");
    return;
  }
  try {
    const password = await fetchPassword(isRecycleBin, account);
    if (password) {
      updatePasswordUI(true, iconElement, passwordElement, password);
      setUpDynamicModal("show-password-success");
      showDynamicModal();
    } else {
      setUpDynamicModal("show-password-fail");
      showDynamicModal();
    }
  } catch (err) {
    console.error(err.message);
  }
}

async function fetchPassword(isRecycleBin, account) {
  let url;
  let body;
  
  if (isRecycleBin) {
    url = "http://localhost:6969/deletedPasswords/show";
    body = {
      deletedService: account.deletedService,
      deletedEmail: account.deletedEmail,
      deletedPassword: account.deletedPassword,
      pin: localStorage.getItem("passedPin")
    };
  } else {
    url = "http://localhost:6969/passwords/show";
    body = {
      service: account.service,
      email: account.email,
      password: account.password,
      pin: localStorage.getItem("passedPin")
    };
  }
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Sends cookies with the request.
    body: JSON.stringify(body),
  });
  const data = await response.json();
  
  // Handle the case where decryption returns null character or empty string
  if (data.success && data.message && data.message !== "\u0000" && data.message.trim() !== "") {
    return data.message;
  } else if (data.success && (data.message === "\u0000" || data.message.trim() === "")) {
    // If decryption failed (null character), return the original password as it might be plain text
    if (isRecycleBin) {
      return account.deletedPassword;
    } else {
      return account.password;
    }
  }
  
  return null;
}

function updatePasswordUI(show, iconElement, passwordElement, text) {
  passwordElement.textContent = text;
  if (show) {
    passwordElement.style.display = "block";
  } else {
    passwordElement.style.display = "none";
  }
  if (show) {
    passwordElement.dataset.visible = "true";
  } else {
    passwordElement.dataset.visible = "false";
  }
  if (show) {
    iconElement.src = "../assets/eye-icon.svg";
  } else {
    iconElement.src = "../assets/eye-crossed-icon.svg";
  }
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

function save(service, email, password, pin) {
  if (!pin) {
    return;
  } else {
    localStorage.setItem("passedPin", pin);
    fetch("http://127.0.0.1:6969/passwords/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Sends cookies with the request.
      body: JSON.stringify({ service, email, password, pin }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUpDynamicModal("save-password-success");
          showDynamicModal();
          // POST request needed to /notifications/new
          const title = "Vault - Add Notification";
          const content = "Password record added to vault!";
          addNotification(title, content);
          refreshNotificationsDiv(title, content);
        } else {
          setUpDynamicModal("save-password-fail");
          showDynamicModal();
        }
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

function deleteAccount(deletedService, deletedEmail, deletedPassword) {
  const pin = localStorage.getItem("passedPin");
  fetch("http://127.0.0.1:6969/passwords/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Sends cookies with the request.
    body: JSON.stringify({
      service: deletedService,
      email: deletedEmail,
      password: deletedPassword,
      pin: pin
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        refreshVaultDiv(deletedService, deletedEmail);
        const title = "Vault - Delete Notification";
        const content = "Password deleted from vault and moved to recycle bin!";
        addNotification(title, content);
        refreshNotificationsDiv(title, content);
        // Decrypt password before sending to recycleBin
        const plainPassword = decryptPassword(deletedPassword, pin);
        deletedAccounts.push({
          deletedService,
          deletedEmail,
          deletedPassword: plainPassword
        });
        recycleBin(deletedService, deletedEmail, plainPassword)
          .then((data) => {
            if (data.success) {
              fillDeletedAccounts();
              setUpDynamicModal("record-delete-success");
              showDynamicModal();
            } else {
              setUpDynamicModal("record-delete-fail");
              showDynamicModal();
            }
          })
          .catch((error) => {
            console.error(error.message);
          });
      }
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function restorePassword(deletedService, deletedEmail, deletedPassword) {
  fetch("http://127.0.0.1:6969/deletedPasswords/restore", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Sends cookies with the request.
    body: JSON.stringify({ deletedService, deletedEmail, deletedPassword }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setUpDynamicModal("record-restore-success");
        showDynamicModal();
        const title = "Recycle Bin - Restore Notification";
        const message = "Recycled record has been restored to vault!";
        addNotification(title, message);
        // Remove recycle bin record from deletedAccounts.
        refreshRecycleBinDiv(deletedService, deletedEmail);
        // Re-fetch everything.
        initialiseApp();
      } else {

        setUpDynamicModal("record-restore-fail");
        showDynamicModal();
      }
    })
    .catch((error) => {
      console.error(error.message);
    })
}

function permaDelete(deletedService, deletedEmail, deletedPassword) {
  fetch("http://127.0.0.1:6969/deletedPasswords/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Sends cookies with the request.
    body: JSON.stringify({ deletedService, deletedEmail, deletedPassword }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setUpDynamicModal("perma-delete-success");
        showDynamicModal();
        const title = "Recycle Bin - Delete Notification";
        const content = "Password permenantly deleted from recycle bin!";
        addNotification(title, content);
        refreshNotificationsDiv(title, content);
        refreshRecycleBinDiv(deletedService, deletedEmail);
      } else {
        setUpDynamicModal("perma-delete-fail");
        showDynamicModal();
      }
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function addNotification(title, content) {
  fetch("http://127.0.0.1:6969/notifications/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Sends cookies with the request.
    body: JSON.stringify({ title, content }),
  })
    .then((response) => response.json())
    .then((data) => {
    })
    .catch((error) => {
      console.error(error.message);
    });
  // Need a way of refreshing the notifications modal.
  fillNotifications();
}

function deleteNotification(id) {
  fetch("http://127.0.0.1:6969/notifications/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Sends cookies with the request.
    body: JSON.stringify({ id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        refreshNotificationsDiv(id);
      }
    })
    .catch((error) => {
      console.error(error.message);
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
  if (PAGE_MAPPING[pageOption]) {
    currentPage = PAGE_MAPPING[pageOption];
  } else {
    currentPage = currentPage;
  }
  loadPage(currentPage, currentPageOption);

  if (pageOption === "recycle-bin-link") {
    fillDeletedAccounts();
  }

  if (pageOption === "generator-link") {
    generatePassword();
  }
}

function logOut() {
  // Properly log out by clearing session and cookies.
  fetch("http://127.0.0.1:6969/users/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setUpDynamicModal("log-out-success");
        showDynamicModal();
      } else {
        setUpDynamicModal("log-out-fail");
        showDynamicModal();
      }
    })
    .catch((err) => {
      console.error(err.message);
    })
}

function refreshVaultDiv(service, email) {
  // Remove a password record from the vault array and update UI
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].service === service && accounts[i].email === email) {
      accounts.splice(i, 1);
      break;
    }
  }
  fillAccounts();
}

function refreshRecycleBinDiv(deletedService, deletedEmail) {
  // Remove a deleted password record from the recycle bin array and update UI
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

function refreshNotificationsDiv(id) {
  // Remove a notification by id and update UI
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].id === id) {
      notifications.splice(i, 1);
      break;
    }
  }
  fillNotifications();
}

function setUpDynamicModal(result, data = {}) {
  switch (result) {
    case "generator-password-success":
      dynamicModalTitle.textContent = "Generator Password Success!";
      dynamicModalMessage.textContent = "The generated password has successfully been added to the vault!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "generator-password-fail":
      dynamicModalTitle.textContent = "Generator Password Fail!";
      dynamicModalMessage.textContent = "The generated password could not be added to the vault! Please retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "fill-in-add-fields":
      dynamicModalTitle.textContent = "Add Password Record Fail!";
      dynamicModalMessage.textContent = "Please fill in all fields! Click ok to retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        clearModalInputs("add-password-modal");
      };
      break;
    case "add-fields-invalid-email":
      dynamicModalTitle.textContent = "Add Password Record Fail!";
      dynamicModalMessage.textContent = "Please enter a valid email! Click ok to retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        clearModalInputs("add-password-modal");
      };
      break;
    case "fill-in-edit-fields":
      dynamicModalTitle.textContent = "Edit Password Record Fail!";
      dynamicModalMessage.textContent = "Please fill in all fields! Click ok to retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        clearModalInputs("edit-password-modal");
      };
      break;
    case "edit-fields-invalid-email":
      dynamicModalTitle.textContent = "Edit Password Record Fail!";
      dynamicModalMessage.textContent = "Please enter a valid email! Click ok to retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        clearModalInputs("edit-password-modal");
      };
      break;
    case "edit-record-success":
      dynamicModalTitle.textContent = "Password Record Edit Success!";
      dynamicModalMessage.textContent = "Credentials for website/app updated successfully!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "edit-record-fail":
      dynamicModalTitle.textContent = "Edit Password Record Fail!";
      dynamicModalMessage.textContent = "Credentials could not be edited";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        clearModalInputs("edit-password-modal");
      };
      break;
    case "show-password-success":
      dynamicModalTitle.textContent = "Show Password Success!";
      dynamicModalMessage.textContent = "Password can now be displayed! Click ok to view password!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "show-password-fail":
      dynamicModalTitle.textContent = "Show Password Fail!";
      dynamicModalMessage.textContent = "Password cannot be displayed! Please retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "save-password-success":
      dynamicModalTitle.textContent = "Save Password Record Success!";
      dynamicModalMessage.textContent = "Password record created and added to vault successfully!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();

      };
      break;
    case "save-password-fail":
      dynamicModalTitle.textContent = "Save Password Record Fail!";
      dynamicModalMessage.textContent = "Password Record Creation Unsuccessful!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        clearModalInputs("add-password-modal");
      };
      break;
    case "record-delete-success":
      dynamicModalTitle.textContent = "Password Record Deleted Successfully!";
      dynamicModalMessage.textContent = "Password record deleted from vault successfully and moved to recycle bin!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "record-delete-fail":
      dynamicModalTitle.textContent = "Password Record Deletion Unsuccessful!";
      dynamicModalMessage.textContent = "Password record could not be deleted from the vault and moved to recycle bin! Retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "record-restore-success":
      dynamicModalTitle.textContent = "Recycle Bin Record Restore Successful!";
      dynamicModalMessage.textContent = "Recycled record has been restored to the vault!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "record-restore-fail":
      dynamicModalTitle.textContent = "Recycle Bin Record Restore Unsuccessful!";
      dynamicModalMessage.textContent = "Recycled record could not be restored to the vault! Retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "perma-delete-success":
      dynamicModalTitle.textContent = "Recycled Record Permenant Delete Successful!";
      dynamicModalMessage.textContent = "Password permenantly deleted from recycle bin!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "perma-delete-fail":
      dynamicModalTitle.textContent = "Recycled Record Permenant Delete Unsuccessful!";
      dynamicModalMessage.textContent = "Password could not be permenantly deleted from recycle bin! Retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    case "log-out-success":
      dynamicModalTitle.textContent = "Log Out Success!";
      dynamicModalMessage.textContent = "Log out successful! Click ok to navigate to login page!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        localStorage.removeItem("passedPin");
        window.location.href = "loginpg.html";
      };
      break;
    case "log-out-fail":
      dynamicModalTitle.textContent = "Log Out Fail!";
      dynamicModalMessage.textContent = "Log out unsuccessful! Retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      }
      break;
    case "fill-in-pin-field":
      dynamicModalTitle.textContent = "Security Pin Setup Fail!";
      dynamicModalMessage.textContent = "Security Pin Setup Fail! Retry!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        clearModalInputs("pin-input-modal");
      }
      break;
    case "insufficient-pin":
      dynamicModalTitle.textContent = "Security Pin Setup Fail!";
      dynamicModalMessage.textContent = "Please enter a 4-digit security pin!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        clearModalInputs("pin-input-modal");
        showPinModal();
      }
      break;
    case "sufficient-pin":
      dynamicModalTitle.textContent = "Security Pin Setup Successful!";
      dynamicModalMessage.textContent = "Security Pin Setup Successfully";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
        hidePinModal();
        // Save after confirmation
        if (data.service && data.email && data.password && data.pin) {
          save(data.service, data.email, data.password, data.pin);
        }
      }
      break;
    case "add-to-vault-fail":
      dynamicModalTitle.textContent = "Add To Vault Fail!";
      dynamicModalMessage.textContent = "Add To Vault Fail! Enter a valid service!";
      dynamicModalOkButton.onclick = () => {
        hideDynamicModal();
      };
      break;
    default:
      break;
  }
}

function showDynamicModal() {
  dynamicModal.style.display = "flex";
}

function hideDynamicModal() {
  dynamicModal.style.display = "none";
}

function showPinModal() {
  pinModal.style.display = "flex";
}

function checkPin(service, email, password) {
  const pin = document.getElementById("pin-input").value.trim();
  if (!pin) {
    setUpDynamicModal("fill-in-pin-field");
    showDynamicModal();
    return;
  }
  // Check for 4-digit pin.
  if (pin.length != 4) {
    hidePinModal();
    setUpDynamicModal("insufficient-pin");
    showDynamicModal();
    return;
  }
  hidePinModal();
  setUpDynamicModal("sufficient-pin", { service, email, password, pin });
  showDynamicModal();
}

function hidePinModal() {
  pinModal.style.display = "none";
}

function showAddToVaultModal() {
  addToVaultModal.style.display = "flex";
}

function hideAddToVaultModal() {
  addToVaultModal.style.display = "none";
}

/* Add Modal Methods */
function showAddModal() {
  clearModalInputs("add-password-modal");
  document.getElementById("modal-title").textContent = "Add New Password";
  modalAddPasswordBtn.innerHTML = `<span class="plus">+</span><span>Add</span>`;
  addPasswordModal.style.display = "block";
}

function hideAddModal() {
  addPasswordModal.style.display = "none";
}

function clearModalInputs(modal) {
  switch (modal) {
    case "add-password-modal":
      // Clears add modal inputs.
      document.getElementById("add-service-input").value = "";
      document.getElementById("add-email-input").value = "";
      document.getElementById("add-password-input").value = "";
      break;
    case "edit-password-modal":
      // Clears edit modal inputs.
      document.getElementById("edit-service-input").value = "";
      document.getElementById("edit-email-input").value = "";
      document.getElementById("edit-password-input").value = "";
      break;
    case "pin-input-modal":
      // Clears pin modal input.
      document.getElementById("pin-input").value = "";
      break;
    case "add-to-vault-modal":
      document.getElementById("add-to-vault-service-input").value = "";
      break;
    default:
      // Clears all modal inputs
      document.getElementById("add-service-input").value = "";
      document.getElementById("add-email-input").value = "";
      document.getElementById("add-password-input").value = "";
      document.getElementById("edit-service-input").value = "";
      document.getElementById("edit-email-input").value = "";
      document.getElementById("edit-password-input").value = "";
      document.getElementById("pin-input").value = "";
      break;
  }
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

function decryptPassword(encryptedPassword, pin) {
  // Only decrypt if password contains semicolons - encrypted
  if (encryptedPassword.includes(";")) {
    let plainPassword = "";
    let intPin = parseInt(pin);
    encryptedPassword.split(";").forEach((x) => {
      let y = parseInt(x) / intPin;
      plainPassword += String.fromCharCode(y);
    });
    return plainPassword;
  } else {
    // Already plain text
    return encryptedPassword;
  }
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
    // Fetch notifications for notifications modal.
    fetch("http://127.0.0.1:6969/notifications/all", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          notifications.length = 0; // Clear previous notifications.
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
        console.error("Error fetching notifications: ", err);
      });
    toggleNotificationsModal(); // Show notifications modal.
  });
}

if (notificationsCloseButton) {
  notificationsCloseButton.addEventListener("click", () => {
    notificationsModal.style.display = "none";
  });
}

if (closeDynamicModalBtn) {
  closeDynamicModalBtn.addEventListener("click", () => hideDynamicModal());
}

if (addToVaultModalOpenButton) {
  addToVaultModalOpenButton.addEventListener("click", () => showAddToVaultModal());
}

if (addToVaultModalCloseButton) {
  addToVaultModalCloseButton.addEventListener("click", () => hideAddToVaultModal());
}

if (generatorRestoreSettingsBtn) {
  generatorRestoreSettingsBtn.addEventListener("click", () => {
    restoreGeneratorSettings();
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

document.querySelector(".add-to-vault-inputs").addEventListener("submit", (e) => {
  e.preventDefault();
  const password = document.getElementById("generated-password").textContent;
  const service = document.getElementById("add-to-vault-service-input").value.trim();
  if (!service) {
    setUpDynamicModal("add-to-vault-fail");
    showDynamicModal();
    return;
  }
  addGeneratedPassword(password);
  hideAddToVaultModal();
  clearModalInputs("add-to-vault-modal");
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
      accounts = [];
      save();
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("http://127.0.0.1:6969/users/check", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        initialiseApp();
        if (addModalOpenButton) {
          addModalOpenButton.addEventListener("click", () => showAddModal());
        }
        generatePassword();
        initialiseCheckboxListeners();
        sliderFunction();
      } else {
        // Not logged in, redirect back to login
        window.location.href = "loginpg.html";
      }
    })
    .catch((error) => {
      console.error(error.message);
      window.location.href = "loginpg.html";
    });

  // Fetch notifications for notifications modal.
  fetch("http://127.0.0.1:6969/notifications/all", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        notifications.length = 0; // Clear previous notifications.
        data.data.forEach((noti) => {
          if (noti && noti.id && noti.title && noti.content) {
            const existing = notifications.find(
              (n) => n.id == noti.id
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
      console.error("Error fetching notifications: ", err);
    });
});

