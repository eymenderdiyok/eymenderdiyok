/**
 * NEON OVERDRIVE - Advanced HTML5 Racing Engine
 * Version: 1.0.4 - ES2024
 */

"use strict";

// --- CONFIGURATION & CONSTANTS ---
const CONFIG = {
    FPS: 60,
    LANES: 3,
    ROAD_WIDTH: 2000,
    SEGMENT_LENGTH: 200,
    RUMBLE_LENGTH: 3,
    CAMERA_HEIGHT: 1000,
    CAMERA_DEPTH: 0.84, // Field of view equivalent
    DRAW_DISTANCE: 300,
    FOG_DENSITY: 5,
    PLAYER_Z_OFFSET: 600,
    MAX_SPEED: 25000,
    ACCEL: 8000,
    BREAKING: -15000,
    OFF_ROAD_DECEL: -10000,
    OFF_ROAD_LIMIT: 5000,
    CENTRIFUGAL: 0.3,
    FRICTION: 0.98,
    DIFFICULTY: {
        EASY:   { aiSpeed: 0.85, aiAggr: 0.2, grip: 1.2 },
        NORMAL: { aiSpeed: 1.00, aiAggr: 0.5, grip: 1.0 },
        HARD:   { aiSpeed: 1.20, aiAggr: 0.9, grip: 0.8 }
    }
};

// --- MATH UTILS ---
const MathUtils = {
    limit: (value, min, max) => Math.max(min, Math.min(value, max)),
    interpolate: (a, b, percent) => a + (b - a) * percent,
    easeIn: (a, b, percent) => a + (b - a) * Math.pow(percent, 2),
    easeOut: (a, b, percent) => a + (b - a) * (1 - Math.pow(1 - percent, 2)),
    easeInOut: (a, b, percent) => a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5),
    project: (p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) => {
        p.camera.x     = (p.world.x || 0) - cameraX;
        p.camera.y     = (p.world.y || 0) - cameraY;
        p.camera.z     = (p.world.z || 0) - cameraZ;
        p.screen.scale = cameraDepth / p.camera.z;
        p.screen.x     = Math.round((width / 2)  + (p.screen.scale * p.camera.x  * width / 2));
        p.screen.y     = Math.round((height / 2) - (p.screen.scale * p.camera.y  * height / 2));
        p.screen.w     = Math.round((p.screen.scale * roadWidth * width / 2));
    }
};

// --- CORE ENGINE CLASS ---
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.width = 0;
        this.height = 0;
        
        // State
        this.running = false;
        this.lastTime = 0;
        this.dt = 0;
        this.gdt = 0;
        this.step = 1/CONFIG.FPS;

        // Game Data
        this.segments = [];
        this.cars = [];
        this.player = null;
        this.trackLength = 0;
        
        // Settings
        this.settings = {
            difficulty: 'NORMAL',
            opponentCount: 8
        };

        this.initResize();
        this.bindEvents();
        this.setupMenu();
    }

    initResize() {
        const resize = () => {
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    bindEvents() {
        this.keys = {};
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
    }

    setupMenu() {
        const diffOpts = document.querySelectorAll('#difficulty-select .opt');
        diffOpts.forEach(btn => {
            btn.onclick = () => {
                diffOpts.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.difficulty = btn.dataset.value;
            };
        });

        const oppOpts = document.querySelectorAll('#opponent-select .opt');
        oppOpts.forEach(btn => {
            btn.onclick = () => {
                oppOpts.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.opponentCount = parseInt(btn.dataset.value);
            };
        });

        document.getElementById('start-btn').onclick = () => this.startRace();
        document.getElementById('restart-btn').onclick = () => this.startRace();
        document.getElementById('exit-btn').onclick = () => location.reload();
    }

    // --- TRACK GENERATION ---
    resetTrack() {
        this.segments = [];
        this.addLowPassTrack();
        this.trackLength = this.segments.length * CONFIG.SEGMENT_LENGTH;
        
        // Build actual track segments
        // We add long straights, curves, and hills using procedural math
    }

    addSegment(curve, y) {
        const n = this.segments.length;
        this.segments.push({
            index: n,
            p1: { world: { y: this.lastY(), z:  n    * CONFIG.SEGMENT_LENGTH }, camera: {}, screen: {} },
            p2: { world: { y: y,             z: (n+1) * CONFIG.SEGMENT_LENGTH }, camera: {}, screen: {} },
            curve: curve,
            cars: [],
            color: Math.floor(n / CONFIG.RUMBLE_LENGTH) % 2 ? 'DARK' : 'LIGHT'
        });
    }

    lastY() { return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].p2.world.y; }

    addRoad(enter, hold, leave, curve, y) {
        let startY = this.lastY();
        let endY = startY + (y * CONFIG.SEGMENT_LENGTH);
        let total = enter + hold + leave;
        for(let n = 0 ; n < enter ; n++) this.addSegment(MathUtils.easeIn(0, curve, n/enter), MathUtils.easeInOut(startY, endY, n/total));
        for(let n = 0 ; n < hold  ; n++) this.addSegment(curve, MathUtils.easeInOut(startY, endY, (enter+n)/total));
        for(let n = 0 ; n < leave ; n++) this.addSegment(MathUtils.easeInOut(curve, 0, n/leave), MathUtils.easeInOut(startY, endY, (enter+hold+n)/total));
    }

    addLowPassTrack() {
        // Procedural modern track
        this.addRoad(50, 50, 50, 0, 0);
        this.addRoad(100, 100, 100, 3, 20); // Hill and right
        this.addRoad(100, 100, 100, -2, -30); // Drop and left
        this.addRoad(200, 200, 200, 0, 0); // Long straight
        this.addRoad(100, 100, 100, 5, 0); // Sharp turn
        this.addRoad(200, 200, 200, 0, 100); // Mountain climb
        this.addRoad(200, 200, 200, -5, -100); // Descent
    }

    // --- ENTITY MANAGEMENT ---
    resetCars() {
        this.cars = [];
        // Player
        this.player = {
            pos: 0,
            x: 0,
            speed: 0,
            finishTime: 0,
            laps: 0,
            name: "PLAYER"
        };

        // AI Bots
        const diff = CONFIG.DIFFICULTY[this.settings.difficulty];
        for(let i = 0; i < this.settings.opponentCount; i++) {
            let offset = Math.random() * 0.8 - 0.4;
            let zPos = (i + 1) * (this.trackLength / (this.settings.opponentCount + 1));
            this.cars.push({
                index: i,
                x: offset,
                z: zPos,
                speed: (CONFIG.MAX_SPEED / 2) + (Math.random() * 5000),
                baseSpeed: (CONFIG.MAX_SPEED * diff.aiSpeed),
                aggr: diff.aiAggr + (Math.random() * 0.2),
                color: `hsl(${Math.random()*360}, 80%, 60%)`,
                name: `BOT_${i+1}`,
                finishTime: 0
            });
        }
    }

    // --- THE GAME LOOP ---
    startRace() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('results-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        
        this.resetTrack();
        this.resetCars();
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.frame(t));
    }

    frame(time) {
        if(!this.running) return;
        this.dt = Math.min(1, (time - this.lastTime) / 1000);
        this.gdt = this.gdt + this.dt;
        while (this.gdt > this.step) {
            this.gdt = this.gdt - this.step;
            this.update(this.step);
        }
        this.render();
        this.lastTime = time;
        requestAnimationFrame((t) => this.frame(t));
    }

    // --- PHYSICS & LOGIC ---
    update(dt) {
        const playerSegment = this.findSegment(this.player.pos + CONFIG.PLAYER_Z_OFFSET);
        const speedPercent = this.player.speed / CONFIG.MAX_SPEED;
        
        // Player Movement
        this.player.pos = (this.player.pos + (dt * this.player.speed));
        
        // Centrifugal force in curves
        this.player.x = this.player.x - (dt * speedPercent * playerSegment.curve * CONFIG.CENTRIFUGAL);

        // Inputs
        if(this.keys['ArrowUp'] || this.keys['KeyW']) 
            this.player.speed += CONFIG.ACCEL * dt;
        else if(this.keys['ArrowDown'] || this.keys['KeyS'])
            this.player.speed += CONFIG.BREAKING * dt;
        else
            this.player.speed += CONFIG.OFF_ROAD_DECEL * 0.5 * dt;

        if(this.keys['ArrowLeft'] || this.keys['KeyA'])
            this.player.x -= dt * 2 * (speedPercent + 0.3);
        if(this.keys['ArrowRight'] || this.keys['KeyD'])
            this.player.x += dt * 2 * (speedPercent + 0.3);

        // Off-road handling
        if ((this.player.x < -1) || (this.player.x > 1)) {
            if (this.player.speed > CONFIG.OFF_ROAD_LIMIT)
                this.player.speed += CONFIG.OFF_ROAD_DECEL * dt;
        }

        this.player.x = MathUtils.limit(this.player.x, -2, 2);
        this.player.speed = MathUtils.limit(this.player.speed, 0, CONFIG.MAX_SPEED);

        // Update AI
        this.updateAI(dt);

        // Lap Counter / End condition
        if(this.player.pos >= this.trackLength) {
            this.player.pos -= this.trackLength;
            this.player.laps++;
            if(this.player.laps >= 3) this.endRace();
        }

        // HUD update
        document.getElementById('speed-num').innerText = Math.round(this.player.speed / 100);
        document.getElementById('speed-gauge').style.strokeDashoffset = 283 - (283 * speedPercent);
        document.getElementById('pos-val').innerText = this.calculatePosition();
    }

    updateAI(dt) {
        this.cars.forEach(car => {
            const segment = this.findSegment(car.z);
            
            // Smart Following: AI looks ahead
            const lookAhead = this.findSegment(car.z + 500);
            car.x += (lookAhead.curve * car.aggr * 0.05);
            
            // Avoid player
            if(Math.abs(car.z - (this.player.pos + CONFIG.PLAYER_Z_OFFSET)) < 1000) {
                if(Math.abs(car.x - this.player.x) < 0.5) {
                    car.x += car.x > this.player.x ? 0.02 : -0.02;
                }
            }

            car.z = (car.z + (dt * car.speed));
            if(car.z >= this.trackLength) car.z -= this.trackLength;
            car.x = MathUtils.limit(car.x, -0.8, 0.8);
        });
    }

    calculatePosition() {
        let p = 1;
        this.cars.forEach(c => {
            if(c.z > (this.player.pos + CONFIG.PLAYER_Z_OFFSET)) p++;
        });
        return p;
    }

    findSegment(z) {
        return this.segments[Math.floor(z / CONFIG.SEGMENT_LENGTH) % this.segments.length];
    }

    // --- RENDERING PIPELINE ---
    render() {
        const ctx = this.ctx;
        const baseSegment = this.findSegment(this.player.pos);
        const basePercent = (this.player.pos % CONFIG.SEGMENT_LENGTH) / CONFIG.SEGMENT_LENGTH;
        const playerPercent = (this.player.pos + CONFIG.PLAYER_Z_OFFSET) % CONFIG.SEGMENT_LENGTH / CONFIG.SEGMENT_LENGTH;
        
        ctx.clearRect(0, 0, this.width, this.height);

        // Draw Sky (Modern Gradient)
        const grad = ctx.createLinearGradient(0,0,0,this.height);
        grad.addColorStop(0, '#00050a');
        grad.addColorStop(0.5, '#051020');
        grad.addColorStop(1, '#102040');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,this.width, this.height);

        let x = 0;
        let dx = -(baseSegment.curve * basePercent);
        let maxy = this.height;

        // Render Road Segments
        for(let n = 0; n < CONFIG.DRAW_DISTANCE; n++) {
            const segment = this.segments[(baseSegment.index + n) % this.segments.length];
            const looped = segment.index < baseSegment.index;
            
            MathUtils.project(segment.p1, this.player.x * CONFIG.ROAD_WIDTH - x, this.lastY() + CONFIG.CAMERA_HEIGHT, this.player.pos - (looped ? this.trackLength : 0), CONFIG.CAMERA_DEPTH, this.width, this.height, CONFIG.ROAD_WIDTH);
            MathUtils.project(segment.p2, this.player.x * CONFIG.ROAD_WIDTH - x - dx, this.lastY() + CONFIG.CAMERA_HEIGHT, this.player.pos - (looped ? this.trackLength : 0), CONFIG.CAMERA_DEPTH, this.width, this.height, CONFIG.ROAD_WIDTH);

            x = x + dx;
            dx = dx + segment.curve;

            if((segment.p1.camera.z <= CONFIG.CAMERA_DEPTH) || (segment.p2.screen.y >= maxy)) continue;

            this.drawSegment(ctx, segment);
            maxy = segment.p2.screen.y;
        }

        // Draw Player Car
        this.drawPlayer(ctx);
    }

    drawSegment(ctx, segment) {
        const p1 = segment.p1.screen;
        const p2 = segment.p2.screen;
        
        // Rumble
        ctx.fillStyle = (segment.color === 'LIGHT') ? '#333' : '#222';
        ctx.beginPath();
        ctx.moveTo(p1.x - p1.w, p1.y);
        ctx.lineTo(p1.x + p1.w, p1.y);
        ctx.lineTo(p2.x + p2.w, p2.y);
        ctx.lineTo(p2.x - p2.w, p2.y);
        ctx.fill();

        // Neon Strips
        if(segment.color === 'LIGHT') {
            ctx.fillStyle = var(--neon-blue);
            ctx.globalAlpha = 0.6;
            ctx.fillRect(p1.x - p1.w - 10, p1.y, 20, p2.y - p1.y);
            ctx.fillRect(p1.x + p1.w - 10, p1.y, 20, p2.y - p1.y);
            ctx.globalAlpha = 1.0;
        }
    }

    drawPlayer(ctx) {
        const bounce = (Math.random() * 2) * (this.player.speed / CONFIG.MAX_SPEED);
        const destX = this.width / 2;
        const destY = this.height - 150 + bounce;
        
        // High-tech car body
        ctx.fillStyle = '#00f3ff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f3ff';
        ctx.beginPath();
        ctx.moveTo(destX - 60, destY);
        ctx.lineTo(destX + 60, destY);
        ctx.lineTo(destX + 40, destY - 40);
        ctx.lineTo(destX - 40, destY - 40);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    endRace() {
        this.running = false;
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('results-screen').classList.remove('hidden');
        
        const pos = this.calculatePosition();
        const medalContainer = document.getElementById('medal-container');
        medalContainer.innerHTML = '';
        
        if(pos === 1) medalContainer.innerHTML = '<div class="medal gold"></div>';
        else if(pos === 2) medalContainer.innerHTML = '<div class="medal silver"></div>';
        else if(pos === 3) medalContainer.innerHTML = '<div class="medal bronze"></div>';
        
        const lb = document.getElementById('leaderboard');
        lb.innerHTML = `<h3>FINAL RANK: ${pos}</h3>`;
    }
}

// Entry Point
window.onload = () => {
    window.game = new GameEngine();
};
