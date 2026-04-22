const loginForm = document.querySelector("#login-form");
const logoutButton = document.querySelector("#logout-button");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#login-email").value.trim().toLowerCase();
    const password = document.querySelector("#login-password").value;
    const message = document.querySelector("#login-message");

    if (!email || !password) {
      message.textContent = "Enter your email and password to continue.";
      return;
    }

    sessionStorage.setItem("goodGolfUser", email);
    message.textContent = "Login successful. Opening your dashboard...";
    window.location.href = "dashboard.html";
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("goodGolfUser");
    window.location.href = "login.html";
  });
}
