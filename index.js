const express = require('express');
const app = express();

// Manggil file yang berada di middleware. restrictLoginPage.js dan restrictPageAccess.js
const { restrictPageAccess } = require('./middleware/restrictPageAccess');
const { restrictLoginPage } = require('./middleware/restrictLoginPage');

// Manggil Morgan
const morgan = require('morgan');

// Import authController
const {
  loginController,
  registrationController,
  logoutController,
  whoamiController,
} = require('./controllers/authController');

// Manggil jsonwebtoken
const jwt = require('jsonwebtoken');

// Manggil cookie-parser
const cookieParser = require('cookie-parser');

// Import file player-bio.js
const { registration, login } = require('./model/player-bio');

// Manggil dotenv
require('dotenv').config();

// Manggil Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Manggil session
const session = require('express-session');

// ini variabel buat manggil file .env
const PORT = process.env.PORT;

//Manggil express-flash
const flash = require('express-flash');

// Middleware body parser (harus ditaruh paling atas)
// urlencoded untuk ngeparsing form
app.use(express.urlencoded({ extended: false }));

// Middleware untuk ngeparsing JSON
app.use(express.json());

// Middleware Morgan
app.use(morgan('tiny'));

// Pengaturan Session:
app.use(
  session({
    secret: 'ini dirahasiakan',
    resave: false,
    saveUninitialized: false,
  }),
);

// Middleware express-flash:
app.use(flash());

// Static Files css, images, javascript
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/images', express.static(__dirname + 'public/images'));
app.use('/js', express.static(__dirname + 'public/js'));

// Set Views
app.set('views', './views');
app.set('view engine', 'ejs');

// Route html
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/registration', (req, res) => {
  res.render('registration');
});

app.post('/registration', async (req, res) => {
  console.log('tes klik tombol button', req.body);
  await registration({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    city: req.body.city,
    email: req.body.email,
    password: req.body.password,
  });
  res.redirect('/cekdata');
});

app.get('/login', (req, res) => res.render('login'));

// POST /register untuk API registration
app.post('/login', async (req, res) => {
  try {
    console.log('tes klik tombol button', req.body);
    await login({ email: req.body.email, password: req.body.password });
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.redirect('/login');
  }
});

app.get('/cekdata', async (req, res) => {
  // Handler database pada prisma :
  const players = await prisma.playerBiodata.findMany();
  res.json(players);
});

// Routing API return JSON
app.get('/', restrictPageAccess, async (req, res) => {
  const player = await prisma.playerBiodata.findMany();
  res.render('dashboard', { player });
});
app.get('/login', restrictLoginPage, (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.post('/api/login', loginController);
app.post('/register', registrationController);
app.post('/logout', logoutController);
app.get('/whoami', restrictPageAccess, whoamiController);

app.listen(PORT, () => {
  console.log(`Server is Running at http://localhost:${PORT}`);
});
