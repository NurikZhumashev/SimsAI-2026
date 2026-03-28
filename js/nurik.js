// Полное состояние Нурика
let stars = 50;
let energy = 100;
let hunger = 100;
let hygiene = 100;
let bladder = 100;

let curGrid = { x: 0, y: 0 };
let movingTo = null;
let futurePath = [];
let hero, heroLabel;

// Единый центр связи с сервером
// Единый центр связи с сервером (Бронированная версия)
async function performServerAction(actionType) {
    try {
        const res = await fetch(`${BACKEND_URL}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action_type: actionType })
        });
        const data = await res.json();
        
        // Если сервер вернул 500 ошибку или наш кастомный error
        if (!res.ok || data.status === "error") {
            showNotification(data.message || "Ошибка на сервере!", true);
        } else if (data.stats) {
            // Если всё прошло идеально
            showNotification(data.message, false);
            stars = data.stats.stars;
            energy = data.stats.energy;
            hunger = data.stats.hunger;
            hygiene = data.stats.hygiene;
            bladder = data.stats.bladder;
            updateUI();
        }
    } catch (e) {
        console.error("Ошибка связи с сервером", e);
        showNotification("Сервер не отвечает!", true);
    }
}

// Функция ходьбы
async function walk(sX, sY, tW, tH, scene) {
    if (futurePath.length === 0 || energy <= 0) { 
        movingTo = null; 
        return; 
    }

    movingTo = futurePath.shift();
    if (levelMap[movingTo.y][movingTo.x] === 1) { movingTo = null; futurePath = []; return; }

    // Каждая клетка отнимает чуть-чуть сил и гигиены
    energy -= 1; 
    hunger -= 1; 
    hygiene -= 0.5;
    bladder -= 0.5;
    updateUI(); 

    let d = Math.sqrt(Math.pow(movingTo.x - curGrid.x, 2) + Math.pow(movingTo.y - curGrid.y, 2));
    let tX = sX + (movingTo.x - movingTo.y) * tW;
    let tY = sY + (movingTo.x + movingTo.y) * tH;

    hero.flipX = (tX < hero.x);

    scene.tweens.add({
        targets: hero, x: tX, y: tY, duration: 250 * d,
        onComplete: async () => { 
            curGrid = { x: movingTo.x, y: movingTo.y }; 
            let tileType = levelMap[curGrid.y][curGrid.x];
            
            // Проверяем, куда наступил Нурик, и шлем команду на сервер
            if (tileType === 2) await performServerAction("sleep");   // Кровать
            if (tileType === 3) await performServerAction("eat");     // Холодильник
            if (tileType === 4) await performServerAction("work");    // НОВЫЙ ОБЪЕКТ: Ноутбук
            if (tileType === 5) await performServerAction("shower");  // НОВЫЙ ОБЪЕКТ: Душ
            if (tileType === 6) await performServerAction("toilet");  // НОВЫЙ ОБЪЕКТ: Унитаз
            
            updateUI();
            walk(sX, sY, tW, tH, scene); 
        }
    });
}
