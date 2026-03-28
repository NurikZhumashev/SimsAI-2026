// ПЕРЕНЕСЛИ СЮДА, чтобы этот файл знал, куда обращаться
const BACKEND_URL = "https://simsai-2026-production.up.railway.app"; 

let energy = 100;
let hunger = 100;
let curGrid = { x: 0, y: 0 };
let movingTo = null;
let futurePath = [];
let hero, heroLabel;

async function walk(sX, sY, tW, tH, scene) {
    if (futurePath.length === 0 || energy <= 0) { 
        movingTo = null; 
        return; 
    }

    movingTo = futurePath.shift();
    if (levelMap[movingTo.y][movingTo.x] === 1) { movingTo = null; futurePath = []; return; }

    energy -= 2; 
    hunger -= 1; 
    updateUI(); 

    let d = Math.sqrt(Math.pow(movingTo.x - curGrid.x, 2) + Math.pow(movingTo.y - curGrid.y, 2));
    let tX = sX + (movingTo.x - movingTo.y) * tW;
    let tY = sY + (movingTo.x + movingTo.y) * tH;

    hero.flipX = (tX < hero.x);

    scene.tweens.add({
        targets: hero, x: tX, y: tY, duration: 250 * d,
        onComplete: async () => { 
            curGrid = { x: movingTo.x, y: movingTo.y }; 
            
            if (levelMap[curGrid.y][curGrid.x] === 2) { energy = 100; }
            
            if (levelMap[curGrid.y][curGrid.x] === 3) {
                hunger = 100;
                // ИСПРАВЛЕНО: убрано лишнее https://
                await fetch(`${BACKEND_URL}/eat`, { method: 'POST' });
            }
            
            updateUI();
            walk(sX, sY, tW, tH, scene); 
        }
    });
}
