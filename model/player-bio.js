// pertama, import bcrypt
const bcrypt = require('bcrypt');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function encrypt(password) {
  return bcrypt.hashSync(password, 10);
}

function checkPassword(incomingPassword, databasePassword) {
  return bcrypt.compareSync(incomingPassword, databasePassword);
}

function registration({ firstName, lastName, city, email, password }) {
  const encryptedPassword = encrypt(password);
  return prisma.playerBiodata.create({
    data: {
      firstName,
      lastName,
      city,
      email,
      password: encryptedPassword,
    },
  });
}

async function login({ email, password }) {
  try {
    const player = await prisma.playerBiodata.findUnique({ where: { email } });
    if (!player) return Promise.reject('User not found!');

    const isPasswordValid = checkPassword(password, player.password);
    if (!isPasswordValid) return Promise.reject('Wrong password');
    return player;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function findByPk(pk) {
  try {
    const player = await prisma.playerBiodata.findUnique({ where: { id: pk } });
    console.log('findByPk.', { pk, user });
    return player;
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = { registration, login, findByPk };
