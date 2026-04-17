let bg;
let startTime;
let duration = 10000;
let maxLikes = 1000;
let particles = [];
let MAX_PARTICLES = 300;

let bigHeart = { size: 0, alpha: 255, exploding: false };
let state = "bigHeart";

let explosionParticles = [];

function preload() {
    bg = loadImage("image/bg.png");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    textFont('Arial');
    startTime = millis();
}

function draw() {

    if (state === "explode") {

        if (frameCount % 2 === 0) {
            background(255, 200, 200);
        } else {
            background(0);
        }
    } else {
        background(0);
    }
    image(bg, 0, 0, width, height);


    if (state === "bigHeart") {
        fill(255, 0, 0, bigHeart.alpha);
        drawHeart(width / 2, height / 2, bigHeart.size);

        if (!bigHeart.exploding) {
            bigHeart.size += 5;
            if (bigHeart.size >= 150) {
                bigHeart.exploding = true;
                createExplosion(width / 2, height / 2, 30);
            }
        } else {
            bigHeart.alpha -= 10;
            updateExplosion();
            drawExplosion();
            if (bigHeart.alpha <= 0) {
                state = "growing";
                startTime = millis();
            }
        }
        return;
    }

    // ---------------- 点赞增加阶段 ----------------
    if (state === "growing") {
        let elapsed = millis() - startTime;
        let t = constrain(elapsed / (duration * 0.8), 0, 1);
        let currentLikes = floor(maxLikes * pow(t, 2));

        fill(255);
        textSize(80);
        text(`❤️ ${currentLikes}`, width / 2, height / 2);

        if (particles.length < MAX_PARTICLES) {
            let newParticles = min(5, MAX_PARTICLES - particles.length);
            for (let i = 0; i < newParticles; i++) {
                particles.push(new LikeParticle(random(width), height));
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.update();
            p.show();
            if (p.y < -50 || p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        if (elapsed >= duration * 0.8) {
            state = "explode";
            startTime = millis();
        }
        return;
    }

    if (state === "explode") {

        let currentLikes = floor(maxLikes + random(500, 2000));
        fill(255, 50, 50);
        textSize(80 + random(-30, 30));
        text(`❤️ ${currentLikes}`, width / 2 + random(-50, 50), height / 2 + random(-30, 30));

        // 大量爆炸粒子
        if (particles.length < MAX_PARTICLES) {
            let newParticles = min(15, MAX_PARTICLES - particles.length);
            for (let i = 0; i < newParticles; i++) {
                particles.push(new LikeParticle(random(width), random(height / 2, height), true));
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.update();
            p.show();
            if (p.alpha <= 0) particles.splice(i, 1);
        }

        // 彩色粒子额外爆炸
        if (frameCount % 2 === 0) {
            createExplosion(random(width), random(height / 2, height / 1.2), 5);
        }

        updateExplosion();
        drawExplosion();
    }
}

// ----------------- 爱心粒子 -----------------
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