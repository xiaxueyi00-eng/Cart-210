// ===============================
// GLOBAL VARIABLES
// ==============================

let bg; // background image
let startTime; // timer for animation stages
let duration = 10000; // duration of growing stage (ms)
let maxLikes = 1000; // max value for simulated likes

let particles = []; // main floating like particles
let MAX_PARTICLES = 400; // limit to avoid performance overload

// big heart animation state
let bigHeart = { size: 0, alpha: 255, exploding: false };

// system state controller (controls animation phases)
let state = "bigHeart";

// explosion particles (separate FX system)
let explosionParticles = [];


// ===============================
// LOAD ASSETS
// ===============================
function preload() {
    bg = loadImage("image/bg.png");
}

// ===============================
// SETUP
// ===============================
function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    textAlign(CENTER, CENTER);
    imageMode(CENTER);
    textFont('Arial');
    startTime = millis();
}
// ===============================
// MAIN LOOP
// ===============================
function draw() {
    clear();
    // ===== Big Heart Stage =====
    if (state === "bigHeart") {

        // center anchor (IMPORTANT FIX)
        let cx = width / 2;
        let cy = height / 2;
        // grow heart
        if (!bigHeart.exploding) {
            bigHeart.size += 5;
            // trigger explosion when reaching threshold
            if (bigHeart.size >= 150) {
                bigHeart.exploding = true;
                createExplosion(cx, cy, 30);
            }

        } else {
            // fade out heart
            bigHeart.alpha -= 10;
            // update explosion effect
            updateExplosion();
            drawExplosion();
            // transition to next stage
            if (bigHeart.alpha <= 0) {
                state = "growing";
                startTime = millis();
            }
        }

        return;
    }

    // ===========================
    // STAGE 2: GROWING LIKES
    // ===========================
    if (state === "growing") {

        let elapsed = millis() - startTime;

        // normalized time (0 → 1)
        let t = constrain(elapsed / (duration * 0.8), 0, 1);

        // exponential growth of likes
        let currentLikes = floor(maxLikes * pow(t, 2));

        // display like counter
        fill(255);
        textSize(80);
        text(`❤️ ${currentLikes}`, width / 2, height / 2);

        // generate floating particles
        if (particles.length < MAX_PARTICLES) {
            for (let i = 0; i < 10; i++) {
                particles.push(new LikeParticle(random(width), height));
            }
        }

        // update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.update();
            p.show();

            // remove off-screen or faded particles
            if (p.y < -50 || p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // switch to explosion stage
        if (elapsed >= duration * 0.8) {
            state = "explode";
            startTime = millis();
        }

        return;
    }


    // ===========================
    // STAGE 3: EXPLOSION MODE
    // ===========================
    if (state === "explode") {

        // unstable like value (simulated viral spike)
        let currentLikes = floor(maxLikes + random(500, 2000));

        fill(255, 50, 50);
        textSize(80);
        text(`❤️ ${currentLikes}`, width / 2, height / 2);

        // intense particle burst
        if (particles.length < MAX_PARTICLES) {
            for (let i = 0; i < 30; i++) {
                particles.push(
                    new LikeParticle(
                        random(width),
                        random(height / 2, height),
                        true
                    )
                );
            }
        }

        // update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.update();
            p.show();

            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // continuous explosion FX (high frequency)
        if (frameCount % 1 === 0) {
            createExplosion(
                random(width),
                random(height / 2, height),
                5
            );
        }

        updateExplosion();
        drawExplosion();
    }
}


// ===============================
// PARTICLE CLASS (LIKE SYSTEM)
// ===============================
class LikeParticle {
    constructor(x, y, explode = false) {
        this.x = x;
        this.y = y;

        this.size = random(15, 30);

        // movement behavior depends on mode
        this.speedY = explode ? random(2, 10) : random(1, 3);
        this.speedX = explode ? random(-10, 10) : random(-1, 1);

        this.alpha = 255;
        this.explode = explode;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        // fade out over time
        this.alpha -= 3;
    }

    show() {
        fill(255, 0, 0, this.alpha);
        noStroke();

        textSize(this.size);

        push();
        translate(this.x, this.y);

        // slight random rotation for organic motion
        rotate(random(-0.5, 0.5));

        text("❤️", 0, 0);
        pop();
    }
}


// ===============================
// EXPLOSION SYSTEM
// ===============================
function createExplosion(x, y, count) {
    for (let i = 0; i < count; i++) {
        explosionParticles.push({
            x: x,
            y: y,
            vx: random(-15, 15),
            vy: random(-15, 15),
            size: random(5, 15),
            alpha: 255,
            color: [random(200, 255), random(50, 150), random(50, 150)]
        });
    }
}

function updateExplosion() {
    for (let p of explosionParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 5;
    }

    // remove faded particles
    explosionParticles = explosionParticles.filter(p => p.alpha > 0);
}

function drawExplosion() {
    noStroke();

    for (let p of explosionParticles) {
        fill(p.color[0], p.color[1], p.color[2], p.alpha);
        ellipse(p.x, p.y, p.size);
    }
}


// ===============================
// RESIZE HANDLING
// ===============================
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}