const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 720;


// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================

const gravity = 0.8;

// Línea física donde pisan personaje y obstáculos
const groundY = 500;

// Posición visual donde comienza el PNG del suelo
const groundDrawY = 350;

const BASE_SPEED = 10;
const MAX_SPEED = 30;
const SPEED_PER_LEVEL = 0.75;

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
// FRENESÍ
// Disponible solamente desde el NIVEL 10.
// Se activa al recoger 5 coleccionables seguidos sin recibir daño.
// ==========================================
let collectibleStreak = 0;
let frenzyActive = false;
let frenzyTimer = 0;
const FRENZY_TRIGGER = 5;
const FRENZY_DURATION = 420; // aprox. 7 segundos a 60 FPS
const FRENZY_SPEED_BONUS = 3;
const FRENZY_SCORE_MULTIPLIER = 2;


// ==========================================
// IMÁGENES DE INTERFAZ
// ==========================================

const startScreenImage = new Image();
startScreenImage.decoding = "async";
startScreenImage.fetchPriority = "high";
startScreenImage.src =
  "assets/ui/start-screen.png";

const gameOverImage = new Image();
gameOverImage.decoding = "async";


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

Object.values(playerImages).forEach((image) => {
  image.decoding = "async";
  image.fetchPriority = "high";
});

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
skyImage.decoding = "async";
skyImage.fetchPriority = "high";
skyImage.src =
  "assets/background/sky.png";

const mountainsImage = new Image();
mountainsImage.decoding = "async";
mountainsImage.fetchPriority = "high";
mountainsImage.src =
  "assets/background/mountains.png";

const forestImage = new Image();
forestImage.decoding = "async";
forestImage.fetchPriority = "high";
forestImage.src =
  "assets/background/tree.png";

const treeImage = new Image();
treeImage.decoding = "async";
treeImage.fetchPriority = "high";
treeImage.src =
  "assets/background/tree2.png";

const groundImage = new Image();
groundImage.decoding = "async";
groundImage.fetchPriority = "high";
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

Object.values(obstacleImages).forEach((image) => {
  image.decoding = "async";
});

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
 let playerHit = false;
let playerHitTimer = 0;

const HIT_DURATION = 45;

const collectibleImages = {
  star: new Image(),
  gem: new Image(),
  crown: new Image()
};

// star se carga en segundo plano para acelerar el inicio.

// gem se carga en segundo plano para acelerar el inicio.

// crown se carga en segundo plano para acelerar el inicio.


// ==========================================
// IMÁGENES DE POWER UPS
// ==========================================

const powerUpImages = {
  heart: new Image(),
  shield: new Image(),
  sword: new Image(),
  scroll: new Image()
};

powerUpImages.heart.decoding = "async";
powerUpImages.heart.fetchPriority = "high";
powerUpImages.heart.src =
  "assets/powerups/heart.png";

// shield se carga en segundo plano para acelerar el inicio.

// sword se carga en segundo plano para acelerar el inicio.

// scroll se carga en segundo plano para acelerar el inicio.
// ==========================================
// CARGA OPTIMIZADA DE ASSETS SECUNDARIOS
// ==========================================

let secondaryAssetsStarted = false;

function loadSecondaryAssets() {
  if (secondaryAssetsStarted) return;
  secondaryAssetsStarted = true;

  const secondaryAssets = [
    [gameOverImage, "assets/ui/game-over.png"],
    [collectibleImages.star, "assets/collectibles/star.png"],
    [collectibleImages.gem, "assets/collectibles/gem.png"],
    [collectibleImages.crown, "assets/collectibles/crown.png"],
    [powerUpImages.shield, "assets/powerups/shield.png"],
    [powerUpImages.sword, "assets/powerups/sword.png"],
    [powerUpImages.scroll, "assets/powerups/scroll.png"]
  ];

  secondaryAssets.forEach(([image, src]) => {
    image.decoding = "async";
    image.src = src;
  });
}

// Dejamos que primero entren pantalla inicial, escenario, personaje y obstáculos.
window.addEventListener("load", () => {
  setTimeout(loadSecondaryAssets, 250);
}, { once: true });

// Respaldo por si el evento load ya ocurrió o algún navegador lo retrasa.
setTimeout(loadSecondaryAssets, 1200);


// ==========================================
// AUDIO
// ==========================================

// Coloca estos 4 archivos en:
// assets/audio/music.mp3
// assets/audio/collect.mp3
// assets/audio/hit.mp3
// assets/audio/gameover.mp3

const bgMusic = new Audio("assets/audio/music.mp3");
const collectSound = new Audio("assets/audio/collect.mp3");
const hitSound = new Audio("assets/audio/hit.mp3");
const gameOverSound = new Audio("assets/audio/gameover.mp3");

// Ayuda al navegador a preparar el audio sin bloquear la carga visual.
bgMusic.preload = "metadata";
collectSound.preload = "auto";
hitSound.preload = "auto";
gameOverSound.preload = "auto";

bgMusic.loop = true;
bgMusic.volume = 0.22;

collectSound.volume = 0.60;
hitSound.volume = 0.72;
gameOverSound.volume = 0.78;

let musicStarted = false;

function startMusic() {
  if (gameOver) return;

  if (!musicStarted) {
    bgMusic.currentTime = 0;
    musicStarted = true;
  }

  bgMusic.play().catch(() => {
    // En móviles el navegador puede esperar otra interacción del usuario.
  });
}

function stopMusic() {
  bgMusic.pause();
}

function playSound(sound) {
  if (!sound) return;

  try {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  } catch (error) {
    console.warn("No se pudo reproducir un sonido:", error);
  }
}


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
  y: groundY - 110,

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
// ==========================================
// SISTEMA DE VIDAS
// ==========================================

let lives = 3;
const MAX_LIVES = 3;

// Estados de power-ups
let shieldActive = false;
let swordActive = false;

// Temporizadores de coleccionables
let collectibleTimer = 0;
let nextCollectible = 180;


// ==========================================
// TEXTOS BÍBLICOS EN PANTALLA
// Frases breves/paráfrasis con referencia.
// ==========================================

const biblicalMessages = [
  { text: "Confía en Dios con todo tu corazón", ref: "Proverbios 3:5" },
  { text: "Sé fuerte y valiente; Dios va contigo", ref: "Josué 1:9" },
  { text: "La Palabra guía cada paso", ref: "Salmo 119:105" },
  { text: "Dios renueva las fuerzas del que espera en Él", ref: "Isaías 40:31" },
  { text: "Permanece firme y no te rindas", ref: "1 Corintios 15:58" },
  { text: "Todo lo puedo en Cristo que me fortalece", ref: "Filipenses 4:13" },
  { text: "Busca primero el reino de Dios", ref: "Mateo 6:33" },
  { text: "La fe vence al temor", ref: "2 Timoteo 1:7" },
  { text: "Dios es refugio y fortaleza", ref: "Salmo 46:1" },
  { text: "Corre con paciencia la carrera", ref: "Hebreos 12:1" },
  { text: "Guarda la Palabra en tu corazón", ref: "Salmo 119:11" },
  { text: "No te canses de hacer el bien", ref: "Gálatas 6:9" },
  { text: "Camina por fe", ref: "2 Corintios 5:7" },
  { text: "Dios dirige tus pasos", ref: "Proverbios 16:9" },
  { text: "La verdad te hace libre", ref: "Juan 8:32" }
];

let currentBibleMessageIndex = Math.floor(Math.random() * biblicalMessages.length);
let bibleMessageTimer = 0;
const BIBLE_MESSAGE_DURATION = 480; // aprox. 8 segundos a 60 FPS

function updateBibleMessage() {
  bibleMessageTimer++;

  if (bibleMessageTimer >= BIBLE_MESSAGE_DURATION) {
    let nextIndex = currentBibleMessageIndex;

    while (nextIndex === currentBibleMessageIndex && biblicalMessages.length > 1) {
      nextIndex = Math.floor(Math.random() * biblicalMessages.length);
    }

    currentBibleMessageIndex = nextIndex;
    bibleMessageTimer = 0;
  }
}

function drawBibleMessage() {
  const message = biblicalMessages[currentBibleMessageIndex];
  if (!message) return;

  const boxWidth = 720;
  const boxHeight = 58;
  const boxX = (canvas.width - boxWidth) / 2;
  const boxY = 18;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.52)";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.font = "bold 18px monospace";

  const line = message.text + " — " + message.ref;
  ctx.strokeText(line, canvas.width / 2, boxY + 36);
  ctx.fillText(line, canvas.width / 2, boxY + 36);
  ctx.restore();
}


// ==========================================
// ESTADÍSTICAS DE PARTIDA
// ==========================================

// Para recibir todos los registros de todos los dispositivos, pega aquí
// la URL de tu Web App de Google Apps Script. Si queda vacío, los datos
// se guardan únicamente en el dispositivo del jugador.
const STATS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbypUZP7UgahGdYk0ZDBhesSCIoQMjAm5sN60vZosMsEOg6AtfUis7oiW3L6Y33Kzgpf/exec";

let gameStartTime = 0;
let resultSavedForCurrentGame = false;

function createEmptyMatchStats() {
  return {
    collectiblesTotal: 0,
    stars: 0,
    gems: 0,
    crowns: 0,
    powerUpsTotal: 0,
    hearts: 0,
    shields: 0,
    swords: 0,
    scrolls: 0,
    obstaclesPassed: 0,
    hits: 0,
    maxCombo: 1,
    maxSpeed: BASE_SPEED
  };
}

let matchStats = createEmptyMatchStats();

function beginMatchTracking() {
  gameStartTime = Date.now();
  resultSavedForCurrentGame = false;
  matchStats = createEmptyMatchStats();
}

function saveMatchLocally(result) {
  try {
    const key = "levelUpMatchRecords";
    const records = JSON.parse(localStorage.getItem(key) || "[]");
    records.push(result);

    // Evita llenar indefinidamente el almacenamiento local.
    if (records.length > 500) {
      records.splice(0, records.length - 500);
    }

    localStorage.setItem(key, JSON.stringify(records));
  } catch (error) {
    console.warn("No se pudo guardar el registro local:", error);
  }
}

function sendMatchToEndpoint(result) {
  if (!STATS_ENDPOINT) return;

  fetch(STATS_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(result),
    keepalive: true
  }).catch((error) => {
    console.warn("No se pudo enviar la estadística:", error);
  });
}

function askAndSaveMatchResult(baseResult) {
  if (resultSavedForCurrentGame) return;
  resultSavedForCurrentGame = true;

  let playerName = window.prompt("Escribe tu nombre para guardar tu partida:", "");
  if (playerName === null) playerName = "";
  playerName = playerName.trim().slice(0, 30);
  if (!playerName) playerName = "Anónimo";

  let district = window.prompt("Escribe tu número de distrito:", "");
  if (district === null) district = "";
  district = district.trim().slice(0, 10);
  if (!district) district = "Sin distrito";

  const result = {
    ...baseResult,
    playerName,
    district
  };

  saveMatchLocally(result);
  sendMatchToEndpoint(result);

  console.table(result);
}



// ==========================================
// FONDO / PARALLAX
// ==========================================

function drawBackground() {

  // CIELO
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

  // MOVER CAPAS
  if (
    gameStarted &&
    !gameOver &&
    !paused
  ) {
    mountainOffset -= gameSpeed * 0.08;
    forestOffset -= gameSpeed * 0.20;
    treeOffset -= gameSpeed * 0.45;
  }

  // MONTAÑAS
  if (mountainOffset <= -canvas.width) {
    mountainOffset += canvas.width;
  }

  if (
    mountainsImage.complete &&
    mountainsImage.naturalWidth > 0
  ) {
    // Las hacemos llegar hasta la línea del suelo.
    ctx.drawImage(
      mountainsImage,
      mountainOffset,
      145,
      canvas.width,
      groundY - 145
    );

    ctx.drawImage(
      mountainsImage,
      mountainOffset + canvas.width,
      145,
      canvas.width,
      groundY - 145
    );
  }

  // BOSQUE
  if (forestOffset <= -canvas.width) {
    forestOffset += canvas.width;
  }

  if (
    forestImage.complete &&
    forestImage.naturalWidth > 0
  ) {
    // El bosque baja hasta groundY para que no quede
    // una franja de color sólido entre bosque y tierra.
    ctx.drawImage(
      forestImage,
      forestOffset,
      235,
      canvas.width,
      groundY - 235
    );

    ctx.drawImage(
      forestImage,
      forestOffset + canvas.width,
      235,
      canvas.width,
      groundY - 235
    );
  }

  // ÁRBOLES INDIVIDUALES
  const treeSpacing = 420;

  if (treeOffset <= -treeSpacing) {
    treeOffset += treeSpacing;
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
      canvas.height - groundDrawY + 40;


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

  // PERSONAJE GOLPEADO
  if (playerHit) {
    imageToDraw = playerImages.hit;
  }

  // GAME OVER
  else if (gameOver) {
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
    if (!paused) {
      runAnimationTimer++;
    }

    if (runAnimationTimer >= RUN_ANIMATION_SPEED) {
      runFrame++;

      if (runFrame > 1) {
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

function createObstacle(xOffset = 30, forcedPosition = null) {

  let types = [

    // PIEDRA
    {
      type: "rock",
      width: 95,
      height: 80,
      position: "ground"
    },

    // FUEGO
    {
      type: "fire",
      width: 85,
      height: 110,
      position: "ground"
    },

    // SERPIENTE
    {
      type: "snake",
      width: 130,
      height: 75,
      position: "ground"
    },

    // MURO / ESCOMBROS
    {
      type: "wall",
      width: 150,
      height: 105,
      position: "ground"
    }

  ];

  // NIVEL 2+: CUERVO
  if (level >= 2) {
    types.push({
      type: "raven",
      width: 110,
      height: 80,
      position: "air"
    });
  }

  // NIVEL 3+: DIABLO
  if (level >= 3) {
    types.push({
      type: "devil",
      width: 100,
      height: 100,
      position: "air"
    });
  }

  // En niveles altos damos más peso a los obstáculos aéreos.
  if (level >= 10) {
    types.push(
      { type: "raven", width: 110, height: 80, position: "air" },
      { type: "devil", width: 100, height: 100, position: "air" }
    );
  }

  if (level >= 15) {
    types.push(
      { type: "raven", width: 110, height: 80, position: "air" },
      { type: "devil", width: 100, height: 100, position: "air" }
    );
  }

  let availableTypes = types;

  // Permite crear patrones mezclando tierra y aire.
  if (forcedPosition) {
    const filtered = types.filter(
      item => item.position === forcedPosition
    );

    if (filtered.length > 0) {
      availableTypes = filtered;
    }
  }

  const obstacleType =
    availableTypes[
      Math.floor(
        Math.random() * availableTypes.length
      )
    ];

  let y;

  // TERRESTRES
  if (obstacleType.position === "ground") {
    y = groundY - obstacleType.height;
  }

  // AÉREOS CON ALTURAS VARIABLES
  else {
    const airHeights = [
      groundY - 180, // bajo
      groundY - 230, // medio-bajo
      groundY - 280, // medio-alto
      groundY - 335  // alto
    ];

    // Desde nivel 12 se agrega una quinta altura.
    if (level >= 12) {
      airHeights.push(groundY - 380);
    }

    y =
      airHeights[
        Math.floor(
          Math.random() * airHeights.length
        )
      ];
  }

  obstacles.push({
    x: canvas.width + xOffset,
    y: y,
    width: obstacleType.width,
    height: obstacleType.height,
    type: obstacleType.type,
    passed: false
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

  if (obstacleTimer >= nextObstacle) {

    // Obstáculo principal
    createObstacle(30);

    // ==========================================
    // PATRONES DE DIFICULTAD DESDE NIVEL 2
    // ==========================================

    // NIVEL 2+: ya puede salir un segundo obstáculo.
    if (
      level >= 2 &&
      Math.random() < Math.min(0.18 + level * 0.015, 0.44)
    ) {
      const secondPosition =
        Math.random() < 0.58 ? "ground" : "air";

      createObstacle(340, secondPosition);
    }

    // NIVEL 5+: combinaciones tierra + aire más frecuentes.
    if (
      level >= 5 &&
      Math.random() < Math.min(0.14 + level * 0.012, 0.38)
    ) {
      const mixedPosition =
        Math.random() < 0.50 ? "ground" : "air";

      createObstacle(520, mixedPosition);
    }

    // NIVEL 10+: secuencias más agresivas.
    if (
      level >= 10 &&
      Math.random() < Math.min(0.14 + level * 0.009, 0.34)
    ) {
      createObstacle(
        700,
        Math.random() < 0.45 ? "ground" : "air"
      );
    }

    // NIVEL 15+: posibilidad de una secuencia extra.
    if (
      level >= 15 &&
      Math.random() < Math.min(0.09 + (level - 15) * 0.006, 0.22)
    ) {
      createObstacle(
        880,
        Math.random() < 0.45 ? "ground" : "air"
      );
    }

    obstacleTimer = 0;

    // Cada nivel reduce el tiempo entre grupos.
    // Frenesí lo reduce todavía un poco más.
    const frenzyReduction = frenzyActive ? 8 : 0;

    const minDistance =
      Math.max(
        22,
        88 - (level * 4) - frenzyReduction
      );

    const randomExtra =
      Math.max(
        14,
        56 - Math.floor(level * 1.6)
      );

    nextObstacle =
      minDistance +
      Math.floor(
        Math.random() * randomExtra
      );
  }

  for (
    let i = obstacles.length - 1;
    i >= 0;
    i--
  ) {

    const obstacle = obstacles[i];

    obstacle.x -= gameSpeed;

    drawObstacle(obstacle);

    checkCollision(obstacle);

    if (obstacle.destroyed) {
      obstacles.splice(i, 1);
      continue;
    }

    if (
      !obstacle.passed &&
      obstacle.x + obstacle.width < player.x
    ) {
      obstacle.passed = true;
      score += 25;
      matchStats.obstaclesPassed++;
    }

    if (
      obstacle.x + obstacle.width < -20
    ) {
      obstacles.splice(i, 1);
    }
  }
}


// ==========================================
// CREAR COLECCIONABLE
// ==========================================

function createCollectible() {

  const random = Math.random();

  let collectible;

  if (random < 0.60) {
    collectible = {
      type: "star",
      value: 50,
      color: "#FFD700",
      size: 55
    };
  }
  else if (random < 0.90) {
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

  let x = canvas.width + 50;
  let y =
    heights[
      Math.floor(
        Math.random() * heights.length
      )
    ];

  // ==========================================
  // OBJETOS DE RIESGO
  // Desde nivel 2, algunos aparecen sobre/cerca
  // de un obstáculo terrestre y valen más.
  // ==========================================
  let risky = false;

  if (level >= 2 && Math.random() < 0.35) {
    const groundObstacles = obstacles.filter(
      obstacle =>
        obstacle.type !== "raven" &&
        obstacle.type !== "devil" &&
        obstacle.x > canvas.width * 0.55
    );

    if (groundObstacles.length > 0) {
      const obstacle =
        groundObstacles[
          Math.floor(Math.random() * groundObstacles.length)
        ];

      x = obstacle.x + (obstacle.width - collectible.size) / 2;
      y = Math.max(95, obstacle.y - collectible.size - 25);
      risky = true;
    }
  }

  collectibles.push({
    x: x,
    y: y,
    width: collectible.size,
    height: collectible.size,
    type: collectible.type,
    value: risky ? Math.round(collectible.value * 1.5) : collectible.value,
    color: collectible.color,
    risky: risky
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


    if (frenzyActive) {
      nextCollectible =
        65 +
        Math.floor(Math.random() * 55);
    } else {
      nextCollectible =
        130 +
        Math.floor(Math.random() * 110);
    }

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

  playSound(collectSound);

  const frenzyMultiplier =
    frenzyActive ? FRENZY_SCORE_MULTIPLIER : 1;

  score +=
    item.value *
    combo *
    frenzyMultiplier;

  matchStats.collectiblesTotal++;

  if (item.type === "star") matchStats.stars++;
  else if (item.type === "gem") matchStats.gems++;
  else if (item.type === "crown") matchStats.crowns++;

  combo++;

  if (combo > 5) {
    combo = 5;
  }

  matchStats.maxCombo = Math.max(matchStats.maxCombo, combo);
  comboTimer = COMBO_TIME;

  // ==========================================
  // FRENESÍ SOLO DESDE NIVEL 10
  // Antes del nivel 10 no acumulamos racha.
  // ==========================================
  if (level >= 10) {

    collectibleStreak++;

    // 5 coleccionables seguidos = FRENESÍ.
    if (
      collectibleStreak >= FRENZY_TRIGGER &&
      !frenzyActive
    ) {
      frenzyActive = true;
      frenzyTimer = FRENZY_DURATION;
    }

  } else {

    collectibleStreak = 0;
    frenzyActive = false;
    frenzyTimer = 0;

  }
}


// ==========================================
// POWER UPS
// ==========================================

function createPowerUp() {

  const random = Math.random();

  let powerUp;

  // ==========================================
  // NIVELES 1 - 7
  // SIN CORAZONES
  // ==========================================
  if (level < 8) {

    if (random < 0.38) {
      powerUp = {
        type: "shield",
        width: 65,
        height: 70
      };
    }

    else if (random < 0.68) {
      powerUp = {
        type: "sword",
        width: 55,
        height: 85
      };
    }

    else {
      powerUp = {
        type: "scroll",
        width: 75,
        height: 60
      };
    }

  }

  // ==========================================
  // NIVELES 8 - 14
  // CORAZÓN RARO: 5%
  // ==========================================
  else if (level < 15) {

    if (random < 0.05) {
      powerUp = {
        type: "heart",
        width: 60,
        height: 60
      };
    }

    else if (random < 0.35) {
      powerUp = {
        type: "shield",
        width: 65,
        height: 70
      };
    }

    else if (random < 0.62) {
      powerUp = {
        type: "sword",
        width: 55,
        height: 85
      };
    }

    else {
      powerUp = {
        type: "scroll",
        width: 75,
        height: 60
      };
    }

  }

  // ==========================================
  // NIVEL 15+
  // Corazón sigue al 5%, pero escudo y espada
  // son menos frecuentes para mantener dificultad.
  // ==========================================
  else {

    if (random < 0.05) {
      powerUp = {
        type: "heart",
        width: 60,
        height: 60
      };
    }

    else if (random < 0.27) {
      powerUp = {
        type: "shield",
        width: 65,
        height: 70
      };
    }

    else if (random < 0.47) {
      powerUp = {
        type: "sword",
        width: 55,
        height: 85
      };
    }

    else {
      powerUp = {
        type: "scroll",
        width: 75,
        height: 60
      };
    }

  }

  const heights = [
    groundY - 100,
    groundY - 160,
    groundY - 210
  ];

  const y =
    heights[
      Math.floor(
        Math.random() * heights.length
      )
    ];

  powerUps.push({
    x: canvas.width + 50,
    y: y,
    width: powerUp.width,
    height: powerUp.height,
    type: powerUp.type
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

  playSound(collectSound);

  matchStats.powerUpsTotal++;

  if (powerUp.type === "heart") matchStats.hearts++;
  else if (powerUp.type === "shield") matchStats.shields++;
  else if (powerUp.type === "sword") matchStats.swords++;
  else if (powerUp.type === "scroll") matchStats.scrolls++;

  // ❤️ VIDA EXTRA

if (powerUp.type === "heart") {

  if (lives < MAX_LIVES) {
    lives++;
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


    // En niveles altos los power-ups aparecen menos seguido.
    if (level < 10) {
      nextPowerUp =
        1050 +
        Math.floor(Math.random() * 600);
    }
    else if (level < 15) {
      nextPowerUp =
        1200 +
        Math.floor(Math.random() * 700);
    }
    else {
      nextPowerUp =
        1400 +
        Math.floor(Math.random() * 800);
    }

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

  if (combo <= 1) {
    return;
  }

  ctx.save();

  // Debajo de los corazones, lejos del texto bíblico.
  const comboText = "COMBO x" + combo;
  const boxX = 22;
  const boxY = 76;
  const boxWidth = 170;
  const boxHeight = 42;

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "bold 24px monospace";
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;

  ctx.strokeText(comboText, boxX + 12, boxY + boxHeight / 2);
  ctx.fillText(comboText, boxX + 12, boxY + boxHeight / 2);

  ctx.restore();
}



function drawCollectibleCounter() {
  ctx.save();

  // Tres contadores independientes:
  // estrella, gema y corona.
  const boxX = 22;
  const boxY = 124;
  const boxWidth = 178;
  const rowHeight = 40;
  const boxHeight = rowHeight * 3 + 10;

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  const rows = [
    {
      image: collectibleImages.star,
      value: matchStats.stars,
      fallback: "#FFD700"
    },
    {
      image: collectibleImages.gem,
      value: matchStats.gems,
      fallback: "#22D3EE"
    },
    {
      image: collectibleImages.crown,
      value: matchStats.crowns,
      fallback: "#F59E0B"
    }
  ];

  rows.forEach((row, index) => {

    const iconSize = 28;
    const iconX = boxX + 12;
    const iconY =
      boxY +
      7 +
      (index * rowHeight);

    if (
      row.image &&
      row.image.complete &&
      row.image.naturalWidth > 0
    ) {

      ctx.drawImage(
        row.image,
        iconX,
        iconY,
        iconSize,
        iconSize
      );

    } else {

      ctx.fillStyle = row.fallback;
      ctx.beginPath();
      ctx.arc(
        iconX + iconSize / 2,
        iconY + iconSize / 2,
        10,
        0,
        Math.PI * 2
      );
      ctx.fill();

    }

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;

    const countText = "x " + row.value;
    const textX = boxX + 56;
    const textY =
      boxY +
      21 +
      (index * rowHeight);

    ctx.strokeText(countText, textX, textY);
    ctx.fillText(countText, textX, textY);

  });

  ctx.restore();
}

function updateFrenzy() {

  // Frenesí no existe antes del nivel 10.
  if (level < 10) {
    frenzyActive = false;
    frenzyTimer = 0;
    collectibleStreak = 0;
    return;
  }

  if (!frenzyActive) return;

  frenzyTimer--;

  if (frenzyTimer <= 0) {
    frenzyActive = false;
    frenzyTimer = 0;
    collectibleStreak = 0;
  }
}

function drawFrenzy() {
  if (!frenzyActive) return;

  ctx.save();

  const seconds = Math.max(1, Math.ceil(frenzyTimer / 60));
  const text = "🔥 FRENESÍ x2  " + seconds + "s";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 28px monospace";
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 5;

  ctx.strokeText(text, canvas.width / 2, 112);
  ctx.fillText(text, canvas.width / 2, 112);

  ctx.restore();
}


// ==========================================
// COLISIÓN CON OBSTÁCULOS
// ==========================================

function checkCollision(obstacle) {

  // Durante el efecto de golpe no recibe otro daño
  if (playerHit && !gameOver) {
    return;
  }

  const paddingX = 16;
  const paddingY = 12;

  const playerLeft = player.x + paddingX;
  const playerRight =
    player.x + player.width - paddingX;
  const playerTop = player.y + paddingY;
  const playerBottom =
    player.y + player.height - paddingY;

  let obstaclePaddingX = 4;
  let obstaclePaddingY = 4;

  if (
    obstacle.type === "raven" ||
    obstacle.type === "devil"
  ) {
    obstaclePaddingX = 8;
    obstaclePaddingY = 8;
  }

  const obstacleLeft =
    obstacle.x + obstaclePaddingX;
  const obstacleRight =
    obstacle.x +
    obstacle.width -
    obstaclePaddingX;
  const obstacleTop =
    obstacle.y + obstaclePaddingY;
  const obstacleBottom =
    obstacle.y +
    obstacle.height -
    obstaclePaddingY;

  const collision =
    playerRight > obstacleLeft &&
    playerLeft < obstacleRight &&
    playerBottom > obstacleTop &&
    playerTop < obstacleBottom;

  if (!collision) {
    return;
  }

  // ESPADA
  if (swordActive) {
    swordActive = false;
    obstacle.destroyed = true;
    return;
  }

  // ESCUDO
  if (shieldActive) {
    shieldActive = false;
    obstacle.destroyed = true;
    return;
  }

  // GOLPE NORMAL
  matchStats.hits++;
  playSound(hitSound);
  lives--;
  obstacle.destroyed = true;

  playerHit = true;
  playerHitTimer = HIT_DURATION;

  if (lives > 0) {
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

  // Más velocidad en CADA nivel.
  gameSpeed =
    BASE_SPEED +
    ((level - 1) * SPEED_PER_LEVEL) +
    (frenzyActive ? FRENZY_SPEED_BONUS : 0);

  if (gameSpeed > MAX_SPEED) {
    gameSpeed = MAX_SPEED;
  }
}


// ==========================================
// MENSAJE DE NIVEL
// ==========================================

function drawLevelMessage() {

  if (levelMessageTimer <= 0) {
    return;
  }

  ctx.save();

  // ==========================================
  // RECUADRO CENTRADO
  // ==========================================

  const boxWidth = 400;
  const boxHeight = 120;

  const boxX =
    (canvas.width - boxWidth) / 2;

  const boxY = 180;

  ctx.fillStyle =
    "rgba(0, 0, 0, 0.55)";

  ctx.fillRect(
    boxX,
    boxY,
    boxWidth,
    boxHeight
  );


  // ==========================================
  // LEVEL
  // ==========================================

  ctx.textAlign = "center";

  ctx.fillStyle = "#FFD700";

  ctx.font =
    "bold 38px Arial";

  ctx.fillText(
    "LEVEL " + level,
    canvas.width / 2,
    boxY + 50
  );


  // ==========================================
  // NUEVO NIVEL
  // ==========================================

  ctx.font =
    "bold 18px Arial";

  ctx.fillStyle =
    "#FFFFFF";

  ctx.fillText(
    "¡Nuevo nivel!",
    canvas.width / 2,
    boxY + 88
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

  if (gameOver) return;

  stopMusic();
  gameOverSound.currentTime = 0;
  playSound(gameOverSound);

  gameOver = true;
  jumpHeld = false;

  const finalScore = Math.floor(score);
  const previousHighScore = highScore;

  if (finalScore > highScore) {
    highScore = finalScore;
    localStorage.setItem("levelUpHighScore", highScore);
  }

  const endTime = Date.now();
  const durationSeconds = gameStartTime > 0
    ? Math.max(0, Math.round((endTime - gameStartTime) / 1000))
    : 0;

  const result = {
    id: "match_" + endTime + "_" + Math.random().toString(36).slice(2, 8),
    playedAt: new Date(endTime).toISOString(),
    score: finalScore,
    recordBeforeGame: previousHighScore,
    recordAfterGame: highScore,
    isNewRecord: finalScore > previousHighScore,
    levelReached: level,
    durationSeconds,
    livesRemaining: Math.max(0, lives),
    obstaclesPassed: matchStats.obstaclesPassed,
    hits: matchStats.hits,
    collectiblesTotal: matchStats.collectiblesTotal,
    stars: matchStats.stars,
    gems: matchStats.gems,
    crowns: matchStats.crowns,
    powerUpsTotal: matchStats.powerUpsTotal,
    hearts: matchStats.hearts,
    shields: matchStats.shields,
    swords: matchStats.swords,
    scrolls: matchStats.scrolls,
    maxCombo: matchStats.maxCombo,
    maxSpeed: Number(matchStats.maxSpeed.toFixed(2))
  };

  // Permitimos que se dibuje primero la pantalla GAME OVER y luego pedimos
  // únicamente nombre y distrito.
  setTimeout(() => askAndSaveMatchResult(result), 250);
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
  lives = MAX_LIVES;
  shieldActive = false;
  swordActive = false;
  playerHit = false;
  playerHitTimer = 0;


  combo = 1;

  comboTimer = 0;

  collectibleStreak = 0;
  frenzyActive = false;
  frenzyTimer = 0;


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

  bibleMessageTimer = 0;
  currentBibleMessageIndex = Math.floor(Math.random() * biblicalMessages.length);
  beginMatchTracking();

  gameOverSound.pause();
  gameOverSound.currentTime = 0;

  startMusic();

}


// ==========================================
// VIDAS
// ==========================================

function drawLives() {
  const heartSize = 42;
  const spacing = 10;

  if (
    !powerUpImages.heart.complete ||
    powerUpImages.heart.naturalWidth === 0
  ) {
    return;
  }

  for (let i = 0; i < lives; i++) {
    ctx.drawImage(
      powerUpImages.heart,
      25 + i * (heartSize + spacing),
      20,
      heartSize,
      heartSize
    );
  }
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

    140,

    290

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

    175,

    290

  );


  // RÉCORD REAL

  ctx.fillText(

    highScore,

    1100,

    290

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

      startMusic();

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

      startMusic();

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
if (playerHit) {

  playerHitTimer--;

  if (playerHitTimer <= 0) {
    playerHit = false;
  }

}
  // ESCENARIO

  drawBackground();

  drawGround();


  // JUEGO ACTIVO

  if (

    gameStarted &&
    !gameOver &&
    !paused

  ) {

    if (gameStartTime === 0) {
      beginMatchTracking();
    }

    updatePlayer();

    updateObstacles();

    updateCollectibles();

    updatePowerUps();

    updateCombo();
    updateFrenzy();
    updateBibleMessage();


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
    drawLives();
    drawCombo();
    drawCollectibleCounter();
    drawFrenzy();
    drawBibleMessage();

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