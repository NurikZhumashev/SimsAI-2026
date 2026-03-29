// Пока используем ID = 1 для тестов. В будущем возьмем из Telegram.WebApp.initData
const USER_ID = 1; 
const API_URL = "https://твой-проект.railway.app"; // ЗАМЕНИ НА СВОЙ URL ИЗ RAILWAY

async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/status/${USER_ID}`);
        const data = await response.json();
        
        document.getElementById('money').innerText = data.money.toFixed(1);
        document.getElementById('hunger').innerText = data.hunger;
        document.getElementById('energy').innerText = data.energy;
        document.getElementById('level').innerText = data.level;
    } catch (e) {
        console.error("Ошибка загрузки данных", e);
    }
}

async function doWork() {
    const btn = document.getElementById('work-btn');
    btn.disabled = true; // Защита от спама

    try {
        const response = await fetch(`${API_URL}/action/work/${USER_ID}`, { method: 'POST' });
        const result = await response.json();

        if (response.ok) {
            document.getElementById('char-status').innerText = result.message;
            updateStats(); // Обновляем цифры после работы
        } else {
            alert(result.detail);
        }
    } catch (e) {
        alert("Проблема со связью с сервером");
    } finally {
        btn.disabled = false;
    }
}

// Привязываем клик
document.getElementById('work-btn').addEventListener('click', doWork);

// Загружаем данные при старте
updateStats();
