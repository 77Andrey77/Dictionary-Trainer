// Определение администратора
const adminUser = {
    username: 'admin',
    password: 'adminpass',
    role: 'admin'
};

let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let currentIndex = 0;
let dictionary = {};
let keys = [];

// Если администратор не зарегистрирован, добавить его в localStorage
if (!users[adminUser.username]) {
    users[adminUser.username] = adminUser;
    localStorage.setItem('users', JSON.stringify(users));
}

// Функция для обновления списка ключей словаря
function updateKeys() {
    keys = Object.keys(dictionary);
}

// Функция для отображения слова по индексу
function showWord(index) {
    if (keys.length > 0) {
        let word = keys[index];
        let randomWordElement = document.getElementById('randomWord');
        randomWordElement.innerText = word;
        randomWordElement.dataset.translation = dictionary[word];
        document.getElementById('translationOutput').innerText = '';
    } else {
        document.getElementById('randomWord').innerText = 'Dictionary is empty. Please add some words.';
    }
}

// Функция для отображения перевода выбранного слова
function showTranslation() {
    let randomWordElement = document.getElementById('randomWord');
    document.getElementById('translationOutput').innerText = randomWordElement.dataset.translation;
}

// Функция для отображения предыдущего слова
function previousWord() {
    if (keys.length > 0) {
        currentIndex = (currentIndex - 1 + keys.length) % keys.length;
        showWord(currentIndex);
    }
}

// Функция для отображения следующего слова (случайно)
function nextWord() {
    if (keys.length > 0) {
        currentIndex = Math.floor(Math.random() * keys.length);
        showWord(currentIndex);
    }
}

// Функция для добавления слова и его перевода в словарь текущего пользователя
function addWord() {
    let word = document.getElementById('word').value;
    let translation = document.getElementById('translation').value;
    if (word && translation) {
        dictionary[word] = translation;
        users[currentUser.username].dictionary = dictionary;
        localStorage.setItem('users', JSON.stringify(users));
        document.getElementById('word').value = '';
        document.getElementById('translation').value = '';
        alert('Word added successfully!');
        updateKeys();
        showWord(currentIndex);
    } else {
        alert('Please enter both word and translation.');
    }
}

// Показать случайное слово при загрузке страницы
window.onload = () => {
    checkAuth();
    if (currentUser) {
        dictionary = users[currentUser.username].dictionary || {};
        updateKeys();
        if (keys.length > 0) {
            currentIndex = Math.floor(Math.random() * keys.length);
            showWord(currentIndex);
        } else {
            showWord(currentIndex);
        }
    }
};

// Функции авторизации
function checkAuth() {
    if (currentUser) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('app-section').style.display = 'block';
        document.getElementById('username-display').innerText = currentUser.username;
        if (currentUser.role === 'admin') {
            document.getElementById('admin-section').style.display = 'block';
            populateUserSelect();
        } else {
            document.getElementById('admin-section').style.display = 'none';
        }
    } else {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('app-section').style.display = 'none';
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const user = users[username];

    if (user && user.password === password) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        checkAuth();
    } else {
        document.getElementById('login-error').innerText = 'Invalid username or password';
    }
}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (username === adminUser.username) {
        document.getElementById('register-error').innerText = 'You cannot register as admin';
        return;
    }

    if (username && password) {
        if (users[username]) {
            document.getElementById('register-error').innerText = 'Username already exists';
        } else {
            users[username] = { username, password, role: 'user', dictionary: {} };
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful!');
            toggleForms();
        }
    } else {
        document.getElementById('register-error').innerText = 'Please enter both username and password';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    checkAuth();
}

function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleButton = document.querySelector('#auth-section button');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        toggleButton.innerText = 'Switch to Register';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        toggleButton.innerText = 'Switch to Login';
    }
}

function populateUserSelect() {
    const userSelect = document.getElementById('user-select');
    userSelect.innerHTML = '';
    for (let username in users) {
        if (users[username].role === 'user') {
            const option = document.createElement('option');
            option.value = username;
            option.innerText = username;
            userSelect.appendChild(option);
        }
    }
}

function addWordForUser() {
    const username = document.getElementById('user-select').value;
    const word = document.getElementById('user-word').value;
    const translation = document.getElementById('user-translation').value;

    if (username && word && translation) {
        if (!users[username].dictionary) {
            users[username].dictionary = {};
        }
        users[username].dictionary[word] = translation;
        localStorage.setItem('users', JSON.stringify(users));
        document.getElementById('user-word').value = '';
        document.getElementById('user-translation').value = '';
        alert('Word added successfully for ' + username);
    } else {
        alert('Please select a user and enter both word and translation.');
    }
}
