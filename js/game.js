const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);
let levelMap = Array(8).fill().map(() => Array(8).fill(0));
levelMap[7][0] = 2; // Кровать

function preload() {
    this.load.image('tile', 'https://labs.phaser.io/assets/sprites/diamond.png');
    this.load.image('hero', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
    const scene = this;
    const sX = window.innerWidth / 2, sY = 150, tW = 32, tH = 16;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let iX = sX + (c - r) * tW, iY = sY + (c + r) * tH;
            let tile = this.add.image(iX, iY, 'tile');
            
            if (levelMap[r][c] === 1) { tile.setTint(0x333333); tile.y -= 4; }
            else if (levelMap[r][c] === 2) { tile.setTint(0x0000ff); }

            tile.setInteractive().on('pointerdown', () => {
                if (isBuild) {
                    if ((c === curGrid.x && r === curGrid.y) || levelMap[r][c] === 2) return;
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
        if (!movingTo && energy < 100) { energy = Math.min(100, energy + 1); updateEnergyUI(); }
    }, 1000);
}

function update() {
    if (hero && heroLabel) {
        heroLabel.x = hero.x;
        heroLabel.y = hero.y - 45;
    }
}
