// ===============================
// GLOBAL VARIABLES
// ===============================
// background image (currently loaded but not used in draw)
let bg;

// timing control for animation phases
let startTime;
let duration = 10000; // 10 seconds growth phase

// simulated social media metric (likes)
let maxLikes = 1000;

// particle systems
let particles = []; // main floating hearts
let explosionParticles = []; // burst / chaos particles

// performance limits (avoid lag)
let MAX_PARTICLES = 300;
let MAX_EXPLOSION = 200;

// system state machine (controls animation flow)
let state = "bigHeart";

// initial heart animation object
let bigHeart = {
    size: 0,        // growing size
    alpha: 255,     // fade out value
    exploding: false // trigger explosion flag
};

// ===============================
// PRELOAD
// ===============================
function preload() {
    // load background image (optional
    bg = loadImage("image/bg.png");
}

// ===============================
// SETUP
// ===============================
function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    imageMode(CENTER);
    textFont("Arial");
    startTime = millis();
}

// ===============================
// DRAW LOOP
// ===============================
function draw() {
    background(10, 10, 20);

    // ===========================
    // STAGE 1: BIG HEART
    // ===========================
    if (state === "bigHeart") {
        let cx = width / 2;
        let cy = height / 2;

        // heart grow
        if (!bigHeart.exploding) {
            bigHeart.size += 4;

            fill(255, 50, 80);
            noStroke();
            textSize(bigHeart.size);
            text("❤️", cx, cy);

            if (bigHeart.size >= 160) {
                bigHeart.exploding = true;
                createExplosion(cx, cy, 40);
            }

        } else {
            bigHeart.alpha -= 8;

            updateExplosion();
            drawExplosion();

            if (bigHeart.alpha <= 0) {
                state = "growing";
                startTime = millis();
            }
        }

        return;
    }

    // ===========================
    // STAGE 2: GROWING
    // ===========================
    if (state === "growing") {

        let elapsed = millis() - startTime;
        let t = constrain(elapsed / duration, 0, 1);

        let currentLikes = floor(maxLikes * pow(t, 2));
        currentLikes = lerp(currentLikes, currentLikes + random(-5, 5), 0.1);

        fill(255);
        textSize(70);
        text(`❤️ ${floor(currentLikes)}`, width / 2, height / 2);

        spawnParticles(5, false);
        updateParticles(false);

        if (elapsed > duration) {
            state = "explode";
        }

        return;
    }

    // ===========================
    // STAGE 3: EXPLODE
    // ===========================
    if (state === "explode") {

        let currentLikes = floor(maxLikes + random(300, 1500));

        fill(255, 80, 80);
        textSize(80);
        text(`❤️ ${currentLikes}`, width / 2, height / 2);

        spawnParticles(25, true);
        updateParticles(true);

        if (frameCount % 2 === 0) {
            createExplosion(random(width), random(height), 4);
        }

        updateExplosion();
        drawExplosion();
    }
}

// ===============================
// PARTICLES
// ===============================
class LikeParticle {
    constructor(x, y, explode = false) {
        this.x = x;
        this.y = y;
        this.size = random(14, 28);
        this.explode = explode;

        this.vx = explode ? random(-8, 8) : random(-1, 1);
        this.vy = explode ? random(2, 8) : random(1, 3);

        this.alpha = 255;
    }

    update() {
        this.x += this.vx;
        this.y -= this.vy;
        this.alpha -= 2;
    }

    show() {
        fill(255, 0, 80, this.alpha);
        noStroke();
        textSize(this.size);

        push();
        translate(this.x, this.y);
        rotate(random(-0.2, 0.2));
        text("❤️", 0, 0);
        pop();
    }
}

// ===============================
// PARTICLE SYSTEM HELPERS
// ===============================
function spawnParticles(amount, explode) {
    if (particles.length < MAX_PARTICLES) {
        for (let i = 0; i < amount; i++) {
            particles.push(new LikeParticle(
                random(width),
                height,
                explode
            ));
        }
    }
}

function updateParticles(explode) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.show();

        if (p.alpha <= 0 || p.y < -50) {
            particles.splice(i, 1);
        }
    }
}

// ===============================
// EXPLOSION SYSTEM
// ===============================
function createExplosion(x, y, count) {
    for (let i = 0; i < count; i++) {
        if (explosionParticles.length < MAX_EXPLOSION) {
            explosionParticles.push({
                x,
                y,
                vx: random(-12, 12),
                vy: random(-12, 12),
                size: random(4, 12),
                alpha: 255
            });
        }
    }
}

function updateExplosion() {
    for (let p of explosionParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 6;
    }

    explosionParticles = explosionParticles.filter(p => p.alpha > 0);
}

function drawExplosion() {
    noStroke();

    for (let p of explosionParticles) {
        fill(255, 100, 150, p.alpha);
        ellipse(p.x, p.y, p.size);
    }
}

// ===============================
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}