// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Расширить на весь экран

// Берем реальный ID пользователя из Телеграма
const USER_ID = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : 1; 
const API_URL = "https://simsai-2026-production.up.railway.app"; // Твой домен из Railway

// Сообщаем серверу имя игрока, если его нет
const USERNAME = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.first_name : "Аноним";

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

async function doRest() {
    try {
        const response = await fetch(`${API_URL}/action/rest/${USER_ID}`, { method: 'POST' });
        const result = await response.json();
        if (response.ok) {
            document.getElementById('char-status').innerText = result.message;
            updateStats();
        } else { alert(result.detail); }
    } catch (e) { alert("Ошибка сервера"); }
}

async function doEat() {
    try {
        const response = await fetch(`${API_URL}/action/eat/${USER_ID}`, { method: 'POST' });
        const result = await response.json();
        if (response.ok) {
            document.getElementById('char-status').innerText = result.message;
            updateStats();
        } else { alert(result.detail); }
    } catch (e) { alert("Ошибка сервера"); }
}

// Привязываем функции к кнопкам (обнови onclick в HTML или добавь слушатели тут)
document.querySelectorAll('.btn-sub')[0].onclick = doEat; // Кнопка "Магазин"
document.querySelectorAll('.btn-sub')[1].onclick = doRest; // Кнопка "Сон"
// Привязываем клик
document.getElementById('work-btn').addEventListener('click', doWork);

// Загружаем данные при старте
updateStats();
