// 1. В САМОЕ НАЧАЛО: Адрес твоего сервера
const BACKEND_URL = "https://simsai-2026-production.up.railway.app"; 

// 2. ФУНКЦИЯ ЗАГРУЗКИ: Спрашиваем сервер о стенах
async function loadDataFromServer() {
    try {
        const response = await fetch(`https://${BACKEND_URL}/get_map`);
        return await response.json();
    } catch (e) { return null; }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);
let levelMap = Array(8).fill().map(() => Array(8).fill(0));
levelMap[7][0] = 2;
levelMap[0][7] = 3;// Кровать Нурика

function preload() {
    this.load.image('tile', 'https://labs.phaser.io/assets/sprites/diamond.png');
    this.load.image('hero', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

// 3. ДОБАВЛЯЕМ async К CREATE
async function create() {
    const scene = this;
    const sX = window.innerWidth / 2, sY = 150, tW = 32, tH = 16;

    // 4. ЗАГРУЗКА ДАННЫХ: Ждем ответа от сервера перед отрисовкой
    const data = await loadDataFromServer();
if (data) {
    data.walls.forEach(w => { levelMap[w[0]][w[1]] = 1; });
    energy = data.energy;
    hunger = data.hunger;
}
        levelMap[w[0]][w[1]] = 1; // Помечаем стены из базы на карте
    });

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let iX = sX + (c - r) * tW, iY = sY + (c + r) * tH;
            let tile = this.add.image(iX, iY, 'tile');
            
            // Отрисовка: Стены (1) или Кровать (2)
            if (levelMap[r][c] === 1) { tile.setTint(0x333333); tile.y -= 4; }
            else if (levelMap[r][c] === 2) { tile.setTint(0x0000ff); }

            // 5. ОБНОВЛЯЕМ КЛИК (тоже делаем async)
            tile.setInteractive().on('pointerdown', async () => {
                if (isBuild) {
                    if ((c === curGrid.x && r === curGrid.y) || levelMap[r][c] === 2) return;
                    
                    // СОХРАНЯЕМ НА БЭКЕНД
                    try {
                        await fetch(`${BACKEND_URL}/save_wall`, {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ r: r, c: c })
                        });
                    } catch(e) { console.log("Ошибка сохранения на сервер"); }

                    let isWall = levelMap[r][c] === 0;
                    levelMap[r][c] = isWall ? 1 : 0;
                    tile.setTint(isWall ? 0x333333 : 0xffffff);
                    tile.y += isWall ? -4 : 4;
                } else {
                    if (levelMap[r][c] === 1 || energy < 5) return;
                    let start = movingTo ? movingTo : curGrid;
                    let path = findPath(start.x, start.y, c, r, levelMap);
                    if (path && path.length > 1) {
                        futurePath = path.slice(1);
                        if (!movingTo) walk(sX, sY, tW, tH, scene);
                    }
                }
            });

            tile.on('pointerover',()=>tile.setTint(0x00ff00)).on('pointerout',()=>{
                if (levelMap[r][c] === 1) tile.setTint(0x333333);
                else if (levelMap[r][c] === 2) tile.setTint(0x0000ff);
                else tile.clearTint();
            });
        }
    }

    hero = this.add.sprite(sX, sY, 'hero').setScale(1.5).setOrigin(0.5, 0.8);
    heroLabel = this.add.text(sX, sY - 45, 'Нурик', { 
        fontSize: '14px', fill: '#ffffff', backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    
    updateEnergyUI();

    setInterval(() => {
    if (!movingTo) {
        // Когда стоит, энергия чуть-чуть растет
        if (energy < 100) energy = Math.min(100, energy + 1);
        // А голод потихоньку падает всегда!
        if (hunger > 0) hunger -= 1;
        updateUI(); 
    }
}, 3000); // Раз в 3 секунды

function update() {
    if (hero && heroLabel) {
        heroLabel.x = hero.x;
        heroLabel.y = hero.y - 45;
    }
}
