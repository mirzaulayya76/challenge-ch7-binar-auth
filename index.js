const express = require('express');
const app = express();

// Manggil file yang berada di middleware. restrictLoginPage.js dan restrictPageAccess.js
const {
  restrictPageAccess,
  withAuthentication,
} = require('./middleware/restrictPageAccess');

const { restrictLoginPage } = require('./middleware/restrictLoginPage');

// Manggil Morgan
const morgan = require('morgan');

// Import authController
const {
  loginController,
  loginApiController,
  registrationController,
  logoutController,
  whoamiController,
} = require('./controllers/authController');

// Import roomController
const {
  createRoomController,
  joinRoomController,
  getAllRoomsController,
  getRoomByIdController,
  playGameController,
} = require('./controllers/roomController');

// Manggil jsonwebtoken
const jwt = require('jsonwebtoken');

// Manggil cookie-parser
const cookieParser = require('cookie-parser');

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

// Manggil Swagger
const swaggerUI = require('swagger-ui-express');
const swaggerJSON = require('./gameAPI.json');

// Middleware body parser (harus ditaruh paling atas)
// urlencoded untuk ngeparsing form
app.use(express.urlencoded({ extended: false }));

// Middleware untuk ngeparsing JSON
app.use(express.json());

// Middleware Morgan
app.use(morgan('tiny'));

// Middleware Swagger
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON));

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

// Routing HTML
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/cekdata', async (req, res) => {
  // Handler database pada prisma :
  const players = await prisma.playerBiodata.findMany();
  res.json(players);
});
app.get('/login', restrictLoginPage, (req, res) => res.render('login'));
app.get('/registration', (req, res) => res.render('registration'));
app.post('/login', loginController);
app.post('/registration', registrationController);
app.post('/logout', logoutController);
app.get('/whoami', restrictPageAccess, whoamiController);

// Fitur Room
app.post('/api/login', loginApiController);
app.get('/api/room', withAuthentication, getAllRoomsController);
app.get('/api/room/:roomId', getRoomByIdController);
app.post('/api/room/create', withAuthentication, createRoomController);
app.post('/api/room/:roomId/join', joinRoomController);

// Fitur Play
app.post('/api/room/:roomId/play', playGameController);

app.listen(PORT, () => {
  console.log(`Server is Running at http://localhost:${PORT}`);
});
