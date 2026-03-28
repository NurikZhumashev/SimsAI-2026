let isBuild = false;

function setMode(m) {
    isBuild = m;
    document.getElementById('wBtn').className = m ? '' : 'active';
    document.getElementById('bBtn').className = m ? 'active' : '';
}

function updateUI() {
    const eBar = document.getElementById('energy-bar');
    if (eBar) {
        eBar.style.width = energy + '%';
        eBar.style.background = energy > 20 ? '#28a745' : '#dc3545';
    }

    const hBar = document.getElementById('hunger-bar');
    if (hBar) {
        hBar.style.width = hunger + '%';
        // Если голод меньше 30% — полоска станет оранжевой
        hBar.style.background = hunger > 30 ? '#00bcd4' : '#ff5722';
    }
}

// Привязываем клики к кнопкам (поскольку они в HTML)
document.getElementById('wBtn').onclick = () => setMode(false);
document.getElementById('bBtn').onclick = () => setMode(true);
