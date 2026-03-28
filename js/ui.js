let isBuild = false;

function setMode(m) {
    isBuild = m;
    document.getElementById('wBtn').className = m ? '' : 'active';
    document.getElementById('bBtn').className = m ? 'active' : '';
}

function updateEnergyUI() {
    const bar = document.getElementById('energy-bar');
    if (!bar) return;
    bar.style.width = energy + '%';
    if (energy > 50) bar.style.background = '#28a745';
    else if (energy > 20) bar.style.background = '#ffc107';
    else bar.style.background = '#dc3545';
}

// Привязываем клики к кнопкам (поскольку они в HTML)
document.getElementById('wBtn').onclick = () => setMode(false);
document.getElementById('bBtn').onclick = () => setMode(true);
