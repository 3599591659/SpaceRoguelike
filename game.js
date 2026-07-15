const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hpText = document.getElementById("hpText");
const lvText = document.getElementById("lvText");
const expText = document.getElementById("expText");
const nextExpText = document.getElementById("nextExpText");

const startMenu = document.getElementById("startMenu");
const pauseMenu = document.getElementById("pauseMenu");
const levelUpUI = document.getElementById("levelUp");
const gameOverUI = document.getElementById("gameOver");

const choicesUI = document.getElementById("choices");

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");

const finalText = document.getElementById("finalText");

let W,H,dpr;

function resize(){

    W=window.innerWidth;
    H=window.innerHeight;

    dpr=Math.max(window.devicePixelRatio||1,1);

    canvas.width=W*dpr;
    canvas.height=H*dpr;

    canvas.style.width=W+"px";
    canvas.style.height=H+"px";

    ctx.setTransform(dpr,0,0,dpr,0,0);

}

resize();

window.addEventListener("resize",resize);

let running=false;
let paused=false;
let gameOver=false;

const keys={};

window.addEventListener("keydown",e=>{

    keys[e.key.toLowerCase()]=true;

});

window.addEventListener("keyup",e=>{

    keys[e.key.toLowerCase()]=false;

});

const joystick=document.getElementById("joystick");
const stick=document.getElementById("stick");

const joy={

    active:false,

    dx:0,

    dy:0

};

joystick.addEventListener("pointerdown",e=>{

    joy.active=true;

    updateJoystick(e);

});

window.addEventListener("pointermove",e=>{

    if(!joy.active)return;

    updateJoystick(e);

});

window.addEventListener("pointerup",()=>{

    joy.active=false;

    joy.dx=0;
    joy.dy=0;

    stick.style.left="35px";
    stick.style.top="35px";

});

function updateJoystick(e){

    const rect=joystick.getBoundingClientRect();

    const cx=rect.left+65;
    const cy=rect.top+65;

    let dx=e.clientX-cx;
    let dy=e.clientY-cy;

    const len=Math.hypot(dx,dy);

    if(len>35){

        dx=dx/len*35;
        dy=dy/len*35;

    }

    joy.dx=dx/35;
    joy.dy=dy/35;

    stick.style.left=(35+dx)+"px";
    stick.style.top=(35+dy)+"px";

}

const player={

    x:0,
    y:0,

    r:18,

    speed:4.5,

    hp:100,
    maxHp:100,

    level:1,

    exp:0,

    nextExp:10,

    attack:10,

    fireRate:220,

    bulletSpeed:9,

    bulletCount:1,

    spread:0

};

let bullets=[];
let enemies=[];
let particles=[];
let stars=[];

let shootTimer=0;
let spawnTimer=0;
let gameTime=0;

function resetGame(){

    player.x=W/2;
    player.y=H*0.75;

    player.hp=100;
    player.maxHp=100;

    player.level=1;

    player.exp=0;
    player.nextExp=10;

    player.attack=10;

    player.fireRate=220;

    player.bulletSpeed=9;

    player.bulletCount=1;

    player.spread=0;

    bullets=[];
    enemies=[];
    particles=[];

    stars=[];

    for(let i=0;i<120;i++){

        stars.push({

            x:Math.random()*W,

            y:Math.random()*H,

            r:Math.random()*2+0.5,

            v:Math.random()*1.3+0.2

        });

    }

    shootTimer=0;
    spawnTimer=0;
    gameTime=0;

    gameOver=false;

}

startBtn.onclick=()=>{

    startMenu.classList.add("hidden");

    running=true;

    resetGame();

};

pauseBtn.onclick=()=>{

    if(!running)return;

    paused=true;

    pauseMenu.classList.remove("hidden");

};

resumeBtn.onclick=()=>{

    paused=false;

    pauseMenu.classList.add("hidden");

};

restartBtn.onclick=()=>{

    gameOverUI.classList.add("hidden");

    running=true;

    paused=false;

    resetGame();

};

function shoot(){

    const center=(player.bulletCount-1)/2;

    for(let i=0;i<player.bulletCount;i++){

        const angle=(i-center)*(0.15+player.spread);

        bullets.push({

            x:player.x,

            y:player.y-player.r,

            vx:Math.sin(angle)*player.bulletSpeed,

            vy:-player.bulletSpeed,

            r:4,

            dmg:player.attack

        });

    }

}function spawnEnemy(){

    const level=Math.floor(gameTime/600)+1;

    const hp=20+level*8;

    enemies.push({

        x:Math.random()*(W-60)+30,

        y:-30,

        r:14+level,

        hp:hp,

        maxHp:hp,

        level:level,

        speed:1.2+level*0.12,

        vx:(Math.random()-0.5)*0.5,

        wave:Math.random()*Math.PI*2

    });

}

function updatePlayer(){

    let mx=0;
    let my=0;

    if(keys["a"]||keys["arrowleft"]) mx--;
    if(keys["d"]||keys["arrowright"]) mx++;

    if(keys["w"]||keys["arrowup"]) my--;
    if(keys["s"]||keys["arrowdown"]) my++;

    if(joy.active){

        mx=joy.dx;
        my=joy.dy;

    }

    player.x+=mx*player.speed;
    player.y+=my*player.speed;

    if(player.x<20)player.x=20;
    if(player.x>W-20)player.x=W-20;

    if(player.y<20)player.y=20;
    if(player.y>H-20)player.y=H-20;

}

function updateBullets(){

    shootTimer++;

    if(shootTimer>=player.fireRate/16){

        shoot();

        shootTimer=0;

    }

    for(let i=bullets.length-1;i>=0;i--){

        const b=bullets[i];

        b.x+=b.vx;
        b.y+=b.vy;

        if(

            b.y<-30||
            b.x<-30||
            b.x>W+30

        ){

            bullets.splice(i,1);

        }

    }

}

function updateEnemies(){

    spawnTimer++;

    if(spawnTimer>50){

        spawnEnemy();

        spawnTimer=0;

    }

    for(let i=enemies.length-1;i>=0;i--){

        const e=enemies[i];

        e.wave+=0.05;

        e.x+=Math.sin(e.wave)*0.5;

        e.y+=e.speed;

        if(e.y>H+40){

            enemies.splice(i,1);

            continue;

        }

        if(Math.hypot(

            e.x-player.x,

            e.y-player.y

        )<player.r+e.r){

            player.hp-=10;

            enemies.splice(i,1);

            continue;

        }

        for(let j=bullets.length-1;j>=0;j--){

            const b=bullets[j];

            if(

                Math.hypot(

                    e.x-b.x,

                    e.y-b.y

                )<e.r+b.r

            ){

                e.hp-=b.dmg;

                bullets.splice(j,1);

                break;

            }

        }

        if(e.hp<=0){

            player.exp+=2+e.level;

            enemies.splice(i,1);

        }

    }

}

function levelCheck(){

    if(player.exp>=player.nextExp){

        player.exp-=player.nextExp;

        player.level++;

        player.nextExp=Math.floor(

            player.nextExp*1.35

        )+5;

        openLevelUp();

    }

}

function openLevelUp(){

    paused=true;

    levelUpUI.classList.remove("hidden");

    choicesUI.innerHTML="";

    const skills=[

        {

            name:"攻击+20%",

            apply(){

                player.attack=Math.round(

                    player.attack*1.2

                );

            }

        },

        {

            name:"攻速+15%",

            apply(){

                player.fireRate=Math.max(

                    80,

                    player.fireRate*0.85

                );

            }

        },

        {

            name:"子弹+1",

            apply(){

                player.bulletCount++;

            }

        }

    ];

    for(const s of skills){

        const btn=document.createElement("button");

        btn.className="choiceBtn";

        btn.textContent=s.name;

        btn.onclick=()=>{

            s.apply();

            paused=false;

            levelUpUI.classList.add("hidden");

        };

        choicesUI.appendChild(btn);

    }

}function updateHUD(){

    hpText.textContent=Math.max(0,Math.floor(player.hp));

    lvText.textContent=player.level;

    expText.textContent=Math.floor(player.exp);

    nextExpText.textContent=player.nextExp;

}

function drawStars(){

    for(const s of stars){

        s.y+=s.v;

        if(s.y>H){

            s.y=0;
            s.x=Math.random()*W;

        }

        ctx.beginPath();

        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);

        ctx.fillStyle="white";

        ctx.fill();

    }

}

function drawPlayer(){

    ctx.save();

    ctx.translate(player.x,player.y);

    ctx.shadowColor="#6fe8ff";
    ctx.shadowBlur=20;

    ctx.fillStyle="#6fe8ff";

    ctx.beginPath();

    ctx.moveTo(0,-22);

    ctx.lineTo(14,18);

    ctx.lineTo(0,10);

    ctx.lineTo(-14,18);

    ctx.closePath();

    ctx.fill();

    ctx.restore();

}

function drawBullets(){

    ctx.fillStyle="#ffe86d";

    for(const b of bullets){

        ctx.beginPath();

        ctx.arc(b.x,b.y,b.r,0,Math.PI*2);

        ctx.fill();

    }

}

function drawEnemies(){

    for(const e of enemies){

        ctx.beginPath();

        ctx.arc(e.x,e.y,e.r,0,Math.PI*2);

        ctx.fillStyle="#ff6a7a";

        ctx.fill();

        ctx.fillStyle="#ffffff";

        ctx.font="12px Arial";

        ctx.textAlign="center";

        ctx.fillText(

            "Lv"+e.level,

            e.x,

            e.y+4

        );

        ctx.fillStyle="rgba(255,255,255,.2)";

        ctx.fillRect(

            e.x-e.r,

            e.y-e.r-10,

            e.r*2,

            4

        );

        ctx.fillStyle="#73ffb4";

        ctx.fillRect(

            e.x-e.r,

            e.y-e.r-10,

            e.r*2*(e.hp/e.maxHp),

            4

        );

    }

}

function draw(){

    ctx.clearRect(0,0,W,H);

    drawStars();

    drawBullets();

    drawEnemies();

    drawPlayer();

}

function update(){

    if(!running)return;

    if(paused)return;

    if(gameOver)return;

    gameTime++;

    updatePlayer();

    updateBullets();

    updateEnemies();

    levelCheck();

    updateHUD();

    if(player.hp<=0){

        gameOver=true;

        running=false;

        finalText.textContent=

        "到达等级："+player.level;

        gameOverUI.classList.remove("hidden");

    }

}

function loop(){

    update();

    draw();

    requestAnimationFrame(loop);

}

resetGame();

loop();