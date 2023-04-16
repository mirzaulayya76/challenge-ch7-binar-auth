const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllRoomsController(req, res) {
  try {
    const rooms = await prisma.Game.findMany();
    res.json(rooms);
  } catch (error) {
    console.log(error);
    res.json([]);
  }
}

async function getRoomByIdController(req, res) {
  const roomId = Number(req.params.roomId);
  try {
    const room = await prisma.Game.findUnique({ where: { id: roomId } });
    res.json(room);
  } catch (error) {
    console.log(error);
    res.json(404);
  }
}

async function createRoomController(req, res) {
  try {
    if (req.body.email == null || req.body.email === '') {
      return res.status(400).json({ message: 'email cannot be empty!' });
    }
    // 1. get dulu user-nya
    const player = await prisma.playerBiodata.findUnique({
      where: { email: req.body.email },
    });

    // 2. Create room & assign current user sebagai player_one pada room ini
    const game = await prisma.Game.create({
      data: { player_one: player.email },
    });

    res.status(200).json({ message: 'Room created successfully', id: game.id });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function joinRoomController(req, res) {
  try {
    if (req.body.email == null || req.body.email === '') {
      return res.status(400).json({ message: 'email cannot be empty!' });
    }
    if (req.params.roomId == null || req.params.roomId === '') {
      return res.status(400).json({ message: 'roomId cannot be empty!' });
    }
    if (isNaN(Number(req.params.roomId))) {
      return res
        .status(400)
        .json({ message: 'invalid roomId. expected number, not character' });
    }

    const email = req.body.email;
    const roomId = Number(req.params.roomId);
    //  1. get dulu user-nya
    const player = await prisma.playerBiodata.findUnique({ where: { email } });

    if (player === null) {
      return res.status(400).json({ message: 'email not found!' });
    }

    //  2. get room-nya
    const room = await prisma.Game.findUnique({ where: { id: roomId } });

    if (room === null) {
      return res.status(400).json({ message: 'room not found!' });
    }
    if (room.player_one === user.email || room.player_two === user.email) {
      return res.status(400).json({ message: 'user already in the room' });
    }
    if (room.player_two != null) {
      return res.status(400).json({ message: 'room already full' });
    }

    //  3. update game-nya dengan current user sebagai player_two
    const updatedRoom = await prisma.Game.update({
      data: { player_two: player.email },
      where: { id: roomId },
    });
    res.status(200).json({
      message: 'Player Two berhasil join room',
      room: updatedRoom,
    });
    //  selesai
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function playGameController(req, res) {
  if (req.body.email == null || req.body.email === '') {
    return res.status(400).json({ message: 'email cannot be empty!' });
  }
  if (req.params.roomId == null || req.params.roomId === '') {
    return res.status(400).json({ message: 'roomId cannot be empty!' });
  }
  if (isNaN(Number(req.params.roomId))) {
    return res
      .status(400)
      .json({ message: 'invalid roomId. expected number, not character' });
  }
  if (
    req.body.choice == null ||
    req.body.choice === '' ||
    !['R', 'P', 'S'].includes(req.body.choice?.toUpperCase())
  ) {
    return res.status(400).json({ message: 'invalid choice!' });
  }

  const email = req.body.email;
  const choice = req.body.choice.toUpperCase();
  const roomId = Number(req.params.roomId);

  try {
    // 1. get room
    const room = await prisma.Game.findUnique({ where: { id: roomId } });

    if (room === null) {
      return res.status(400).json({ message: 'room not found!' });
    }

    // 2.A. Cari tau apakah usernya player_one || player_two
    let CONDITION = null;
    if (room.player_one === email) {
      CONDITION = 'PLAYER_ONE';
    } else if (room.player_two === email) {
      CONDITION = 'PLAYER_TWO';
    } else {
      return res
        .status(400)
        .json({ message: 'the email is not included as player in the room!' });
    }

    const { player_one_choices, player_two_choices } = room;

    if (player_one_choices.length === 3 && player_two_choices.length === 3) {
      return res
        .status(400)
        .json({ message: 'Game is finished! Please check the result' });
    }

    if (CONDITION === 'PLAYER_ONE') {
      if (player_one_choices.length > player_two_choices.length) {
        return res
          .status(400)
          .json({ message: 'please wait your turn, player1!' });
      }
      if (player_one_choices.length === 3) {
        return res
          .status(400)
          .json({ message: 'Your have filled all your choices!' });
      }
      const updatedGame = await prisma.Game.update({
        data: {
          player_one_choices: player_one_choices.concat(choice),
        },
        where: { id: roomId },
      });
      return res
        .status(200)
        .json({ message: 'game updated!', game: updatedGame });
    }

    if (
      player_one_choices.length === 0 ||
      player_one_choices.length === player_two_choices.length
    ) {
      return res
        .status(400)
        .json({ message: 'please wait your turn, player2!' });
    }
    if (player_two_choices.length === 3) {
      return res
        .status(400)
        .json({ message: 'Your have filled all your choices!' });
    }
    const updatedGame = await prisma.game.update({
      data: {
        player_two_choices: player_two_choices.concat(choice),
      },
      where: { id: roomId },
    });

    return res
      .status(200)
      .json({ message: 'game updated!', game: updatedGame });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
}

async function gameResultController(req, res) {
  // 1. get the room
  // 2. calculate which one is the winner
  // Kemungkinan hasil ada 4:
  // A. Player One menang
  // B. Player Two menang
  // C. Seri
  // D. Game belum selesai
}

module.exports = {
  createRoomController,
  joinRoomController,
  getAllRoomsController,
  getRoomByIdController,
  playGameController,
};
