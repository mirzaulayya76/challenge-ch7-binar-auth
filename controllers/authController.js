const { registration, login } = require('../model/player-bio');
const jwt = require('jsonwebtoken');

async function loginController(req, res) {
  try {
    const player = await login(req.body);
    const token = jwt.sign(
      { id: player.id, email: player.email },
      process.env.SECRET_KEY,
      {
        expiresIn: '1h',
      },
    );

    // Simpan token di cookie:
    req.session.token = token;
    res.redirect('/');
  } catch (error) {
    res.redirect('/login');
  }
}
async function loginApiController(req, res) {
  try {
    const player = await login(req.body);
    const token = jwt.sign(
      { id: player.id, email: player.email },
      process.env.SECRET_KEY,
      {
        expiresIn: '1h',
      },
    );

    // Simpan token di cookie:
    // req.session.token = token;

    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: 'invalid email or password' });
  }
}
async function registrationController(req, res) {
  try {
    await registration({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      city: req.body.city,
      email: req.body.email,
      password: req.body.password,
    });
    res.redirect('/login');
  } catch (error) {
    res.redirect('/registration');
  }
}
async function logoutController(req, res) {
  req.session.destroy();
  res.redirect('/login');
}
async function whoamiController(req, res) {
  try {
    const playerId = req.userId;
    const player = await findByPk(playerId);
    res.render('whoami', { username: player.email });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
}

module.exports = {
  loginController,
  loginApiController,
  registrationController,
  logoutController,
  whoamiController,
};
