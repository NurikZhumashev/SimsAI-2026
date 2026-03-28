let isBuild = false;

function setMode(m) {
    isBuild = m;
    document.getElementById('wBtn').className = m ? '' : 'active';
    document.getElementById('bBtn').className = m ? 'active' : '';
}

// Универсальное обновление всех статов
function updateUI() {
    // Обновляем деньги
    const starsEl = document.getElementById('stars-count');
    if (starsEl) starsEl.innerText = stars;

    // Массив всех наших потребностей и их цветов (хорошо / плохо)
    const bars = [
        { id: 'energy-bar', val: energy, colorHigh: '#28a745', colorLow: '#dc3545' },
        { id: 'hunger-bar', val: hunger, colorHigh: '#00bcd4', colorLow: '#ff5722' },
        { id: 'hygiene-bar', val: hygiene, colorHigh: '#007bff', colorLow: '#8b4513' },
        { id: 'bladder-bar', val: bladder, colorHigh: '#ffc107', colorLow: '#dc3545' }
    ];

    bars.forEach(b => {
        const el = document.getElementById(b.id);
        if (el) {
            el.style.width = Math.max(0, b.val) + '%';
            el.style.background = b.val > 30 ? b.colorHigh : b.colorLow;
        }
    });
}

// Система красивых уведомлений от сервера
function showNotification(msg, isError = false) {
    const notif = document.getElementById('notification');
    if (!notif) return;
    notif.innerText = msg;
    notif.style.borderColor = isError ? '#ff4444' : '#44ff44';
    notif.style.color = isError ? '#ff4444' : '#44ff44';
    notif.style.display = 'block';
    
    // Плавное появление
    setTimeout(() => notif.style.opacity = 1, 10);
    
    // Исчезновение через 2.5 секунды
    setTimeout(() => {
        notif.style.opacity = 0;
        setTimeout(() => notif.style.display = 'none', 300);
    }, 2500);
}

document.getElementById('wBtn').onclick = () => setMode(false);
document.getElementById('bBtn').onclick = () => setMode(true);
