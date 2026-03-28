const BACKEND_URL = "https://simsai-2026-production.up.railway.app"; 

async function loadDataFromServer() {
    try {
        const response = await fetch(`${BACKEND_URL}/get_map`);
        return await response.json();
    } catch (e) { 
        console.error("Сервер молчит");
        return null; 
    }
}

const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);
let levelMap = Array(8).fill().map(() => Array(8).fill(0));
levelMap[7][0] = 2; // Кровать
levelMap[0][7] = 3; // Холодильник

function preload() {
    this.load.image('tile', 'https://labs.phaser.io/assets/sprites/diamond.png');
    this.load.image('hero', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

async function create() {
    const scene = this;
    const sX = window.innerWidth / 2, sY = 150, tW = 32, tH = 16;

    const data = await loadDataFromServer();
    if (data) {
        data.walls.forEach(w => { levelMap[w[0]][w[1]] = 1; });
        energy = data.energy;
        hunger = data.hunger;
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let iX = sX + (c - r) * tW, iY = sY + (c + r) * tH;
            let tile = this.add.image(iX, iY, 'tile');
            
            if (levelMap[r][c] === 1) { tile.setTint(0x333333); tile.y -= 4; }
            else if (levelMap[r][c] === 2) { tile.setTint(0x0000ff); }
            else if (levelMap[r][c] === 3) { tile.setTint(0xffffff); }

            tile.setInteractive().on('pointerdown', async () => {
                if (isBuild) {
                    if ((c === curGrid.x && r === curGrid.y) || levelMap[r][c] > 1) return;
                    try {
                        await fetch(`${BACKEND_URL}/save_wall`, {
                            method: 'POST', headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ r: r, c: c })
                        });
                    } catch(e) {}
                    let isWall = levelMap[r][c] === 0;
                    levelMap[r][c] = isWall ? 1 : 0;
                    tile.setTint(isWall ? 0x333333 : 0xffffff);
                    tile.y += isWall ? -4 : 4;
                } else {
                    if (levelMap[r][c] === 1 || energy < 5) return;
                    let path = findPath(curGrid.x, curGrid.y, c, r, levelMap);
                    if (path && path.length > 1) {
                        futurePath = path.slice(1);
                        if (!movingTo) walk(sX, sY, tW, tH, scene);
                    }
                }
            });

            tile.on('pointerover',()=>tile.setTint(0x00ff00)).on('pointerout',()=>{
                if (levelMap[r][c] === 1) tile.setTint(0x333333);
                else if (levelMap[r][c] === 2) tile.setTint(0x0000ff);
                else if (levelMap[r][c] === 3) tile.setTint(0xffffff);
                else tile.clearTint();
            });
        }
    }

    hero = this.add.sprite(sX, sY, 'hero').setScale(1.5).setOrigin(0.5, 0.8);
    heroLabel = this.add.text(sX, sY - 45, 'Нурик', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
    updateUI();

    setInterval(() => {
        if (!movingTo) {
            if (energy < 100) energy = Math.min(100, energy + 1);
            if (hunger > 0) hunger -= 1;
            updateUI(); 
        }
    }, 3000); 
}

function update() {
    if (hero) { heroLabel.x = hero.x; heroLabel.y = hero.y - 45; }
}
