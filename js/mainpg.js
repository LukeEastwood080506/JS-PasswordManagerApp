function checkLoggedIn() {
  if (sessionStorage.getItem("isLoggedIn") == "true") {
    load();
  } else {
    alert("invalid log-in");
    document.getElementById("lol").innerHTML = "Yo TS NOT FIRE";
  }
}

function load() {
  alert("valid log-in");
  document.getElementById("lol").innerHTML = "Yo TS FIRE";
}

window.onload = checkLoggedIn;
