// Функция загрузки данных с сервера
async function loadDataFromServer() {
    try {
        const response = await fetch(`${BACKEND_URL}/get_map`);
        return await response.json();
    } catch (e) { 
        console.error("Сервер молчит, играем локально");
        return null; 
    }
}

const config = {
    type: Phaser.AUTO, 
    width: window.innerWidth, 
    height: window.innerHeight,
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

// Инициализация карты 8x8
let levelMap = Array(8).fill().map(() => Array(8).fill(0));

// РАССТАНОВКА МЕБЕЛИ (ОБЪЕКТОВ)
levelMap[7][0] = 2; // Кровать (Синий)
levelMap[0][7] = 3; // Холодильник (Серый)
levelMap[4][4] = 4; // Ноутбук / Работа (Желтый)
levelMap[0][0] = 5; // Душ (Бирюзовый)
levelMap[7][7] = 6; // Туалет (Оранжевый)

function preload() {
    this.load.image('tile', 'https://labs.phaser.io/assets/sprites/diamond.png');
    this.load.image('hero', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

async function create() {
    const scene = this;
    const sX = window.innerWidth / 2, sY = 150, tW = 32, tH = 16;

    // 1. Загружаем сохраненные стены и статы из SQL базы
    const data = await loadDataFromServer();
    if (data) {
        data.walls.forEach(w => { 
            if (levelMap[w[0]][w[1]] === 0) levelMap[w[0]][w[1]] = 1; 
        });
        stars = data.stars;
        energy = data.energy;
        hunger = data.hunger;
        hygiene = data.hygiene;
        bladder = data.bladder;
    }

    // 2. Отрисовка сетки и объектов
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let iX = sX + (c - r) * tW, iY = sY + (c + r) * tH;
            let tile = this.add.image(iX, iY, 'tile');
            
            // Раскрашиваем объекты
            if (levelMap[r][c] === 1) { tile.setTint(0x333333); tile.y -= 4; }         // Стена
            else if (levelMap[r][c] === 2) { tile.setTint(0x0000ff); }                 // Кровать
            else if (levelMap[r][c] === 3) { tile.setTint(0xcccccc); tile.y -= 4; }    // Холодильник
            else if (levelMap[r][c] === 4) { tile.setTint(0xffff00); tile.y -= 2; }    // Ноутбук
            else if (levelMap[r][c] === 5) { tile.setTint(0x00ffff); tile.y -= 4; }    // Душ
            else if (levelMap[r][c] === 6) { tile.setTint(0xff9900); tile.y -= 2; }    // Туалет

            tile.setInteractive().on('pointerdown', async () => {
                if (isBuild) {
                    // Запрещаем строить поверх Нурика или мебели (levelMap > 1)
                    if ((c === curGrid.x && r === curGrid.y) || levelMap[r][c] > 1) return;
                    
                    try {
                        await fetch(`${BACKEND_URL}/save_wall`, {
                            method: 'POST', 
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ r: r, c: c })
                        });
                    } catch(e) {}

                    let isWall = levelMap[r][c] === 0;
                    levelMap[r][c] = isWall ? 1 : 0;
                    tile.setTint(isWall ? 0x333333 : 0xffffff);
                    tile.y += isWall ? -4 : 4;
                } else {
                    // Режим ходьбы (Нурик не может ходить по стенам или если нет сил)
                    if (levelMap[r][c] === 1 || energy < 5) {
                        if (energy < 5) showNotification("Нурик слишком устал, чтобы идти!", true);
                        return;
                    }
                    let path = findPath(curGrid.x, curGrid.y, c, r, levelMap);
                    if (path && path.length > 1) {
                        futurePath = path.slice(1);
                        if (!movingTo) walk(sX, sY, tW, tH, scene);
                    }
                }
            });

            // Подсветка при наведении
            tile.on('pointerover', () => tile.setTint(0x00ff00));
            tile.on('pointerout', () => {
                if (levelMap[r][c] === 1) tile.setTint(0x333333);
                else if (levelMap[r][c] === 2) tile.setTint(0x0000ff);
                else if (levelMap[r][c] === 3) tile.setTint(0xcccccc);
                else if (levelMap[r][c] === 4) tile.setTint(0xffff00);
                else if (levelMap[r][c] === 5) tile.setTint(0x00ffff);
                else if (levelMap[r][c] === 6) tile.setTint(0xff9900);
                else tile.clearTint();
            });
        }
    }

    // 3. Создание Нурика
    hero = this.add.sprite(sX, sY, 'hero').setScale(1.5).setOrigin(0.5, 0.8);
    heroLabel = this.add.text(sX, sY - 45, 'Нурик', { 
        fontSize: '14px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', padding: 3 
    }).setOrigin(0.5);
    
    updateUI();

    // 4. Суровый жизненный цикл (каждые 4 секунды потребности падают)
    setInterval(() => {
        if (!movingTo) {
            if (hunger > 0) hunger -= 1;
            if (hygiene > 0) hygiene -= 0.5;
            if (bladder > 0) bladder -= 1.5;
            updateUI(); 
        }
    }, 4000); 
}

function update() {
    if (hero) {
        heroLabel.x = hero.x;
        heroLabel.y = hero.y - 45;
    }
}
