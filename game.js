// ==========================================
// CANVAS
// ==========================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 500;


// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================

const gravity = 0.8;
const groundY = 420;

const BASE_SPEED = 8;
const MAX_SPEED = 16;

let gameSpeed = BASE_SPEED;

let score = 0;
let level = 1;

let highScore =
  Number(localStorage.getItem("levelUpHighScore")) || 0;

let gameStarted = false;
let gameOver = false;
let paused = false;

let levelMessageTimer = 0;


// ==========================================
// SALTO VARIABLE
// ==========================================

let jumpHeld = false;
let jumpHoldFrames = 0;

const MAX_JUMP_HOLD = 12;


// ==========================================
// COMBO
// ==========================================

let combo = 1;
let comboTimer = 0;

const COMBO_TIME = 240;


// ==========================================
// JUGADOR
// ==========================================

// ==========================================
// SPRITES DEL PERSONAJE
// ==========================================

const playerImages = {
  idle: new Image(),
  run1: new Image(),
  run2: new Image(),
  jump: new Image(),
  hit: new Image()
};

playerImages.idle.src = "assets/player/idle.png";
playerImages.run1.src = "assets/player/run1.png";
playerImages.run2.src = "assets/player/run2.png";
playerImages.jump.src = "assets/player/jump.png";
playerImages.hit.src = "assets/player/hit.png";


// CONTROL DE ANIMACIÓN
let runFrame = 0;
let runAnimationTimer = 0;

const RUN_ANIMATION_SPEED = 8;

const player = {
  x: 120,
  y: 350,

  width: 70,
  height: 85,

  velocityY: 0,
  jumping: false
};


// ==========================================
// OBSTÁCULOS
// ==========================================

let obstacles = [];

let obstacleTimer = 0;
let nextObstacle = 110;


// ==========================================
// COLECCIONABLES
// ==========================================

let collectibles = [];

let collectibleTimer = 0;
let nextCollectible = 180;


// ==========================================
// NUBES
// ==========================================

const clouds = [
  {
    x: 150,
    y: 70,
    size: 25,
    speed: 0.6
  },

  {
    x: 500,
    y: 100,
    size: 35,
    speed: 0.9
  },

  {
    x: 850,
    y: 55,
    size: 22,
    speed: 0.5
  }
];


// ==========================================
// FONDO
// ==========================================

function drawBackground() {

  ctx.fillStyle = "#87CEEB";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}


// ==========================================
// NUBES
// ==========================================

function drawCloud(cloud) {

  ctx.fillStyle = "white";

  ctx.beginPath();

  ctx.arc(
    cloud.x,
    cloud.y,
    cloud.size,
    0,
    Math.PI * 2
  );

  ctx.arc(
    cloud.x + 25,
    cloud.y - 10,
    cloud.size + 5,
    0,
    Math.PI * 2
  );

  ctx.arc(
    cloud.x + 55,
    cloud.y,
    cloud.size,
    0,
    Math.PI * 2
  );

  ctx.fill();
}


function updateClouds() {

  clouds.forEach(cloud => {

    if (
      gameStarted &&
      !gameOver &&
      !paused
    ) {

      cloud.x -= cloud.speed;
    }

    if (cloud.x < -120) {

      cloud.x =
        canvas.width +
        Math.random() * 300;
    }

    drawCloud(cloud);

  });
}


// ==========================================
// PISO
// ==========================================

let groundOffset = 0;


function drawGround() {

  ctx.fillStyle = "#43A047";

  ctx.fillRect(
    0,
    groundY,
    canvas.width,
    canvas.height - groundY
  );


  if (
    gameStarted &&
    !gameOver &&
    !paused
  ) {

    groundOffset -= gameSpeed;
  }


  if (groundOffset <= -50) {

    groundOffset = 0;
  }


  ctx.fillStyle = "#2E7D32";


  for (
    let x = groundOffset;
    x < canvas.width;
    x += 50
  ) {

    ctx.fillRect(
      x,
      groundY + 15,
      25,
      5
    );
  }
}


// ==========================================
// PERSONAJE PROVISIONAL
// ==========================================

function drawBible() {

  let imageToDraw;

  // GAME OVER
  if (gameOver) {

    imageToDraw = playerImages.hit;

  }

  // SALTANDO
  else if (player.jumping) {

    imageToDraw = playerImages.jump;

  }

  // ANTES DE INICIAR
  else if (!gameStarted) {

    imageToDraw = playerImages.idle;

  }

  // CORRIENDO
  else {

    runAnimationTimer++;

    if (runAnimationTimer >= RUN_ANIMATION_SPEED) {

      runFrame++;

      if (runFrame > 1) {
        runFrame = 0;
      }

      runAnimationTimer = 0;
    }

    if (runFrame === 0) {

      imageToDraw = playerImages.run1;

    } else {

      imageToDraw = playerImages.run2;
    }
  }


  // DIBUJAR PERSONAJE
  if (
    imageToDraw &&
    imageToDraw.complete &&
    imageToDraw.naturalWidth > 0
  ) {

    ctx.drawImage(
      imageToDraw,
      player.x,
      player.y,
      player.width,
      player.height
    );

  } else {

    // Si la imagen todavía no cargó,
    // muestra un rectángulo provisional.

    ctx.fillStyle = "#1947A3";

    ctx.fillRect(
      player.x,
      player.y,
      player.width,
      player.height
    );
  }
}

// ==========================================
// FÍSICA DEL JUGADOR
// ==========================================

function updatePlayer() {

  // Mantener espacio o dedo
  // produce un salto más alto

  if (
    jumpHeld &&
    player.jumping &&
    player.velocityY < 0 &&
    jumpHoldFrames < MAX_JUMP_HOLD
  ) {

    player.velocityY -= 0.45;

    jumpHoldFrames++;
  }


  player.velocityY += gravity;

  player.y += player.velocityY;


  const floor =
    groundY -
    player.height;


  if (player.y >= floor) {

    player.y = floor;

    player.velocityY = 0;

    player.jumping = false;

    jumpHoldFrames = 0;
  }
}


// ==========================================
// CREAR OBSTÁCULO
// ==========================================

function createObstacle() {

  let types = [

    {
      type: "small",
      width: 30,
      height: 40
    },

    {
      type: "tall",
      width: 40,
      height: 65
    }

  ];


  // NIVEL 2

  if (level >= 2) {

    types.push({

      type: "wide",
      width: 80,
      height: 30

    });


    // Obstáculo aéreo alto

    types.push(
      {
        type: "flyingHigh",
        width: 55,
        height: 35
      },

      {
        type: "flyingHigh",
        width: 55,
        height: 35
      }
    );
  }


  // NIVEL 3

  if (level >= 3) {

    // Obstáculo aéreo bajo

    types.push(
      {
        type: "flyingLow",
        width: 55,
        height: 35
      },

      {
        type: "flyingLow",
        width: 55,
        height: 35
      }
    );
  }


  const type =
    types[
      Math.floor(
        Math.random() *
        types.length
      )
    ];


  let y;


  if (
    type.type === "flyingHigh"
  ) {

    y =
      groundY - 155;
  }

  else if (
    type.type === "flyingLow"
  ) {

    y =
      groundY - 105;
  }

  else {

    y =
      groundY -
      type.height;
  }


  obstacles.push({

    x:
      canvas.width + 30,

    y: y,

    width:
      type.width,

    height:
      type.height,

    type:
      type.type,

    passed:
      false
  });
}


// ==========================================
// DIBUJAR OBSTÁCULOS
// ==========================================

function drawObstacle(obstacle) {

  if (
    obstacle.type === "small"
  ) {

    ctx.fillStyle =
      "#6B7280";
  }

  else if (
    obstacle.type === "tall"
  ) {

    ctx.fillStyle =
      "#7C3AED";
  }

  else if (
    obstacle.type === "wide"
  ) {

    ctx.fillStyle =
      "#B45309";
  }

  else if (
    obstacle.type === "flyingHigh"
  ) {

    ctx.fillStyle =
      "#DC2626";
  }

  else if (
    obstacle.type === "flyingLow"
  ) {

    ctx.fillStyle =
      "#F97316";
  }


  ctx.fillRect(
    obstacle.x,
    obstacle.y,
    obstacle.width,
    obstacle.height
  );
}


// ==========================================
// ACTUALIZAR OBSTÁCULOS
// ==========================================

function updateObstacles() {

  obstacleTimer++;


  if (
    obstacleTimer >=
    nextObstacle
  ) {

    createObstacle();

    obstacleTimer = 0;


    let minDistance =
      95 -
      Math.min(
        level * 3,
        25
      );


    nextObstacle =
      minDistance +
      Math.floor(
        Math.random() * 75
      );
  }


  for (
    let i =
      obstacles.length - 1;

    i >= 0;

    i--
  ) {

    const obstacle =
      obstacles[i];


    obstacle.x -=
      gameSpeed;


    drawObstacle(
      obstacle
    );


    checkCollision(
      obstacle
    );


    // BONUS POR SUPERAR

    if (
      !obstacle.passed &&

      obstacle.x +
      obstacle.width <
      player.x
    ) {

      obstacle.passed =
        true;

      score += 25;
    }


    // ELIMINAR

    if (
      obstacle.x +
      obstacle.width <
      -20
    ) {

      obstacles.splice(
        i,
        1
      );
    }
  }
}


// ==========================================
// CREAR COLECCIONABLE
// ==========================================

function createCollectible() {

  const random =
    Math.random();


  let collectible;


  // 60% - +50

  if (random < 0.60) {

    collectible = {

      type: "star",

      value: 50,

      color: "#FFD700",

      size: 22
    };
  }


  // 30% - +100

  else if (random < 0.90) {

    collectible = {

      type: "gem",

      value: 100,

      color: "#22D3EE",

      size: 24
    };
  }


  // 10% - +250

  else {

    collectible = {

      type: "crown",

      value: 250,

      color: "#F59E0B",

      size: 28
    };
  }


  const heights = [

    groundY - 100,

    groundY - 160,

    groundY - 220

  ];


  const randomHeight =
    heights[
      Math.floor(
        Math.random() *
        heights.length
      )
    ];


  collectibles.push({

    x:
      canvas.width + 50,

    y:
      randomHeight,

    width:
      collectible.size,

    height:
      collectible.size,

    type:
      collectible.type,

    value:
      collectible.value,

    color:
      collectible.color

  });
}


// ==========================================
// DIBUJAR COLECCIONABLE
// ==========================================

function drawCollectible(item) {

  ctx.fillStyle =
    item.color;


  ctx.beginPath();


  ctx.arc(
    item.x +
    item.width / 2,

    item.y +
    item.height / 2,

    item.width / 2,

    0,

    Math.PI * 2
  );


  ctx.fill();


  ctx.strokeStyle =
    "#FFFFFF";


  ctx.lineWidth =
    2;


  ctx.stroke();
}


// ==========================================
// ACTUALIZAR COLECCIONABLES
// ==========================================

function updateCollectibles() {

  collectibleTimer++;


  if (
    collectibleTimer >=
    nextCollectible
  ) {

    createCollectible();


    collectibleTimer = 0;


    nextCollectible =
      150 +
      Math.floor(
        Math.random() * 130
      );
  }


  for (
    let i =
      collectibles.length - 1;

    i >= 0;

    i--
  ) {

    const item =
      collectibles[i];


    item.x -=
      gameSpeed;


    drawCollectible(
      item
    );


    if (
      checkCollectibleCollision(
        item
      )
    ) {

      collectItem(
        item
      );


      collectibles.splice(
        i,
        1
      );


      continue;
    }


    if (
      item.x +
      item.width <
      -20
    ) {

      collectibles.splice(
        i,
        1
      );
    }
  }
}


// ==========================================
// COLISIÓN CON COLECCIONABLE
// ==========================================

function checkCollectibleCollision(item) {

  return (

    player.x <
    item.x +
    item.width &&

    player.x +
    player.width >
    item.x &&

    player.y <
    item.y +
    item.height &&

    player.y +
    player.height >
    item.y

  );
}


// ==========================================
// RECOGER OBJETO
// ==========================================

function collectItem(item) {

  score +=
    item.value *
    combo;


  combo++;


  if (combo > 5) {

    combo = 5;
  }


  comboTimer =
    COMBO_TIME;
}


// ==========================================
// COMBO
// ==========================================

function updateCombo() {

  if (
    comboTimer > 0
  ) {

    comboTimer--;
  }

  else {

    combo = 1;
  }
}


function drawCombo() {

  if (
    combo <= 1
  ) {

    return;
  }


  ctx.fillStyle =
    "#FFD700";


  ctx.font =
    "bold 26px Arial";


  ctx.fillText(
    "COMBO x" +
    combo,

    780,

    55
  );
}


// ==========================================
// COLISIÓN CON OBSTÁCULO
// ==========================================

function checkCollision(obstacle) {

  const paddingX = 7;
  const paddingY = 5;


  const playerLeft =
    player.x +
    paddingX;


  const playerRight =
    player.x +
    player.width -
    paddingX;


  const playerTop =
    player.y +
    paddingY;


  const playerBottom =
    player.y +
    player.height -
    paddingY;


  if (

    playerRight >
    obstacle.x &&

    playerLeft <
    obstacle.x +
    obstacle.width &&

    playerBottom >
    obstacle.y &&

    playerTop <
    obstacle.y +
    obstacle.height

  ) {

    endGame();
  }
}


// ==========================================
// NIVEL
// ==========================================

function updateLevel() {

  // CADA 500 PUNTOS

  const newLevel =
    Math.floor(
      score / 500
    ) + 1;


  if (
    newLevel >
    level
  ) {

    level =
      newLevel;


    levelMessageTimer =
      120;
  }
}


// ==========================================
// VELOCIDAD
// ==========================================

function updateDifficulty() {

  // +0.5 CADA 200 PUNTOS

  const speedIncrease =
    Math.floor(
      score / 200
    ) * 0.5;


  gameSpeed =
    BASE_SPEED +
    speedIncrease;


  if (
    gameSpeed >
    MAX_SPEED
  ) {

    gameSpeed =
      MAX_SPEED;
  }
}


// ==========================================
// MENSAJE DE NIVEL
// ==========================================

function drawLevelMessage() {

  if (
    levelMessageTimer <= 0
  ) {

    return;
  }


  ctx.save();


  ctx.fillStyle =
    "rgba(0,0,0,0.50)";


  ctx.fillRect(
    350,
    170,
    300,
    110
  );


  ctx.textAlign =
    "center";


  ctx.fillStyle =
    "#FFD700";


  ctx.font =
    "bold 38px Arial";


  ctx.fillText(
    "LEVEL " + level,

    canvas.width / 2,

    220
  );


  ctx.font =
    "18px Arial";


  ctx.fillStyle =
    "#FFFFFF";


  ctx.fillText(
    "¡Nuevo nivel!",

    canvas.width / 2,

    252
  );


  ctx.restore();


  if (!paused) {

    levelMessageTimer--;
  }
}


// ==========================================
// TERMINAR PARTIDA
// ==========================================

function endGame() {

  gameOver =
    true;


  const finalScore =
    Math.floor(score);


  if (
    finalScore >
    highScore
  ) {

    highScore =
      finalScore;


    localStorage.setItem(
      "levelUpHighScore",
      highScore
    );
  }
}


// ==========================================
// REINICIAR
// ==========================================

function restartGame() {

  score = 0;

  level = 1;

  gameSpeed =
    BASE_SPEED;


  obstacles = [];

  collectibles = [];


  obstacleTimer = 0;

  collectibleTimer = 0;


  nextObstacle = 110;

  nextCollectible = 180;


  combo = 1;

  comboTimer = 0;


  levelMessageTimer = 0;


  player.y =
    groundY -
    player.height;


  player.velocityY = 0;

  player.jumping =
    false;


  jumpHeld =
    false;


  jumpHoldFrames =
    0;


  gameOver =
    false;


  paused =
    false;


  gameStarted =
    true;
}


// ==========================================
// INTERFAZ
// ==========================================

function drawUI() {

  ctx.fillStyle =
    "#FFFFFF";


  ctx.font =
    "bold 26px Arial";


  ctx.fillText(
    "LEVEL UP",
    25,
    40
  );


  ctx.font =
    "bold 18px Arial";


  ctx.fillText(
    "PUNTOS: " +
    Math.floor(score),

    25,

    72
  );


  ctx.fillText(
    "RÉCORD: " +
    highScore,

    25,

    100
  );


  ctx.fillText(
    "NIVEL: " +
    level,

    25,

    128
  );


  ctx.fillText(
    "VELOCIDAD: " +
    gameSpeed.toFixed(1),

    25,

    156
  );
}


// ==========================================
// PANTALLA INICIAL
// ==========================================

function drawStartScreen() {

  ctx.fillStyle =
    "rgba(0,0,0,0.45)";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.textAlign =
    "center";


  ctx.fillStyle =
    "#FFFFFF";


  ctx.font =
    "bold 60px Arial";


  ctx.fillText(
    "LEVEL UP",

    canvas.width / 2,

    170
  );


  ctx.font =
    "21px Arial";


  ctx.fillText(
    "ESPACIO = comenzar / saltar",

    canvas.width / 2,

    290
  );


  ctx.fillText(
    "Mantén ESPACIO = salto alto",

    canvas.width / 2,

    325
  );


  ctx.fillText(
    "En celular toca la pantalla",

    canvas.width / 2,

    360
  );


  ctx.textAlign =
    "left";
}


// ==========================================
// PAUSA
// ==========================================

function drawPauseScreen() {

  ctx.fillStyle =
    "rgba(0,0,0,0.55)";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.textAlign =
    "center";


  ctx.fillStyle =
    "#FFFFFF";


  ctx.font =
    "bold 50px Arial";


  ctx.fillText(
    "PAUSA",

    canvas.width / 2,

    220
  );


  ctx.font =
    "21px Arial";


  ctx.fillText(
    "Presiona P para continuar",

    canvas.width / 2,

    270
  );


  ctx.textAlign =
    "left";
}


// ==========================================
// GAME OVER
// ==========================================

function drawGameOver() {

  ctx.fillStyle =
    "rgba(0,0,0,0.65)";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  ctx.textAlign =
    "center";


  ctx.fillStyle =
    "#FFFFFF";


  ctx.font =
    "bold 55px Arial";


  ctx.fillText(
    "GAME OVER",

    canvas.width / 2,

    175
  );


  ctx.font =
    "bold 25px Arial";


  ctx.fillText(
    "PUNTOS: " +
    Math.floor(score),

    canvas.width / 2,

    235
  );


  ctx.fillText(
    "RÉCORD: " +
    highScore,

    canvas.width / 2,

    275
  );


  ctx.fillText(
    "NIVEL: " +
    level,

    canvas.width / 2,

    315
  );


  ctx.font =
    "19px Arial";


  ctx.fillText(
    "ESPACIO o toca para volver a jugar",

    canvas.width / 2,

    370
  );


  ctx.textAlign =
    "left";
}


// ==========================================
// CONTROLES PC
// ==========================================

document.addEventListener(
  "keydown",
  function(e) {


    // PAUSA

    if (
      e.code === "KeyP" &&
      gameStarted &&
      !gameOver
    ) {

      paused =
        !paused;

      return;
    }


    // ESPACIO

    if (
      e.code !== "Space"
    ) {

      return;
    }


    e.preventDefault();


    // INICIAR

    if (!gameStarted) {

      gameStarted =
        true;

      return;
    }


    if (paused) {

      return;
    }


    // REINICIAR

    if (gameOver) {

      restartGame();

      return;
    }


    // SALTO

    if (!player.jumping) {

      player.velocityY =
        -14.5;


      player.jumping =
        true;


      jumpHeld =
        true;


      jumpHoldFrames =
        0;
    }

    else {

      jumpHeld =
        true;
    }

  }
);


// SOLTAR ESPACIO

document.addEventListener(
  "keyup",
  function(e) {

    if (
      e.code === "Space"
    ) {

      jumpHeld =
        false;
    }

  }
);


// ==========================================
// CONTROLES CELULAR
// ==========================================

canvas.addEventListener(
  "touchstart",
  function(e) {

    e.preventDefault();


    // INICIAR

    if (!gameStarted) {

      gameStarted =
        true;

      return;
    }


    if (paused) {

      return;
    }


    // REINICIAR

    if (gameOver) {

      restartGame();

      return;
    }


    // SALTO

    if (!player.jumping) {

      player.velocityY =
        -14.5;


      player.jumping =
        true;


      jumpHeld =
        true;


      jumpHoldFrames =
        0;
    }

    else {

      jumpHeld =
        true;
    }

  },

  {
    passive: false
  }
);


// SOLTAR DEDO

canvas.addEventListener(
  "touchend",
  function(e) {

    e.preventDefault();

    jumpHeld =
      false;

  },

  {
    passive: false
  }
);


// ==========================================
// LOOP PRINCIPAL
// ==========================================

function gameLoop() {

  drawBackground();

  updateClouds();

  drawGround();


  if (
    gameStarted &&
    !gameOver &&
    !paused
  ) {

    updatePlayer();

    updateObstacles();

    updateCollectibles();

    updateCombo();


    // PUNTOS POR SOBREVIVIR

    score += 0.1;


    updateLevel();

    updateDifficulty();
  }


  drawBible();

  drawUI();

  drawCombo();

  drawLevelMessage();


  if (!gameStarted) {

    drawStartScreen();
  }


  if (paused) {

    drawPauseScreen();
  }


  if (gameOver) {

    drawGameOver();
  }


  requestAnimationFrame(
    gameLoop
  );
}


// ==========================================
// INICIAR
// ==========================================

gameLoop();