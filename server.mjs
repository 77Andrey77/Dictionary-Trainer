import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

let users = [
    {
        username: 'admin',
        password: 'adminpassword',
        role: 'admin',
        dictionary: {}
    },
    {
        username: 'user1',
        password: 'user1password',
        role: 'user',
        dictionary: {}
    }
    // другие пользователи
];

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(409).send('Username already exists');
    }
    users.push({ username, password, role: 'user', dictionary: {} });
    res.status(201).send('User registered');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET);
        res.json({ token });
    } else {
        res.status(400).send('Invalid username or password');
    }
});

app.get('/getWords', authenticateToken, (req, res) => {
    const user = users.find(user => user.username === req.user.username);
    if (user) {
        res.send({ words: Object.entries(user.dictionary).map(([word, translation]) => ({ word, translation })) });
    } else {
        res.status(400).send('User not found');
    }
});

app.get('/getUsers', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Only admins can view users');
    }

    const userList = users.filter(user => user.role !== 'admin').map(user => ({ username: user.username }));
    res.send({ users: userList });
});


app.post('/addWord', authenticateToken, (req, res) => {
    const { word, translation } = req.body;
    const user = users.find(user => user.username === req.user.username);
    if (user) {
        user.dictionary[word] = translation;
        res.send('Word added');
    } else {
        res.status(400).send('User not found');
    }
});

app.post('/admin/addWord', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Only admins can add words for other users');
    }

    const { username, word, translation } = req.body;
    const user = users.find(user => user.username === username);
    if (user) {
        user.dictionary[word] = translation;
        res.send('Word added for user');
    } else {
        res.status(400).send('User not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
