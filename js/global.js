document.addEventListener("DOMContentLoaded", function() {
    // 1. Load the Header
    fetch('/header.html')
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById('global-header-container');
            if(container) {
                container.innerHTML = data;
                
                // Re-attach event listeners after HTML injection
                updateClock();
                applySavedMode();
                
                // Re-attach click sounds to new menu items
                document.querySelectorAll('.play-sound').forEach(el => {
                    el.addEventListener('click', playClickSound);
                });
            }
        });
});

// 2. Mode Logic
function toggleMode() {
    const body = document.body;
    const isC64 = body.classList.contains('c64-mode');
    
    // Power Cycle Animation
    const overlay = document.createElement('div');
    overlay.className = 'power-switch-overlay power-cycle'; 
    document.body.appendChild(overlay);

    setTimeout(() => {
        if (isC64) {
            body.classList.remove('c64-mode');
            body.classList.add('amiga-mode');
            localStorage.setItem('preferredMode', 'amiga');
        } else {
            body.classList.remove('amiga-mode');
            body.classList.add('c64-mode');
            localStorage.setItem('preferredMode', 'c64');
        }
        overlay.remove();
    }, 400);
}

function applySavedMode() {
    const saved = localStorage.getItem('preferredMode');
    if (saved === 'c64') {
        document.body.classList.add('c64-mode');
        document.body.classList.remove('amiga-mode');
    } else if (saved === 'amiga') {
        document.body.classList.add('amiga-mode');
        document.body.classList.remove('c64-mode');
    }
}

function updateClock() {
    const el = document.getElementById('clock');
    if(el) {
        const now = new Date();
        el.innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
}
setInterval(updateClock, 1000);

// 3. Click Sound Logic
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    const isAmiga = document.body.classList.contains('amiga-mode');
    
    if (isAmiga) {
        o.type = 'sine'; 
        o.frequency.setValueAtTime(1200, audioCtx.currentTime); 
        o.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    } else {
        o.type = 'square'; 
        o.frequency.setValueAtTime(150, audioCtx.currentTime); 
        o.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    }
    o.start(); o.stop(audioCtx.currentTime + 0.1);
}
