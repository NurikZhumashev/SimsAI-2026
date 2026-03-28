// Состояние Нурика
let energy = 100;
let curGrid = { x: 0, y: 0 };
let movingTo = null;
let futurePath = [];
let hero, heroLabel;

// Функция ходьбы
function walk(sX, sY, tW, tH, scene) {
    if (futurePath.length === 0 || energy <= 0) { 
        movingTo = null; 
        return; 
    }

    movingTo = futurePath.shift();
    
    // Если на пути стена
    if (levelMap[movingTo.y][movingTo.x] === 1) {
        movingTo = null; futurePath = []; return;
    }

    energy -= 2; 
    updateEnergyUI();

    let d = Math.sqrt(Math.pow(movingTo.x - curGrid.x, 2) + Math.pow(movingTo.y - curGrid.y, 2));
    let tX = sX + (movingTo.x - movingTo.y) * tW;
    let tY = sY + (movingTo.x + movingTo.y) * tH;

    hero.flipX = (tX < hero.x);

    scene.tweens.add({
        targets: hero, x: tX, y: tY, duration: 250 * d,
        onComplete: () => { 
            curGrid = { x: movingTo.x, y: movingTo.y }; 
            
            // Проверка кровати
            if (levelMap[curGrid.y][curGrid.x] === 2) {
                energy = 100;
                updateEnergyUI();
            }
            
            walk(sX, sY, tW, tH, scene); 
        }
    });
}
