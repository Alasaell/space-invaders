var difficulty;
var score;
var time;
var canvas;
var ctx;

var enemies;
var maxHostileProjectiles;
var enemyShotDelay;
var hostileProjectiles;
var player;
var counter;
var projectiles;

var count;
var enemyV;
var gameOver;

window.onload = function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  init(false);
  setInterval(() => {
    game();
  }, 1000/60);

  document.addEventListener("keydown", (event) => {
    handleKeyDown(event);
  });
  document.addEventListener("keyup", (event) => {
    handleKeyUp(event);
  });
}

function run() {
  if (!canvas) {
    canvas = document.createElement("CANVAS");
    ctx = canvas.getContext("2d");
    canvas.width = 680;
    canvas.height = 400;
    canvas.style = "position: fixed; top: 5px; left: 5px; opacity: .8; z-index: 10000";
    document.body.appendChild(canvas);
    init(false);
    setInterval(() => {
      game();
    }, 1000/60);

    document.addEventListener("keydown", (event) => {
      handleKeyDown(event);
    });
    document.addEventListener("keyup", (event) => {
      handleKeyUp(event);
    });
  }
}

function game() {
  count++;

  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "grey";
  ctx.fillRect(500, 0, 1, canvas.height);

  drawUI();

  drawPlayer();
  projectileHandler();
  handleEnemies();
  if(count > 50) {
    enemyV = enemyV === .2 ? -.2 : .2;
    count = 0;
  }

  score[difficulty] = (counter.shotsHit * (difficulty+1)) + (player.ammo * (difficulty+1) / 10) + (player.hp * (difficulty+1) * 100);

  gameOver = enemies.length === 0 || player.hp === 0;
  if (gameOver) {
    player.vel = 0;
    drawGameOverScreen();
  }
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, .8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "62px VT323";
  ctx.textAlign = "center";
  let text1 = player.hp > 0 ? "VICTORY!" : "GAME OVER!";
  let text2 = player.hp > 0 ? "PRESS 'R' TO CONTINUE" : "PRESS 'R' TO RESTART";
  let text3 = player.hp > 0 ? "CURRENT SCORE: " : "FINAL SCORE:";
  ctx.fillText(text1, 340, 110);

  ctx.fillText(text3, 340, 180);
  ctx.fillText(getScoreSum(), 340, 230);

  ctx.fillText(text2, 340, 310);
}

function drawPlayer() {
  if (player.hp > 0) {
    player.x+=player.vel;
    if (player.x - 28 <= 0) {
      player.x = 28;
    } else if (player.x + 27 >= 500) {
      player.x = 500 - 27;
    }
    ctx.fillStyle = player.color[player.hp - 1];
    ctx.fillRect(player.x - 8, player.y, 16, 16);
    ctx.fillRect(player.x - 24, player.y + 16, 48, 16);
  }
}

function handleKeyDown(evt) {
  switch(evt.keyCode) {
    case 32:
      if (!gameOver) {
        shoot();
      }
      break;
    case 37:
      if (!gameOver) {
        player.vel = -3;
      }
      break;
    case 39:
      if (!gameOver) {
        player.vel = 3;
      }
      break;
    case 82:
      if (gameOver) {
        init(player.hp > 0);
      }
      break;
  }
}

function handleKeyUp(evt) {
  switch(evt.keyCode) {
    case 37:
      if (!gameOver && player.vel === -3) {
        player.vel = 0;
      }
      break;
    case 39:
    if (!gameOver && player.vel === 3) {
      player.vel = 0;
    }
      break;
  }
}

function shoot () {
  if (player.ammo > 0) {
    projectiles.push({x: player.x, y: player.y - 5});
    counter.shotsFired++;
    player.ammo--;
  }
}

function enemyShoot(enemy) {
  if (hostileProjectiles.length <= maxHostileProjectiles) {
    hostileProjectiles.push({x: enemy.x, y: enemy.y});
  }
}

function projectileHandler() {
  projectiles.forEach((projectile) => {

    ctx.fillStyle = "yellow";
    ctx.fillRect(projectile.x - 1, projectile.y, 3, 5);

    hostileProjectiles.forEach((eP) =>{
      if (projectile.x+2 >= eP.x-3
        && projectile.x-2 <= eP.x+3
        && projectile.y <= eP.y+6
        && projectile.y+4 >= eP.y) {
        //counter.shotsHit++;
        projectiles.splice(projectiles.indexOf(projectile), 1);
        hostileProjectiles.splice(hostileProjectiles.indexOf(eP), 1);
        return;
      }
    })

    if (!gameOver) {
      enemies.forEach((e) => {
        if (projectile.x >= e.x - 16
          && projectile.x <= e.x + 17
          && projectile.y <= e.y
          && projectile.y >= e.y - 24) {
          counter.shotsHit++;
          projectiles.splice(projectiles.indexOf(projectile), 1);
          e.hp--;
          if (e.hp === 0) {
            enemies.splice(enemies.indexOf(e), 1);
          }
          return;
        }
      });
    }

    projectile.y -= 2;

    if (projectile.y + 5 < 0) {
      projectiles.splice(projectiles.indexOf(projectile), 1);
    }
  });
  hostileProjectiles.forEach((projectile) => {
    ctx.fillStyle = "blue";
    ctx.fillRect(projectile.x - 1, projectile.y, 3, 7);
    ctx.fillRect(projectile.x - 2, projectile.y + 1, 5, 5);
    ctx.fillRect(projectile.x - 3, projectile.y + 2, 7, 3);

    if (!gameOver && player.hp > 0 && hitsPlayer(projectile)) {
      player.hp--;
      hostileProjectiles.splice(hostileProjectiles.indexOf(projectile), 1);
    }

    projectile.y += 1;

    if (projectile.y > 400) {
      hostileProjectiles.splice(hostileProjectiles.indexOf(projectile), 1);
    }
  });
}

function hitsPlayer(p) {
  return (p.x+3 >= player.x-8 && p.x-3 <= player.x+7
          && p.y+6 >= player.y && p.y <= player.y+16) ||
          (p.x+3 >= player.x-24 && p.x-3 <= player.x+23
            && p.y+6 >= player.y+16 && p.y <= player.y+32);
}

function handleEnemies() {
  enemies.forEach((enemy) => {
    enemy.x += enemyV;
    drawEnemy(enemy);
    if (Math.random() > enemyShotDelay) {
      enemyShoot(enemy);
    }
  });
}

function drawEnemy(enemy) {
  ctx.fillStyle=enemy.color[enemy.hp - 1];
  // row 1
  ctx.fillRect(enemy.x - 7, enemy.y - 3, 6, 3);
  ctx.fillRect(enemy.x + 2, enemy.y - 3, 6, 3);
  // row 2
  ctx.fillRect(enemy.x - 10, enemy.y - 6, 3, 3);
  ctx.fillRect(enemy.x - 16, enemy.y - 6, 3, 3);
  ctx.fillRect(enemy.x + 8, enemy.y - 6, 3, 3);
  ctx.fillRect(enemy.x + 14, enemy.y - 6, 3, 3);
  // row 3
  ctx.fillRect(enemy.x - 10, enemy.y - 9, 21, 3);
  ctx.fillRect(enemy.x - 16, enemy.y - 9, 3, 3);
  ctx.fillRect(enemy.x + 14, enemy.y - 9, 3, 3);
  // row 4
  ctx.fillRect(enemy.x - 16, enemy.y - 12, 33, 3);
  // row 5
  ctx.fillRect(enemy.x - 4, enemy.y - 15, 9, 3);
  ctx.fillRect(enemy.x - 13, enemy.y - 15, 6, 3);
  ctx.fillRect(enemy.x + 8, enemy.y - 15, 6, 3);
  // row 6
  ctx.fillRect(enemy.x - 10, enemy.y - 18, 21, 3);
  // row 7
  ctx.fillRect(enemy.x - 7, enemy.y - 21, 3, 3);
  ctx.fillRect(enemy.x + 5, enemy.y - 21, 3, 3);
  // row 8
  ctx.fillRect(enemy.x - 10, enemy.y - 24, 3, 3);
  ctx.fillRect(enemy.x + 8, enemy.y - 24, 3, 3);
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "32px VT323";
  ctx.textAlign = "left";
  ctx.fillText("STAGE:", 530, 30);
  ctx.textAlign = "right";
  ctx.fillText("" + (difficulty+1), 650, 30);

  ctx.font = "24px VT323";
  ctx.textAlign = "left";
  ctx.fillText("ALIENS:", 530, 70);
  ctx.fillText("AMMO:", 530, 100);
  ctx.fillText("HITS:", 530, 130);
  ctx.fillText("TIME:", 530, 160);
  ctx.textAlign = "right";
  ctx.fillText("" + enemies.length, 650, 70);
  ctx.fillText("" + player.ammo, 650, 100);
  ctx.fillText("" + counter.shotsHit, 650, 130);
  ctx.fillText(`${getTotalTime()}s`, 650, 160);
  ctx.textAlign = "center"
  ctx.fillText("SCORE", 590, 200);
  ctx.fillText(`${getScoreSum()}`, 590, 230, 120);
}

function getTotalTime() {
  return Math.floor((new Date().getTime() - time.getTime())/1000);
}

function getScoreSum() {
  let scoreSum = 0;
  score.forEach((s) => {
    scoreSum += s;
  });
  return Math.floor(scoreSum);
}

function init(advance) {
  difficulty = advance ? difficulty + 1 : 0;
  if (!advance) {
    time = new Date();
    score = [0];
  } else {
    score.push(0);
  }
  enemies = [];
  enemyShotDelay = .9995 - (difficulty * .0005);
  maxHostileProjectiles = 255 + (difficulty * 5);
  hostileProjectiles = [];
  let enemyXOffset = 50;
  let enemyYOffset = 30;
  for (let i = 0; i < (4 + Math.min((Math.floor(difficulty / 3)), 3)); i++) {
    for (let j = 0; j < 9; j++) {
      enemies.push({
        x: 30 + (enemyXOffset * j) + (30 * (i % 2)),
        y: 50 + (enemyYOffset * i),
        color: ["red", "yellow", "green", "cyan", "purple", "pink"],
        hp: 2 + Math.min(4, (Math.floor(difficulty / 2)))
      });
    }
  }
  player = {
    x: 250,
    y: 365,
    vel: 0,
    ammo: 255 + (difficulty * 42),
    color: ["red", "yellow", "green", "cyan", "purple"],
    hp: 3 + Math.min(2, Math.floor(difficulty/3))
  }
  counter = {
    shotsFired: 0,
    shotsHit: 0
  }
  projectiles = [];

  count = 0;
  enemyV = .2;
  gameOver = false;
}
