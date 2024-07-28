const apiUrl = 'http://localhost:3000';
let words = [];
let currentIndex = 0;
let currentUser = null;

async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('User registered');
        toggleForms();
    } else {
        document.getElementById('register-error').innerText = await response.text();
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        currentUser = jwt_decode(data.token);
        document.getElementById('username-display').innerText = currentUser.username;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('app-section').style.display = 'block';

        if (currentUser.role === 'admin') {
            document.getElementById('admin-section').style.display = 'block';
            loadUsers();
        }

        loadWords();
    } else {
        document.getElementById('login-error').innerText = await response.text();
    }
}

function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('token');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('app-section').style.display = 'none';
}

async function loadWords() {
    const response = await fetch(`${apiUrl}/getWords`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        words = data.words;
        if (words.length > 0) {
            currentIndex = Math.floor(Math.random() * words.length);
            displayWord();
        } else {
            document.getElementById('randomWord').innerText = 'No words available';
        }
    } else {
        alert('Failed to load words');
    }
}

async function addWord() {
    const word = document.getElementById('word').value;
    const translation = document.getElementById('translation').value;

    const response = await fetch(`${apiUrl}/addWord`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ word, translation })
    });

    if (response.ok) {
        alert('Word added');
        loadWords();
    } else {
        alert('Failed to add word');
    }
}

async function addWordForUser() {
    const word = document.getElementById('user-word').value;
    const translation = document.getElementById('user-translation').value;
    const username = document.getElementById('user-select').value;

    const response = await fetch(`${apiUrl}/admin/addWord`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username, word, translation })
    });

    if (response.ok) {
        alert('Word added for user');
        document.getElementById('user-word').value = '';
        document.getElementById('user-translation').value = '';
    } else {
        alert('Failed to add word for user');
    }
}

async function loadUsers() {
    const response = await fetch(`${apiUrl}/getUsers`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        const userSelect = document.getElementById('user-select');
        userSelect.innerHTML = '';
        data.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            userSelect.appendChild(option);
        });
    } else {
        alert('Failed to load users');
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        currentUser = jwt_decode(data.token);
        document.getElementById('username-display').innerText = currentUser.username;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('app-section').style.display = 'block';

        if (currentUser.role === 'admin') {
            document.getElementById('admin-section').style.display = 'block';
            loadUsers();
        }

        loadWords();
    } else {
        document.getElementById('login-error').innerText = await response.text();
    }
}


function displayWord() {
    if (words.length > 0) {
        document.getElementById('randomWord').innerText = words[currentIndex].word;
        document.getElementById('translationOutput').innerText = '';
    }
}

function showTranslation() {
    if (words.length > 0) {
        document.getElementById('translationOutput').innerText = words[currentIndex].translation;
    }
}

function previousWord() {
    if (words.length > 0) {
        currentIndex = (currentIndex - 1 + words.length) % words.length;
        displayWord();
    }
}

function nextWord() {
    if (words.length > 0) {
        currentIndex = Math.floor(Math.random() * words.length);
        displayWord();
    }
}

// Helper function to decode JWT
function jwt_decode(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


