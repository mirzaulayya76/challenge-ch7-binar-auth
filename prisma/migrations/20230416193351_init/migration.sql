-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "player_one" TEXT,
    "player_two" TEXT,
    "player_one_choices" TEXT[],
    "player_two_choices" TEXT[],
    "winner" TEXT,
    "times" TEXT,
    "room" TEXT,
    "result" TEXT[],

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);
