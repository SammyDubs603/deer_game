class Player {
  constructor() {
    this.baseMagSize = 6;
    this.magSize = 6;
    this.ammo = this.magSize;
    this.baseReloadTime = 0.8;
    this.reloadTime = 0.8;
    this.reloadTimer = 0;
    this.reloading = false;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.slowTimeUnlocked = false;
    this.slowTimeCooldown = 10;
    this.slowTimeTimer = 0;
  }

  startReload() {
    if (this.reloading || this.ammo === this.magSize) return;
    this.reloading = true;
    this.reloadTimer = this.reloadTime;
  }

  update(dt) {
    if (this.reloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.reloading = false;
        this.ammo = this.magSize;
      }
    }

    if (this.slowTimeTimer > 0) {
      this.slowTimeTimer -= dt;
    }
  }

  canShoot() {
    return !this.reloading && this.ammo > 0;
  }

  consumeAmmo() {
    this.ammo -= 1;
    this.shotsFired += 1;
    if (this.ammo <= 0) {
      this.startReload();
    }
  }

  applyUpgrade(option) {
    if (option === 1) {
      this.reloadTime = Math.max(0.35, this.reloadTime - 0.15);
    } else if (option === 2) {
      this.magSize += 2;
      this.ammo = Math.min(this.magSize, this.ammo + 2);
    } else if (option === 3) {
      this.slowTimeUnlocked = true;
    }
  }
}

class Deer {
  constructor(game, type, x, y, speed, size, antlerScale = 1) {
    this.game = game;
    this.type = type;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = size * 1.35;
    this.height = size;
    this.antlerScale = antlerScale;
    this.direction = speed >= 0 ? 1 : -1;
    this.alive = true;
  }

  getScoreValue() {
    if (this.type === "golden") return 500;
    if (this.type === "doe") return -200;
    return this.antlerScale > 1.2 ? 150 : 100;
  }

  update(dt) {
    if (!this.alive) return;
    const slowFactor = this.game.slowMotionTimer > 0 ? 0.45 : 1;
    this.x += this.speed * dt * slowFactor;

    if (this.direction > 0 && this.x > this.game.width + this.width + 50) {
      this.alive = false;
    }
    if (this.direction < 0 && this.x < -this.width - 50) {
      this.alive = false;
    }
  }

  containsPoint(px, py) {
    return (
      px >= this.x - this.width / 2 &&
      px <= this.x + this.width / 2 &&
      py >= this.y - this.height / 2 &&
      py <= this.y + this.height / 2
    );
  }

  draw(ctx) {
    if (!this.alive) return;
    const bodyColor = this.type === "golden" ? "#f5cf4f" : this.type === "doe" ? "#b68f68" : "#8d6b4f";
    const neckColor = this.type === "golden" ? "#e0bc43" : "#7b5f47";

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.direction, 1);

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 4, this.width * 0.35, this.height * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = neckColor;
    ctx.fillRect(this.width * 0.18, -this.height * 0.2, this.width * 0.13, this.height * 0.26);
    ctx.beginPath();
    ctx.ellipse(this.width * 0.32, -this.height * 0.16, this.width * 0.12, this.height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2f241c";
    for (const legX of [-this.width * 0.2, -this.width * 0.05, this.width * 0.12, this.width * 0.28]) {
      ctx.fillRect(legX, this.height * 0.16, this.width * 0.055, this.height * 0.35);
    }

    if (this.type !== "doe") {
      ctx.strokeStyle = this.type === "golden" ? "#fff2ba" : "#d8bc8d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const antlerHeight = this.height * 0.22 * this.antlerScale;
      ctx.moveTo(this.width * 0.31, -this.height * 0.22);
      ctx.lineTo(this.width * 0.3, -this.height * 0.22 - antlerHeight);
      ctx.lineTo(this.width * 0.24, -this.height * 0.18 - antlerHeight * 0.6);
      ctx.moveTo(this.width * 0.34, -this.height * 0.22);
      ctx.lineTo(this.width * 0.37, -this.height * 0.24 - antlerHeight);
      ctx.lineTo(this.width * 0.42, -this.height * 0.2 - antlerHeight * 0.65);
      ctx.stroke();
    }

    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 220;
    this.vy = (Math.random() - 0.5) * 220;
    this.life = 0.45;
    this.maxLife = 0.45;
    this.size = 2 + Math.random() * 4;
    this.color = color;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 280 * dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class FloatingText {
  constructor(text, x, y, color = "#ffffff") {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 0.9;
    this.maxLife = 0.9;
  }

  update(dt) {
    this.life -= dt;
    this.y -= 36 * dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = "bold 22px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

class UI {
  constructor(game) {
    this.game = game;
  }

  drawHud(ctx) {
    const g = this.game;
    const p = g.player;

    ctx.save();
    ctx.fillStyle = "rgba(10, 16, 26, 0.55)";
    ctx.fillRect(10, 10, 340, 128);
    ctx.fillStyle = "#eaf2ff";
    ctx.font = "18px Segoe UI";
    ctx.fillText(`Score: ${g.score}`, 20, 36);
    ctx.fillText(`Time: ${Math.ceil(g.timeLeft)}s`, 20, 60);
    ctx.fillText(`Strikes: ${g.strikes}/3`, 20, 84);
    ctx.fillText(`Biome: ${g.currentBiome.name}`, 20, 108);

    ctx.fillText(`Ammo: ${p.ammo}/${p.magSize}`, 190, 36);
    const reloadText = p.reloading ? `Reloading ${Math.max(0, p.reloadTimer).toFixed(1)}s` : "Ready";
    ctx.fillText(reloadText, 190, 60);
    if (p.slowTimeUnlocked) {
      const cd = Math.max(0, p.slowTimeTimer).toFixed(1);
      ctx.fillText(`Slow-hit CD: ${cd}s`, 190, 84);
    }

    if (g.playerName && Math.random() < 0.002) {
      ctx.fillStyle = "#8cf3ff";
      ctx.fillText(`Nice shot, ${g.playerName}!`, g.width / 2 - 80, 32);
    }
    ctx.restore();
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.state = "title";

    this.player = new Player();
    this.ui = new UI(this);

    this.score = 0;
    this.strikes = 0;
    this.timeLeft = 60;
    this.elapsed = 0;
    this.deerList = [];
    this.particles = [];
    this.texts = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.4;
    this.biomeTimer = 0;
    this.currentBiomeIndex = 0;
    this.lastTimestamp = 0;
    this.shakeTimer = 0;
    this.slowMotionTimer = 0;
    this.playerName = "";
    this.upgradeTimer = 15;
    this.upgradePending = false;

    this.mouse = { x: this.width / 2, y: this.height / 2 };

    this.biomes = [
      { name: "Forest", sky: "#6ab3d6", ground: "#4f8a4d", treeA: "#2f5e33", treeB: "#3e6f41", speedFactor: 1 },
      { name: "Meadow", sky: "#99d3ff", ground: "#8ecf70", treeA: "#5f8d4e", treeB: "#76a85f", speedFactor: 1.1 },
      { name: "Snow", sky: "#b8d4ee", ground: "#dbe7ef", treeA: "#7a8997", treeB: "#8f9fb0", speedFactor: 1.2 }
    ];
    this.currentBiome = this.biomes[0];

    this.titleScreen = document.getElementById("titleScreen");
    this.upgradeOverlay = document.getElementById("upgradeOverlay");
    this.gameOverScreen = document.getElementById("gameOverScreen");
    this.finalScoreText = document.getElementById("finalScore");
    this.accuracyText = document.getElementById("accuracy");
    this.highScoreText = document.getElementById("highScore");

    this.registerEvents();
    requestAnimationFrame((t) => this.loop(t));
  }

  registerEvents() {
    const playBtn = document.getElementById("playBtn");
    const playAgainBtn = document.getElementById("playAgainBtn");

    playBtn.addEventListener("click", () => {
      this.playerName = document.getElementById("playerName").value.trim();
      this.startGame();
    });

    playAgainBtn.addEventListener("click", () => {
      this.startGame();
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * this.width;
      this.mouse.y = ((e.clientY - rect.top) / rect.height) * this.height;
    });

    this.canvas.addEventListener("click", () => {
      if (this.state !== "playing" || this.upgradePending) return;
      this.shoot(this.mouse.x, this.mouse.y);
    });

    window.addEventListener("keydown", (e) => {
      if (this.state !== "playing") return;

      if (e.key.toLowerCase() === "r") {
        this.player.startReload();
      }

      if (this.upgradePending) {
        const key = Number(e.key);
        if ([1, 2, 3].includes(key)) {
          this.player.applyUpgrade(key);
          this.upgradePending = false;
          this.toggleOverlay(this.upgradeOverlay, false);
        }
      }
    });
  }

  resetRun() {
    this.player = new Player();
    this.score = 0;
    this.strikes = 0;
    this.timeLeft = 60;
    this.elapsed = 0;
    this.deerList = [];
    this.particles = [];
    this.texts = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.4;
    this.biomeTimer = 0;
    this.currentBiomeIndex = 0;
    this.currentBiome = this.biomes[0];
    this.shakeTimer = 0;
    this.slowMotionTimer = 0;
    this.upgradeTimer = 15;
    this.upgradePending = false;
  }

  startGame() {
    this.resetRun();
    this.state = "playing";
    this.toggleOverlay(this.titleScreen, false);
    this.toggleOverlay(this.gameOverScreen, false);
    this.toggleOverlay(this.upgradeOverlay, false);
  }

  endGame() {
    this.state = "gameover";
    const accuracy = this.player.shotsFired ? Math.round((this.player.shotsHit / this.player.shotsFired) * 100) : 0;
    const highScore = Math.max(this.score, Number(localStorage.getItem("buckBlitzHighScore") || 0));
    localStorage.setItem("buckBlitzHighScore", String(highScore));

    this.finalScoreText.textContent = `Final Score: ${this.score}`;
    this.accuracyText.textContent = `Accuracy: ${accuracy}% (${this.player.shotsHit}/${this.player.shotsFired})`;
    this.highScoreText.textContent = `High Score: ${highScore}`;
    this.toggleOverlay(this.gameOverScreen, true);
  }

  toggleOverlay(node, visible) {
    node.classList.toggle("visible", visible);
  }

  shoot(x, y) {
    if (!this.player.canShoot()) return;

    this.player.consumeAmmo();
    this.shakeTimer = 0.12;

    let hit = false;
    for (let i = this.deerList.length - 1; i >= 0; i -= 1) {
      const deer = this.deerList[i];
      if (deer.alive && deer.containsPoint(x, y)) {
        deer.alive = false;
        hit = true;
        this.player.shotsHit += 1;
        const points = deer.getScoreValue();
        this.score += points;

        const color = points > 0 ? "#8dffae" : "#ff8f8f";
        const text = points > 0 ? `+${points}` : `${points}`;
        this.texts.push(new FloatingText(text, x, y - 8, color));
        this.spawnBurst(x, y, points > 0 ? "#ffe28c" : "#ffc2a1", 18);

        if (deer.type === "doe") {
          this.strikes += 1;
        }

        if (this.player.slowTimeUnlocked && this.player.slowTimeTimer <= 0 && points > 0) {
          this.slowMotionTimer = 2;
          this.player.slowTimeTimer = this.player.slowTimeCooldown;
          this.texts.push(new FloatingText("SLOW TIME!", x, y - 26, "#8ce7ff"));
        }
        break;
      }
    }

    if (!hit) {
      this.score -= 25;
      this.texts.push(new FloatingText("-25", x, y, "#ffb18a"));
    }

    if (this.strikes >= 3) {
      this.endGame();
    }
  }

  spawnBurst(x, y, color, amount) {
    for (let i = 0; i < amount; i += 1) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  spawnDeer() {
    const progress = 1 - this.timeLeft / 60;
    const biomeFactor = this.currentBiome.speedFactor;
    const minSpeed = 130 + progress * 120;
    const maxSpeed = 190 + progress * 180;

    const laneY = [286, 330, 378, 430][Math.floor(Math.random() * 4)] + (Math.random() - 0.5) * 8;
    const direction = Math.random() < 0.5 ? 1 : -1;

    const golden = Math.random() < 0.02;
    const doe = !golden && Math.random() < 0.33;
    const type = golden ? "golden" : doe ? "doe" : "buck";

    const antlerScale = type === "buck" ? 0.9 + Math.random() * 0.8 : 1;
    const size = type === "golden" ? 42 : 46 + Math.random() * 14;
    const speed = (minSpeed + Math.random() * (maxSpeed - minSpeed)) * biomeFactor * (golden ? 1.35 : 1) * direction;

    const startX = direction > 0 ? -80 : this.width + 80;
    this.deerList.push(new Deer(this, type, startX, laneY, speed, size, antlerScale));
  }

  update(dt) {
    if (this.state !== "playing") return;

    if (!this.upgradePending) {
      this.timeLeft -= dt;
      this.elapsed += dt;
      this.biomeTimer += dt;
      this.upgradeTimer -= dt;

      if (this.upgradeTimer <= 0) {
        this.upgradePending = true;
        this.upgradeTimer = 15;
        this.toggleOverlay(this.upgradeOverlay, true);
      }
    }

    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.endGame();
      return;
    }

    if (this.biomeTimer >= 20) {
      this.biomeTimer = 0;
      this.currentBiomeIndex = (this.currentBiomeIndex + 1) % this.biomes.length;
      this.currentBiome = this.biomes[this.currentBiomeIndex];
    }

    this.player.update(dt);

    this.spawnInterval = Math.max(0.38, 1.4 - this.elapsed * 0.012);
    if (!this.upgradePending) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnDeer();
      }
    }

    for (const deer of this.deerList) deer.update(dt);
    for (const p of this.particles) p.update(dt);
    for (const t of this.texts) t.update(dt);

    this.deerList = this.deerList.filter((d) => d.alive);
    this.particles = this.particles.filter((p) => p.life > 0);
    this.texts = this.texts.filter((t) => t.life > 0);

    if (this.shakeTimer > 0) this.shakeTimer -= dt;
    if (this.slowMotionTimer > 0) this.slowMotionTimer -= dt;
  }

  drawBackground(ctx) {
    const b = this.currentBiome;
    ctx.fillStyle = b.sky;
    ctx.fillRect(0, 0, this.width, this.height);

    const offset = (this.elapsed * 12) % this.width;

    const drawTreeLayer = (yBase, color, speedScale, sizeMin, sizeMax) => {
      ctx.fillStyle = color;
      for (let x = -80; x < this.width + 120; x += 60) {
        const px = ((x - offset * speedScale) % (this.width + 120)) - 60;
        const h = sizeMin + ((x * 7) % (sizeMax - sizeMin));
        ctx.beginPath();
        ctx.moveTo(px, yBase);
        ctx.lineTo(px + 24, yBase - h);
        ctx.lineTo(px + 48, yBase);
        ctx.closePath();
        ctx.fill();
      }
    };

    drawTreeLayer(220, b.treeA, 0.22, 55, 85);
    drawTreeLayer(255, b.treeB, 0.45, 40, 70);

    ctx.fillStyle = b.ground;
    ctx.fillRect(0, 255, this.width, this.height - 255);

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < 6; i += 1) {
      ctx.fillRect(i * 170 + ((offset * 0.8) % 170), 275 + (i % 2) * 30, 36, 4);
    }
  }

  drawCrosshair(ctx) {
    const { x, y } = this.mouse;
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.moveTo(x - 22, y);
    ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y + 22);
    ctx.stroke();
    ctx.restore();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.shakeTimer > 0) {
      const intensity = this.shakeTimer * 6;
      ctx.save();
      ctx.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
    }

    this.drawBackground(ctx);

    for (const deer of this.deerList) deer.draw(ctx);
    for (const p of this.particles) p.draw(ctx);
    for (const t of this.texts) t.draw(ctx);

    if (this.shakeTimer > 0) ctx.restore();

    if (this.state === "playing") {
      this.ui.drawHud(ctx);
      this.drawCrosshair(ctx);
    }
  }

  loop(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const rawDt = (timestamp - this.lastTimestamp) / 1000;
    const dt = Math.min(rawDt, 0.033);
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }
}

const canvas = document.getElementById("gameCanvas");
const game = new Game(canvas);
window.buckBlitzGame = game;
