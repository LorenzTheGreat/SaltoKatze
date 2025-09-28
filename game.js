// SaltoKatze - simple endless runner with a cat
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let DPR = window.devicePixelRatio || 1;
function resize(){
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = Math.floor(w * DPR);
  canvas.height = Math.floor(h * DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize', resize);
resize();

// Game world params
const GROUND_Y = () => canvas.height / DPR * 0.78;
let speed = 220; // pixels per second
let distance = 0;
let best = parseInt(localStorage.getItem('sk_best')||'0',10);

// Player
const player = {
  x: 80,
  y: 0,
  w: 44,
  h: 44,
  vy: 0,
  onGround: false,
  running: false,
};

// Obstacles
let obstacles = [];
let spawnTimer = 0;

// Input
const keys = {};
window.addEventListener('keydown', e=>{ keys[e.code]=true; });
window.addEventListener('keyup', e=>{ keys[e.code]=false; });

// Mobile buttons
document.getElementById('btn-jump').addEventListener('touchstart', e=>{ e.preventDefault(); keys['TouchJump']=true; });
document.getElementById('btn-jump').addEventListener('touchend', e=>{ e.preventDefault(); keys['TouchJump']=false; });
document.getElementById('btn-run').addEventListener('touchstart', e=>{ e.preventDefault(); keys['TouchRun']=true; });
document.getElementById('btn-run').addEventListener('touchend', e=>{ e.preventDefault(); keys['TouchRun']=false; });

// Buttons also for mouse click
document.getElementById('btn-jump').addEventListener('mousedown', e=>{ keys['TouchJump']=true; });
document.getElementById('btn-jump').addEventListener('mouseup', e=>{ keys['TouchJump']=false; });
document.getElementById('btn-run').addEventListener('mousedown', e=>{ keys['TouchRun']=true; });
document.getElementById('btn-run').addEventListener('mouseup', e=>{ keys['TouchRun']=false; });

// UI
const scoreLabel = document.getElementById('score');
const speedLabel = document.getElementById('speed');
const bestLabel = document.getElementById('best');
const messages = document.getElementById('messages');
bestLabel.textContent = 'Best: ' + best;

function reset(){
  obstacles = [];
  spawnTimer = 0;
  distance = 0;
  speed = 220;
  player.y = GROUND_Y() - player.h;
  player.vy = 0;
  player.onGround = true;
}

reset();

// Physics
const GRAV = 1600;
const JUMP_V = -560;

let last = performance.now();
let runningHoldTimer = 0; // must hold run or lose
const RUN_REQUIRED_THRESHOLD = 1.4; // seconds allowed without running

function spawnObstacle(){
  const h = 36 + Math.random()*40;
  const w = 18 + Math.random()*60;
  const x = canvas.width/DPR + 60;
  const y = GROUND_Y() - h;
  obstacles.push({x,y,w,h});
}

function update(dt){
  // input: run must be held (ShiftLeft, TouchRun)
  player.running = keys['ShiftLeft'] || keys['ShiftRight'] || keys['TouchRun'];
  if(!player.running){
    runningHoldTimer += dt;
  } else {
    runningHoldTimer = 0;
  }

  // if exceed threshold -> lose
  if(runningHoldTimer > RUN_REQUIRED_THRESHOLD){
    gameOver('Du bist zu langsam gelaufen!');
    return;
  }

  // jump
  const wantJump = keys['Space'] || keys['ArrowUp'] || keys['TouchJump'];
  if(wantJump && player.onGround){ player.vy = JUMP_V; player.onGround = false; }

  // gravity
  player.vy += GRAV * dt;
  player.y += player.vy * dt;
  const groundY = GROUND_Y() - player.h;
  if(player.y >= groundY){ player.y = groundY; player.vy = 0; player.onGround = true; }

  // speed increases slightly with time/distance
  speed += 2 * dt; // accelerate slowly
  const scroll = speed * dt * (player.running ? 1.2 : 0.6);
  distance += scroll;

  // spawn obstacles based on distance
  spawnTimer -= scroll;
  if(spawnTimer <= 0){ spawnTimer = 240 + Math.random()*380 - Math.min(distance/1000,220); spawnObstacle(); }

  // update obstacles
  for(let i=obstacles.length-1;i>=0;i--){
    obstacles[i].x -= scroll;
    // collision
    if(rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, obstacles[i])){
      gameOver('Die Katze ist gefallen!');
      return;
    }
    if(obstacles[i].x + obstacles[i].w < -200){ obstacles.splice(i,1); }
  }

  // update labels
  scoreLabel.textContent = 'Punkte: ' + Math.floor(distance);
  speedLabel.textContent = 'Geschw.: ' + Math.floor(speed);
  if(distance > best){ best = Math.floor(distance); localStorage.setItem('sk_best', best); bestLabel.textContent = 'Best: ' + best; }
}

let running = true;
function gameOver(msg){ running = false; messages.textContent = msg + ' Tippe zum Neustart.'; }

function rectsOverlap(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function draw(){
  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // sky background gradient
  const grad = ctx.createLinearGradient(0,0,0,canvas.height/DPR);
  grad.addColorStop(0,'#87ceeb');
  grad.addColorStop(1,'#6ec1ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width/DPR,canvas.height/DPR);

  // ground
  const gy = GROUND_Y();
  ctx.fillStyle = '#5c3b1a';
  ctx.fillRect(0,gy,canvas.width/DPR,canvas.height/DPR - gy);

  // draw player (simple cat silhouette)
  ctx.save();
  ctx.translate(player.x, player.y);
  // body
  ctx.fillStyle = '#ffcc88';
  ctx.fillRect(0,0,player.w,player.h);
  // ear
  ctx.fillStyle = '#ffad33';
  ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(12,-10); ctx.lineTo(18,0); ctx.fill();
  // tail
  ctx.fillStyle = '#ffad33'; ctx.fillRect(-10,10,12,8);
  ctx.restore();

  // obstacles
  ctx.fillStyle = '#333';
  for(const o of obstacles){ ctx.fillRect(o.x, o.y, o.w, o.h); }

  // little runner bar for required run
  const rw = 140;
  const frac = Math.max(0, Math.min(1, (RUN_REQUIRED_THRESHOLD - runningHoldTimer) / RUN_REQUIRED_THRESHOLD));
  ctx.fillStyle = 'rgba(255,200,50,0.95)';
  ctx.fillRect(10, canvas.height/DPR - 28, rw * frac, 12);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.strokeRect(10, canvas.height/DPR - 28, rw, 12);
}

function loop(now){
  const dt = Math.min(0.05,(now - last)/1000);
  last = now;
  if(running){ update(dt); }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Restart on click/tap
canvas.addEventListener('pointerdown', e=>{
  if(!running){ running = true; messages.textContent=''; reset(); }
});

// Also support touch on whole screen for jump
canvas.addEventListener('touchstart', e=>{ e.preventDefault(); keys['TouchJump']=true; });
canvas.addEventListener('touchend', e=>{ e.preventDefault(); keys['TouchJump']=false; });

// Expose for debug
window.SK = {player, obstacles};
