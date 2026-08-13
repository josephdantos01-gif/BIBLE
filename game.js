const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 720;


// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================

const gravity = 0.8;

// Línea física donde pisan personaje y obstáculos
const groundY = 455;

// Posición visual donde comienza el PNG del suelo
const groundDrawY = 420;

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
// IMÁGENES DE INTERFAZ
// ==========================================

const startScreenImage = new Image();
startScreenImage.src =
  "assets/ui/start-screen.png";

const gameOverImage = new Image();
gameOverImage.src =
  "assets/ui/game-over.png";


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

playerImages.idle.src =
  "assets/player/idle.png";

playerImages.run1.src =
  "assets/player/run1.png";

playerImages.run2.src =
  "assets/player/run2.png";

playerImages.jump.src =
  "assets/player/jump.png";

playerImages.hit.src =
  "assets/player/hit.png";


// ==========================================
// IMÁGENES DEL ESCENARIO
// ==========================================

const skyImage = new Image();
skyImage.src =
  "assets/background/sky.png";

const mountainsImage = new Image();
mountainsImage.src =
  "assets/background/mountains.png";

const forestImage = new Image();
forestImage.src =
  "assets/background/tree.png";

const treeImage = new Image();
treeImage.src =
  "assets/background/tree2.png";

const groundImage = new Image();
groundImage.src =
  "assets/background/ground.png";


// ==========================================
// MOVIMIENTO DEL ESCENARIO
// ==========================================

let mountainOffset = 0;
let forestOffset = 0;
let treeOffset = 0;
let groundOffset = 0;

// ==========================================
// SPRITES DE OBSTÁCULOS
// ==========================================

const obstacleImages = {
  rock: new Image(),
  fire: new Image(),
  snake: new Image(),
  wall: new Image(),
  raven: new Image(),
  devil: new Image()
};

obstacleImages.rock.src =
  "assets/obstacles/rock.png";

obstacleImages.fire.src =
  "assets/obstacles/fire.png";

obstacleImages.snake.src =
  "assets/obstacles/snake.png";

obstacleImages.wall.src =
  "assets/obstacles/wall.png";

obstacleImages.raven.src =
  "assets/obstacles/raven.png";

obstacleImages.devil.src =
  "assets/obstacles/devil.png";

  // ==========================================
// IMÁGENES DE COLECCIONABLES
// ==========================================

const collectibleImages = {
  star: new Image(),
  gem: new Image(),
  crown: new Image()
};

collectibleImages.star.src =
  "assets/collectibles/star.png";

collectibleImages.gem.src =
  "assets/collectibles/gem.png";

collectibleImages.crown.src =
  "assets/collectibles/crown.png";


// ==========================================
// IMÁGENES DE POWER UPS
// ==========================================

const powerUpImages = {
  heart: new Image(),
  shield: new Image(),
  sword: new Image(),
  scroll: new Image()
};

powerUpImages.heart.src =
  "assets/powerups/heart.png";

powerUpImages.shield.src =
  "assets/powerups/shield.png";

powerUpImages.sword.src =
  "assets/powerups/sword.png";

powerUpImages.scroll.src =
  "assets/powerups/scroll.png";
// ==========================================
// ANIMACIÓN DEL PERSONAJE
// ==========================================

let runFrame = 0;
let runAnimationTimer = 0;

const RUN_ANIMATION_SPEED = 8;


// ==========================================
// JUGADOR
// ==========================================

const player = {

  x: 120,
  y: groundY - 85,

  width: 90,
  height: 110,

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

// ==========================================
// POWER UPS
// ==========================================

let powerUps = [];

let powerUpTimer = 0;
let nextPowerUp = 1000;

// Estados
let extraLives = 0;
let shieldActive = false;
let swordActive = false;

const MAX_EXTRA_LIVES = 3;
let collectibleTimer = 0;
let nextCollectible = 180;


// ==========================================
// FONDO / PARALLAX
// ==========================================

function drawBackground() {

  // ------------------------------------------
  // CIELO
  // ------------------------------------------

  if (
    skyImage.complete &&
    skyImage.naturalWidth > 0
  ) {

    ctx.drawImage(
      skyImage,
      0,
      0,
      canvas.width,
      canvas.height
    );

  } else {

    ctx.fillStyle = "#41B6E6";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

  }


  // ------------------------------------------
  // MOVER CAPAS
  // ------------------------------------------

  if (
    gameStarted &&
    !gameOver &&
    !paused
  ) {

    mountainOffset -=
      gameSpeed * 0.08;

    forestOffset -=
      gameSpeed * 0.20;

    treeOffset -=
      gameSpeed * 0.45;

  }


  // ------------------------------------------
  // MONTAÑAS
  // ------------------------------------------

  if (
    mountainOffset <=
    -canvas.width
  ) {

    mountainOffset +=
      canvas.width;

  }


  if (
    mountainsImage.complete &&
    mountainsImage.naturalWidth > 0
  ) {

    ctx.drawImage(
      mountainsImage,
      mountainOffset,
      145,
      canvas.width,
      275
    );

    ctx.drawImage(
      mountainsImage,
      mountainOffset + canvas.width,
      145,
      canvas.width,
      275
    );

  }


  // ------------------------------------------
  // BOSQUE
  // ------------------------------------------

  if (
    forestOffset <=
    -canvas.width
  ) {

    forestOffset +=
      canvas.width;

  }


  if (
    forestImage.complete &&
    forestImage.naturalWidth > 0
  ) {

    ctx.drawImage(
      forestImage,
      forestOffset,
      245,
      canvas.width,
      175
    );

    ctx.drawImage(
      forestImage,
      forestOffset + canvas.width,
      245,
      canvas.width,
      175
    );

  }

// ==========================================
// RELLENO ENTRE BOSQUE Y SUELO
// ==========================================

ctx.fillStyle = "#2466A8";

ctx.fillRect(
  0,
  400,
  canvas.width,
  groundY - 400
);


  // ------------------------------------------
  // ÁRBOLES INDIVIDUALES
  // ------------------------------------------

  const treeSpacing = 420;

  if (
    treeOffset <=
    -treeSpacing
  ) {

    treeOffset +=
      treeSpacing;

  }


  if (
    treeImage.complete &&
    treeImage.naturalWidth > 0
  ) {

    const treeWidth = 105;
    const treeHeight = 170;

    for (
      let x = treeOffset + 250;
      x < canvas.width + treeSpacing;
      x += treeSpacing
    ) {

      ctx.drawImage(
        treeImage,
        x,
        groundY - treeHeight,
        treeWidth,
        treeHeight
      );

    }

  }

}


// ==========================================
// SUELO
// ==========================================

function drawGround() {

  // ==========================================
  // COLOR DE FONDO DE LA TIERRA
  // Evita que se vea el cielo debajo
  // ==========================================

  ctx.fillStyle = "#5A351F";

  ctx.fillRect(
    0,
    groundDrawY,
    canvas.width,
    canvas.height - groundDrawY
  );


  // ==========================================
  // IMAGEN DEL SUELO
  // ==========================================

  if (
    groundImage.complete &&
    groundImage.naturalWidth > 0
  ) {

    // Un poco más ancho para que los bloques
    // se monten entre sí y no dejen huecos
    const tileWidth = 330;

    // Más alto para rellenar la pantalla
    const tileHeight =
      canvas.height - groundDrawY + 80;


    // MOVIMIENTO DEL SUELO

    if (
      gameStarted &&
      !gameOver &&
      !paused
    ) {

      groundOffset -= gameSpeed;

    }


    // Reiniciar desplazamiento

    if (
      groundOffset <= -tileWidth
    ) {

      groundOffset += tileWidth;

    }


    // ==========================================
    // DIBUJAR BLOQUES
    // ==========================================

    for (
      let x = groundOffset - tileWidth;
      x < canvas.width + tileWidth;
      x += tileWidth - 2
    ) {

      ctx.drawImage(
        groundImage,

        x,
        groundDrawY,

        // +3 evita líneas entre bloques
        tileWidth + 3,
        tileHeight
      );

    }

  }

}


// ==========================================
// DIBUJAR PERSONAJE
// ==========================================

function drawBible() {

  let imageToDraw;


  // GAME OVER
  if (gameOver) {

    imageToDraw =
      playerImages.hit;

  }


  // SALTANDO
  else if (
    player.jumping
  ) {

    imageToDraw =
      playerImages.jump;

  }


  // ANTES DE INICIAR
  else if (
    !gameStarted
  ) {

    imageToDraw =
      playerImages.idle;

  }


  // CORRIENDO
  else {

    if (!paused) {

      runAnimationTimer++;

    }


    if (
      runAnimationTimer >=
      RUN_ANIMATION_SPEED
    ) {

      runFrame++;

      if (
        runFrame > 1
      ) {

        runFrame = 0;

      }

      runAnimationTimer = 0;

    }


    imageToDraw =
      runFrame === 0
        ? playerImages.run1
        : playerImages.run2;

  }


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

    ctx.fillStyle =
      "#1947A3";

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

  if (
    jumpHeld &&
    player.jumping &&
    player.velocityY < 0 &&
    jumpHoldFrames <
    MAX_JUMP_HOLD
  ) {

    player.velocityY -=
      0.45;

    jumpHoldFrames++;

  }


  player.velocityY +=
    gravity;

  player.y +=
    player.velocityY;


  const floor =
    groundY -
    player.height;


  if (
    player.y >= floor
  ) {

    player.y =
      floor;

    player.velocityY =
      0;

    player.jumping =
      false;

    jumpHoldFrames =
      0;

  }

}


// ==========================================
// CREAR OBSTÁCULO
// ==========================================

function createObstacle() {

  let types = [

    // PIEDRA
    {
      type: "rock",
      width: 75,
      height: 65,
      position: "ground"
    },

    // FUEGO
    {
      type: "fire",
      width: 65,
      height: 85,
      position: "ground"
    },

    // SERPIENTE
    {
      type: "snake",
      width: 100,
      height: 60,
      position: "ground"
    },

    // MURO / ESCOMBROS
    {
      type: "wall",
      width: 120,
      height: 85,
      position: "ground"
    }

  ];


  // ==========================
  // NIVEL 2
  // Aparece el cuervo
  // ==========================

  if (level >= 2) {

    types.push({
      type: "raven",
      width: 110,
      height: 80,
      position: "airHigh"
    });

  }


  // ==========================
  // NIVEL 3
  // Aparece el diablo
  // ==========================

  if (level >= 3) {

    types.push({
      type: "devil",
      width: 100,
      height: 100,
      position: "airLow"
    });

  }


  // Elegir obstáculo aleatorio

  const obstacleType =
    types[
      Math.floor(
        Math.random() *
        types.length
      )
    ];


  let y;


  // TERRESTRES

  if (
    obstacleType.position ===
    "ground"
  ) {

    y =
      groundY -
      obstacleType.height;

  }


  // AÉREO ALTO

  else if (
    obstacleType.position ===
    "airHigh"
  ) {

    y =
      groundY - 190;

  }


  // AÉREO BAJO

  else {

    y =
      groundY - 120;

  }


  obstacles.push({

    x:
      canvas.width + 30,

    y: y,

    width:
      obstacleType.width,

    height:
      obstacleType.height,

    type:
      obstacleType.type,

    passed:
      false

  });

}

// ==========================================
// DIBUJAR OBSTÁCULOS
// ==========================================

function drawObstacle(obstacle) {

  const image =
    obstacleImages[
      obstacle.type
    ];


  if (
    image &&
    image.complete &&
    image.naturalWidth > 0
  ) {

    ctx.drawImage(
      image,

      obstacle.x,
      obstacle.y,

      obstacle.width,
      obstacle.height
    );

  }

  else {

    // Rectángulo provisional
    // si alguna imagen no carga

    ctx.fillStyle =
      "#FF0000";

    ctx.fillRect(
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );

  }

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


    const minDistance =
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

    // Si espada, escudo o corazón neutralizó el choque,
    // quitamos este obstáculo y seguimos con el siguiente.
    if (obstacle.destroyed) {
      obstacles.splice(i, 1);
      continue;
    }


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


  if (
    random < 0.60
  ) {

    collectible = {

      type: "star",

      value: 50,

      color: "#FFD700",

      size: 55

    };

  }

  else if (
    random < 0.90
  ) {

    collectible = {

      type: "gem",

      value: 100,

      color: "#22D3EE",

      size: 60

    };

  }

  else {

    collectible = {

      type: "crown",

      value: 250,

      color: "#F59E0B",

      size: 65

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
  const image = collectibleImages[item.type];

  if (image && image.complete && image.naturalWidth > 0) {
    ctx.drawImage(
      image,
      item.x,
      item.y,
      item.width,
      item.height
    );
  } else {
    ctx.fillStyle = item.color || "#FFD700";
    ctx.beginPath();
    ctx.arc(
      item.x + item.width / 2,
      item.y + item.height / 2,
      item.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
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


    collectibleTimer =
      0;


    nextCollectible =
      150 +
      Math.floor(
        Math.random() *
        130
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

function checkCollectibleCollision(
  item
) {

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

function collectItem(
  item
) {

  score +=
    item.value *
    combo;


  combo++;


  if (
    combo > 5
  ) {

    combo = 5;

  }


  comboTimer =
    COMBO_TIME;

}

// ==========================================
// POWER UPS
// ==========================================

function createPowerUp() {

  const random =
    Math.random();

  let powerUp;


  // ❤️ CORAZÓN - 35%
  if (random < 0.35) {

    powerUp = {
      type: "heart",
      width: 60,
      height: 60
    };

  }


  // 🛡️ ESCUDO - 30%
  else if (random < 0.65) {

    powerUp = {
      type: "shield",
      width: 65,
      height: 70
    };

  }


  // ⚔️ ESPADA - 20%
  else if (random < 0.85) {

    powerUp = {
      type: "sword",
      width: 55,
      height: 85
    };

  }


  // 📜 PERGAMINO - 15%
  else {

    powerUp = {
      type: "scroll",
      width: 75,
      height: 60
    };

  }


  const heights = [

    groundY - 100,
    groundY - 160,
    groundY - 210

  ];


  const y =
    heights[
      Math.floor(
        Math.random() *
        heights.length
      )
    ];


  powerUps.push({

    x:
      canvas.width + 50,

    y: y,

    width:
      powerUp.width,

    height:
      powerUp.height,

    type:
      powerUp.type

  });

}


//DIBUJAR LOS POWEUPS

function drawPowerUp(powerUp) {
  const image = powerUpImages[powerUp.type];

  if (image && image.complete && image.naturalWidth > 0) {
    ctx.drawImage(
      image,
      powerUp.x,
      powerUp.y,
      powerUp.width,
      powerUp.height
    );
  } else {
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(
      powerUp.x,
      powerUp.y,
      powerUp.width,
      powerUp.height
    );
  }
}

//COLISION

function checkPowerUpCollision(powerUp) {

  return (

    player.x <
    powerUp.x +
    powerUp.width &&

    player.x +
    player.width >
    powerUp.x &&

    player.y <
    powerUp.y +
    powerUp.height &&

    player.y +
    player.height >
    powerUp.y

  );

}

//ACTIVAR

function activatePowerUp(powerUp) {

  // ❤️ VIDA EXTRA

  if (
    powerUp.type === "heart"
  ) {

    if (
      extraLives <
      MAX_EXTRA_LIVES
    ) {

      extraLives++;

    }

  }


  // 🛡️ ESCUDO

  else if (
    powerUp.type === "shield"
  ) {

    shieldActive = true;

  }


  // ⚔️ ESPADA

  else if (
    powerUp.type === "sword"
  ) {

    swordActive = true;

  }


  // 📜 PERGAMINO

  else if (
    powerUp.type === "scroll"
  ) {

    score += 500;

  }

}

//ACTUALIZAR

function updatePowerUps() {

  powerUpTimer++;


  if (
    powerUpTimer >=
    nextPowerUp
  ) {

    createPowerUp();

    powerUpTimer = 0;


    // próximo entre aprox.
    // 15 y 25 segundos

    nextPowerUp =
      900 +
      Math.floor(
        Math.random() *
        600
      );

  }


  for (
    let i =
      powerUps.length - 1;

    i >= 0;

    i--
  ) {

    const powerUp =
      powerUps[i];


    powerUp.x -=
      gameSpeed;


    drawPowerUp(
      powerUp
    );


    // RECOGER

    if (
      checkPowerUpCollision(
        powerUp
      )
    ) {

      activatePowerUp(
        powerUp
      );


      powerUps.splice(
        i,
        1
      );


      continue;

    }


    // ELIMINAR SI SALE
    // DE LA PANTALLA

    if (
      powerUp.x +
      powerUp.width <
      -20
    ) {

      powerUps.splice(
        i,
        1
      );

    }

  }

}

//COLISIION



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
// COLISIÓN CON OBSTÁCULOS
// ==========================================

function checkCollision(obstacle) {
  const paddingX = 16;
  const paddingY = 12;

  const playerLeft = player.x + paddingX;
  const playerRight = player.x + player.width - paddingX;
  const playerTop = player.y + paddingY;
  const playerBottom = player.y + player.height - paddingY;

  const collision = (
    playerRight > obstacle.x &&
    playerLeft < obstacle.x + obstacle.width &&
    playerBottom > obstacle.y &&
    playerTop < obstacle.y + obstacle.height
  );

  if (!collision) return;

  // ⚔️ Espada: destruye el próximo obstáculo tocado
  if (swordActive) {
    swordActive = false;
    obstacle.destroyed = true;
    return;
  }

  // 🛡️ Escudo: absorbe un golpe
  if (shieldActive) {
    shieldActive = false;
    obstacle.destroyed = true;
    return;
  }

  // ❤️ Corazón: una vida extra
  if (extraLives > 0) {
    extraLives--;
    obstacle.destroyed = true;
    return;
  }

  endGame();
}


// ==========================================
// NIVEL
// ==========================================

function updateLevel() {

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

    "LEVEL " +
    level,

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


  if (
    !paused
  ) {

    levelMessageTimer--;

  }

}


// ==========================================
// TERMINAR PARTIDA
// ==========================================

function endGame() {

  gameOver = true;


  jumpHeld = false;


  const finalScore =
    Math.floor(
      score
    );


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

  powerUps = [];


  obstacleTimer = 0;

  collectibleTimer = 0;

  powerUpTimer = 0;


  nextObstacle = 110;

  nextCollectible = 180;

  nextPowerUp = 1000;

  extraLives = 0;
  shieldActive = false;
  swordActive = false;


  combo = 1;

  comboTimer = 0;


  levelMessageTimer = 0;


  player.y =
    groundY -
    player.height;


  player.velocityY =
    0;

  player.jumping =
    false;


  jumpHeld =
    false;


  jumpHoldFrames =
    0;


  runFrame =
    0;

  runAnimationTimer =
    0;


  gameOver =
    false;

  paused =
    false;

  gameStarted =
    true;

}


// ==========================================
// INTERFAZ DURANTE PARTIDA
// ==========================================

function drawUI() {
  ctx.save();

  ctx.textAlign = "right";
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.font = "bold 22px monospace";

  const x = canvas.width - 25;

  const puntosText = "PUNTOS: " + Math.floor(score);
  ctx.strokeText(puntosText, x, 40);
  ctx.fillText(puntosText, x, 40);

  const recordText = "RÉCORD: " + highScore;
  ctx.strokeText(recordText, x, 72);
  ctx.fillText(recordText, x, 72);

  const nivelText = "NIVEL: " + level;
  ctx.strokeText(nivelText, x, 104);
  ctx.fillText(nivelText, x, 104);

  ctx.restore();
}


// ==========================================
// PANTALLA DE INICIO
// ==========================================

function drawStartScreen() {

  if (

    startScreenImage.complete &&
    startScreenImage.naturalWidth > 0

  ) {

    ctx.drawImage(

      startScreenImage,

      0,
      0,

      canvas.width,
      canvas.height

    );

  }

  else {

    ctx.fillStyle =
      "#0B5EB7";


    ctx.fillRect(

      0,
      0,

      canvas.width,
      canvas.height

    );

  }


  // RÉCORD REAL

  ctx.textAlign =
    "center";


  ctx.fillStyle =
    "#FFFFFF";


  ctx.font =
    "bold 26px monospace";


  ctx.fillText(

    highScore,

    160,

    305

  );


  ctx.textAlign =
    "left";

}


// ==========================================
// GAME OVER
// ==========================================

function drawGameOver() {

  if (

    gameOverImage.complete &&
    gameOverImage.naturalWidth > 0

  ) {

    ctx.drawImage(

      gameOverImage,

      0,
      0,

      canvas.width,
      canvas.height

    );

  }

  else {

    ctx.fillStyle =
      "#160A35";


    ctx.fillRect(

      0,
      0,

      canvas.width,
      canvas.height

    );

  }


  // PUNTUACIÓN REAL

  ctx.textAlign =
    "center";


  ctx.fillStyle =
    "#FFFFFF";


  ctx.font =
    "bold 26px monospace";


  ctx.fillText(

    Math.floor(score),

    185,

    315

  );


  // RÉCORD REAL

  ctx.fillText(

    highScore,

    1000,

    315

  );


  ctx.textAlign =
    "left";

}


// ==========================================
// PAUSA
// ==========================================

function drawPauseScreen() {

  ctx.fillStyle =
    "rgba(0,0,0,0.60)";


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
    "bold 54px Arial";


  ctx.fillText(

    "PAUSA",

    canvas.width / 2,

    230

  );


  ctx.font =
    "20px Arial";


  ctx.fillText(

    "Presiona P para continuar",

    canvas.width / 2,

    275

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


    if (
      e.code !==
      "Space"
    ) {

      return;

    }


    e.preventDefault();


    // INICIAR

    if (
      !gameStarted
    ) {

      gameStarted =
        true;

      return;

    }


    // PAUSADO

    if (
      paused
    ) {

      return;

    }


    // REINICIAR

    if (
      gameOver
    ) {

      restartGame();

      return;

    }


    // SALTO

    if (
      !player.jumping
    ) {

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
      e.code ===
      "Space"
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

    if (
      !gameStarted
    ) {

      gameStarted =
        true;

      return;

    }


    if (
      paused
    ) {

      return;

    }


    // REINICIAR

    if (
      gameOver
    ) {

      restartGame();

      return;

    }


    // SALTO

    if (
      !player.jumping
    ) {

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

  // ESCENARIO

  drawBackground();

  drawGround();


  // JUEGO ACTIVO

  if (

    gameStarted &&
    !gameOver &&
    !paused

  ) {

    updatePlayer();

    updateObstacles();

    updateCollectibles();

    updatePowerUps();

    updateCombo();


    score +=
      0.1;


    updateLevel();

    updateDifficulty();

  }


  // PERSONAJE

  drawBible();


  // INTERFAZ

  if (
    gameStarted &&
    !gameOver
  ) {

    drawUI();

    drawCombo();

    drawLevelMessage();

  }


  // INICIO

  if (
    !gameStarted
  ) {

    drawStartScreen();

  }


  // PAUSA

  if (
    paused
  ) {

    drawPauseScreen();

  }


  // GAME OVER

  if (
    gameOver
  ) {

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