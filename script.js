let bg;
let startTime;
let duration = 10000;
let maxLikes = 1000;
let particles = [];
let MAX_PARTICLES = 300;

let bigHeart = { size: 0, alpha: 255, exploding: false };
let state = "bigHeart";

let explosionParticles = [];

let clickExplosions = [];

function preload() {
    bg = loadImage("image/bg.png");
}

function mousePressed() {
    let count = random(20, 60);
    createExplosion(mouseX, mouseY, count);
}

function draw() {
    clear();


    // Increase heart size over time
    if (!bigHeart.exploding) {
        bigHeart.size += 5;

        // Trigger explosion when reaching threshold
        if (bigHeart.size >= 150) {
            bigHeart.exploding = true;
            createExplosion(width / 2, height / 2, 30);
        }

    } else {

        // Fade out heart and update explosion particles
        bigHeart.alpha -= 10;

        updateExplosion();
        drawExplosion();

        // Switch to next state when fully faded
        if (bigHeart.alpha <= 0) {
            state = "growing";
            startTime = millis();
        }
    }

    return;
}

// =====  Growing likes stage =====
if (state === "growing") {

    // Calculate animation progress
    let elapsed = millis() - startTime;
    let t = constrain(elapsed / (duration * 0.8), 0, 1);

    // Simulated like counter (easing effect)
    let currentLikes = floor(maxLikes * pow(t, 2));

    fill(255);
    textSize(80);
    text(`❤️ ${currentLikes}`, width / 2, height / 2);

    // Spawn floating heart particles
    if (particles.length < MAX_PARTICLES) {
        for (let i = 0; i < 5; i++) {
            particles.push(new LikeParticle(random(width), height));
        }
    }

    // Update and remove particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.show();

        if (p.y < -50 || p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    // Transition to explosion stage
    if (elapsed >= duration * 0.8) {
        state = "explode";
        startTime = millis();
    }

    return;
}

// ===== 4. Explosion stage =====
if (state === "explode") {

    // Randomized like count for chaos effect
    let currentLikes = floor(maxLikes + random(500, 2000));

    fill(255, 50, 50);
    textSize(80 + random(-30, 30));

    text(
        `❤️ ${currentLikes}`,
        width / 2 + random(-50, 50),
        height / 2 + random(-30, 30)
    );

    // Spawn more intense particles
    if (particles.length < MAX_PARTICLES) {
        for (let i = 0; i < 15; i++) {
            particles.push(
                new LikeParticle(
                    random(width),
                    random(height / 2, height),
                    true
                )
            );
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.show();

        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    // Random explosion bursts
    if (frameCount % 2 === 0) {
        createExplosion(
            random(width),
            random(height / 2, height / 1.2),
            5
        );
    }

    updateExplosion();
    drawExplosion();
}

class LikeParticle {
    constructor(x, y, explode = false) {
        this.x = x;
        this.y = y;
        this.size = random(15, 30);
        this.speedY = explode ? random(2, 10) : random(1, 3);
        this.speedX = explode ? random(-10, 10) : random(-1, 1);
        this.alpha = 255;
        this.explode = explode;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.alpha -= 3;
    }

    show() {
        fill(255, 0, 0, this.alpha);
        noStroke();
        textSize(this.size);
        push();
        translate(this.x, this.y);
        rotate(random(-0.5, 0.5));
        text("❤️", 0, 0);
        pop();
    }
}


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
    explosionParticles = explosionParticles.filter(p => p.alpha > 0);
}

function drawExplosion() {
    noStroke();
    for (let p of explosionParticles) {
        fill(p.color[0], p.color[1], p.color[2], p.alpha);
        ellipse(p.x, p.y, p.size);
    }
}


function drawHeart(x, y, size) {
    beginShape();
    vertex(x, y);
    bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
    bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
    endShape(CLOSE);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}