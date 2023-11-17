// main.js

document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');

    hamburger.addEventListener('click', function () {
        menu.classList.toggle('active');
    });

    // Check the login status and hide/show the "Logout" and "Login/Register" links
    // Check the login status and hide/show the "Logout" and "Login/Register" links
fetch('/checkloginstatus')
.then(response => response.json())
.then(data => {
    const sessionStatus = document.getElementById('session-status');
    const loginRegisterContainer = document.getElementById('login-register-container');
    const logoutContainer = document.getElementById('logout-container');

    if (data.loggedIn) {
        sessionStatus.textContent = `Logged in as ${data.username}`;
        loginRegisterContainer.style.display = 'none'; // Hide "Login/Register"
        logoutContainer.style.display = 'block'; // Show "Logout"
    } else {
        sessionStatus.textContent = '';
        loginRegisterContainer.style.display = 'block'; // Show "Login/Register"
        logoutContainer.style.display = 'none'; // Hide "Logout"
    }
})
.catch(error => {
    console.error('Error checking login status:', error);
});

});
