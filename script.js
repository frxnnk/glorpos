//Window Manager
export function createWindow(title, content, width = '800px', height = '600px') {
    const windowId = 'window-' + Date.now();
    const newWindow = document.createElement('div');
    newWindow.className = 'window';
    newWindow.id = windowId;
  
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    let requestedWidth = parseInt(width);
    let requestedHeight = parseInt(height);
    let finalWidth, finalHeight;
    
    if (isMobile) {
        // Mobile specific dimensions
        finalWidth = viewportWidth * 0.9; // 90% of viewport width
        finalHeight = Math.min(requestedHeight, viewportHeight * 0.8);
        
        // Calculate position - moved higher up but not flush with top
        const top = Math.max(20, viewportHeight * 0.1); // 10% from top or minimum 20px
        const left = (viewportWidth - finalWidth) / 2;
        
        newWindow.style.cssText = `
            width: ${finalWidth}px !important;
            height: ${finalHeight}px !important;
            position: absolute !important;
            top: ${top}px !important;
            left: ${left}px !important;
            visibility: visible !important;
            z-index: 1000 !important;
        `;
    } else {
        // Desktop behavior remains the same
        const maxWidth = viewportWidth - 40;
        const maxHeight = viewportHeight - 100;
        
        finalWidth = Math.min(requestedWidth, maxWidth);
        finalHeight = Math.min(requestedHeight, maxHeight);
        
        const left = Math.max(20, (viewportWidth - finalWidth) / 2);
        const top = Math.max(20, (viewportHeight - finalHeight) / 2);
        
        Object.assign(newWindow.style, {
            width: `${finalWidth}px`,
            height: `${finalHeight}px`,
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            visibility: 'visible',
            transform: 'translate3d(0,0,0)'
        });
    }

    const maximizeButton = isMobile ? '' : `
    <button class="window-control maximize" onclick="toggleMaximize('${windowId}')" aria-label="Maximize">
        <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
        </svg>
    </button>
    `;

    newWindow.innerHTML = `
    <div class="window-header ${title.toLowerCase() === 'terminal' ? 'terminal-header' : ''}">
        <span>${title}</span>
        <div class="window-controls">
            ${maximizeButton}
            <button class="window-control minimize" onclick="minimizeWindow('${windowId}')" aria-label="Minimize">
                <svg width="12" height="12" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M4 12h16v2H4z"/>
                </svg>
            </button>
            <button class="window-control close" onclick="closeWindow('${windowId}')" aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    </div>
    ${content}
    `;
    const minimizeBtn = newWindow.querySelector('.window-control.minimize');
    if (minimizeBtn) {
        // Add touch event handling
        minimizeBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        minimizeWindow(windowId);
        });
    }

    document.querySelector('.desktop').appendChild(newWindow);
    makeDraggable(newWindow);
    addTaskbarItem(windowId, title);

    // Add event listeners for touch devices
    const closeButton = newWindow.querySelector('.window-control.close');
    closeButton.addEventListener('touchstart', (e) => {
        closeWindow(windowId);
        e.preventDefault();
    });

  

  return newWindow;
}

function addTaskbarItem(windowId, title) {
  const taskbarItem = document.createElement('div');
  taskbarItem.className = 'open-program-item';
  taskbarItem.textContent = title;
  taskbarItem.setAttribute('data-window', windowId);
  
  taskbarItem.onclick = () => {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
      // Remove active class from all items
      document.querySelectorAll('.open-program-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Remove active class from all windows and lower their z-index
      document.querySelectorAll('.window').forEach(win => {
        win.style.zIndex = '1';
      });
      
      // Add active class to clicked item
      taskbarItem.classList.add('active');
      
      if (windowElement.classList.contains('minimized')) {
        maximizeWindow(windowId);
      }
      
      // Bring window to front
      windowElement.style.zIndex = '1000';
      windowElement.focus();
    }
  };
  
  document.querySelector('.taskbar-open-programs').appendChild(taskbarItem);
}

function makeDraggable(element) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const header = element.querySelector('.window-header');
    
    if (isMobile) {
        // En mobile, solo prevenir el comportamiento por defecto
        header.addEventListener('touchstart', (e) => {
            // Solo permite clicks en los botones de control
            if (!e.target.closest('.window-controls')) {
                e.preventDefault();
            }
        }, { passive: false });

        header.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        header.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
        
    } else {
        // Comportamiento normal de drag para desktop
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target.closest('.window-header')) {
                isDragging = true;
                element.classList.add('moving');
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;

                element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            element.classList.remove('moving');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const bootScreen = document.querySelector('.boot-screen');
  setTimeout(() => {
    bootScreen.style.opacity = 0;
    setTimeout(() => bootScreen.remove(), 500);
  }, 3000);

  const bootMessages = [
    "Initializing GlorpCat OS v1.0...",
    "Loading Glorp Modules...",
    "Calculating Glorp Trajectories...", 
    "Preparing Glorp Launch Sequence...",
    "Syncing with Glorp Network...",
    "Creating Glorp Systems...",
    "Starting GlorpCat Services...",
    "Welcome to GlorpCat OS!"
  ];

  function showBootMessages() {
    const messageDiv = document.getElementById('boot-messages');
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootMessages.length) {
        messageDiv.innerHTML = bootMessages[i];
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);
  }

  showBootMessages();
  
  window.setTheme('forest'); // Set forest theme as default
  function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = 
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  window.minimizeWindow = function(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
      windowElement.classList.add('minimized');
      windowElement.style.display = 'none'; // Force hide on mobile
      
      // Update taskbar
      const taskbarItem = document.querySelector(`[data-window="${windowId}"]`);
      if (taskbarItem) {
        taskbarItem.classList.add('minimized');
        taskbarItem.classList.remove('active');
      }
    }
  };

  window.maximizeWindow = function(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
      windowElement.classList.remove('minimized');
      windowElement.style.display = 'block'; // Force show on mobile
      
      // Update taskbar
      const taskbarItem = document.querySelector(`[data-window="${windowId}"]`);
      if (taskbarItem) {
        taskbarItem.classList.remove('minimized');
        taskbarItem.classList.add('active');
      }
    }
  };

  window.toggleMaximize = function(windowId) {
    const windowElement = document.getElementById(windowId);
    windowElement.classList.toggle('fullscreen');
    
    // Ensure maximized window isn't resizable
    if (windowElement.classList.contains('fullscreen')) {
      windowElement.style.resize = 'none';
    } else {
      windowElement.style.resize = 'both';
    }
  };

  window.closeWindow = function(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
      if (windowElement.querySelector('.chat-window')) {
        clearInterval(chatSimulationInterval);
      }
      windowElement.remove();
      const taskbarItem = document.querySelector(`[data-window="${windowId}"]`);
      if (taskbarItem) {
        taskbarItem.remove();
      }
    }
  };

  window.openGenerator = function() {
    createWindow('Glorp Generator', '<iframe src="https://glorp-meme.netlify.app/" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };

  window.openHome = function() {
    createWindow('Web', '<iframe src="https://linktr.ee/glorpcat" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };

  window.openGlorpWallet = function() {
    createWindow('GlorpWallet', '<iframe src="https://jup.ag/swap/SOL-FkBF9u1upwEMUPxnXjcydxxVSxgr8f3k1YXbz7G7bmtA" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };

  window.openChart = function() {
    createWindow('Chart', '<iframe src="https://chart.glorpcat.lol" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };

  window.openMagicEden = function() {
    createWindow('Magic Eden', '<iframe src="https://magiceden.io/marketplace/glorp" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
  };



});

document.querySelectorAll('.window').forEach(makeDraggable);

window.toggleStartMenu = function() {
  const startMenu = document.querySelector('.start-menu');
  startMenu.classList.toggle('active');
  
  const closeMenu = (e) => {
    if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
      startMenu.classList.remove('active');
      document.removeEventListener('click', closeMenu);
    }
  }
  
  if (startMenu.classList.contains('active')) {
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 0);
  }
};

window.lockSystem = function() {
  const lockScreen = document.createElement('div');
  lockScreen.className = 'lock-screen';
  lockScreen.innerHTML = `
    <div class="lock-content">
      <img src="https://raw.githubusercontent.com/frxnnk/glorpos/refs/heads/main/assets/glorphead.png" alt="GlorpCat Logo" class="lock-logo">
      <h2 style="margin-bottom: 20px;">GlorpCat OS</h2>
      <input type="password" placeholder="Enter password to unlock" class="lock-input" onkeypress="if(event.key === 'Enter') unlockSystem()">
      <button onclick="unlockSystem()" class="unlock-button">Unlock System</button>
      <p style="margin-top: 20px; font-size: 0.8em; opacity: 0.7;">Hint: The password is 'glorp'</p>
    </div>
  `;
  document.body.appendChild(lockScreen);
};

window.unlockSystem = function() {
  const password = document.querySelector('.lock-input').value;
  if(password === 'glorp') {
    document.querySelector('.lock-screen').remove();
  } else {
    alert('Incorrect password!');
  }
}

window.powerOff = function() {
  const powerScreen = document.createElement('div');
  powerScreen.className = 'power-screen';
  powerScreen.innerHTML = `
    <div class="power-content">
      <img src="https://raw.githubusercontent.com/frxnnk/glorpos/refs/heads/main/assets/glorphead.png" alt="GlorpCat Logo" class="power-logo">
      <div class="power-text">Shutting down GlorpCat OS...</div>
      <p style="margin: 20px 0;">Your system is now safe to turn off</p>
      <button onclick="location.reload()" class="power-button">Power On</button>
    </div>
  `;
  document.body.appendChild(powerScreen);

  // Add shutdown animation
  setTimeout(() => {
    document.body.style.transition = 'opacity 1s';
    document.body.style.opacity = '0';
  }, 1000);
};

window.openDonate = function() {
  const donateContent = `
    <div class="donate-content" style="
      padding: 30px;
      height: calc(100% - 60px);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
    ">
      <img src="https://raw.githubusercontent.com/frxnnk/glorpos/refs/heads/main/assets/glorphead.png" alt="GlorpCat Logo" style="
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-bottom: 10px;
        box-shadow: 0 0 20px rgba(255,255,255,0.3);
        animation: pulse 2s infinite;
      ">
      
      <h2 style="
        font-size: 28px;
        margin: 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      ">Support GlorpCat OS</h2>
      
      <p style="
        font-size: 18px;
        opacity: 0.9;
        max-width: 80%;
        line-height: 1.5;
      ">Your donations help keep GlorpCat OS free and open for everyone!</p>
      
      <div style="
        background: rgba(255,255,255,0.1);
        padding: 20px;
        border-radius: 12px;
        backdrop-filter: blur(5px);
        width: 80%;
        margin: 20px 0;
      ">
        <h3 style="margin: 0 0 15px 0;">Donation Address</h3>
        <div style="
          background: rgba(0,0,0,0.2);
          padding: 15px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          word-break: break-all;
        ">
          <p style="margin: 0;">
            4g49ZPzQHVeQNzxnuBnTyH74iwqVvVzRvqYBjoWqbK5K
          </p>
        </div>
      </div>

      <div style="
        display: flex;
        gap: 15px;
        margin-top: 20px;
      ">
        <a href="https://t.me/frxnco" target="_blank" style="
          text-decoration: none;
          color: white;
          background: rgba(255,255,255,0.2);
          padding: 10px 20px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        ">
          <span>💬</span> Contact Developer
        </a>
      </div>
    </div>
  `;
  createWindow('Donate', donateContent, '500px', '700px');
};

window.openMusic = function() {
  const musicContent = `
    <div style="padding: 20px; height: calc(100% - 40px); display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(45deg, #1DB954, #191414);">
      <h2 style="color: white; margin-bottom: 20px;">GlorpCat Music</h2>
      <iframe 
        style="border-radius:12px" 
        src="https://open.spotify.com/embed/playlist/37i9dQZF1DX5trt9i14X7j?utm_source=generator" 
        width="100%" 
        height="352" 
        frameBorder="0" 
        allowfullscreen="" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy">
      </iframe>
      <div style="margin-top: 20px; color: white; text-align: center;">
        <p>🎵 Powered by Spotify</p>
        <p>Listen to the best glorping tunes!</p>
      </div>
    </div>
  `;
  createWindow('Music Player', musicContent, '400px', '600px');
};

window.openSettings = function() {
  const settingsContent = `
    <div class="settings-window">
      <div class="settings-section">
        <h2>Theme Settings</h2>
        <div class="color-themes">
          <div class="theme-option ${getCurrentTheme() === 'default' ? 'active' : ''}" onclick="setTheme('default')">
            <div class="theme-preview" style="background: linear-gradient(45deg, #ff69b4, #ffbd44)"></div>
            <span>Default</span>
          </div>
          <div class="theme-option ${getCurrentTheme() === 'dark' ? 'active' : ''}" onclick="setTheme('dark')">
            <div class="theme-preview" style="background: linear-gradient(45deg, #2c3e50, #3498db)"></div>
            <span>Dark</span>
          </div>
          <div class="theme-option ${getCurrentTheme() === 'forest' ? 'active' : ''}" onclick="setTheme('forest')">
            <div class="theme-preview" style="background: linear-gradient(45deg, #27ae60, #2ecc71)"></div>
            <span>Forest</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2>Display Settings</h2>
        <div class="settings-control">
          <label for="window-opacity">Window Opacity</label>
          <input type="range" id="window-opacity" class="settings-slider" min="0.5" max="1" step="0.1" value="${getWindowOpacity()}" 
            onchange="setWindowOpacity(this.value)">
        </div>
        <div class="settings-control">
          <label>
            <input type="checkbox" onchange="toggleBlur(this.checked)" ${isBlurEnabled() ? 'checked' : ''}>
            Enable Blur Effects
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h2>Sound Settings</h2>
        <div class="settings-control">
          <label>
            <input type="checkbox" onchange="toggleSystemSounds(this.checked)" ${areSystemSoundsEnabled() ? 'checked' : ''}>
            Enable System Sounds
          </label>
        </div>
      </div>
    </div>
  `;
  
  const settingsWindow = createWindow('Settings', settingsContent, '400px', '600px');
  return settingsWindow;
};

// Add these helper functions
function getCurrentTheme() {
  // Get current theme from localStorage or default to 'forest'
  return localStorage.getItem('theme') || 'forest';
}

function getWindowOpacity() {
  return localStorage.getItem('windowOpacity') || 0.9;
}

function setWindowOpacity(value) {
  localStorage.setItem('windowOpacity', value);
  document.querySelectorAll('.window').forEach(window => {
    window.style.opacity = value;
  });
}

function isBlurEnabled() {
  return localStorage.getItem('blurEffects') !== 'false';
}

function toggleBlur(enabled) {
  localStorage.setItem('blurEffects', enabled);
  document.documentElement.style.setProperty('--blur-amount', enabled ? '10px' : '0px');
}

function areSystemSoundsEnabled() {
  return localStorage.getItem('systemSounds') !== 'false';
}

function toggleSystemSounds(enabled) {
  localStorage.setItem('systemSounds', enabled);
}

const themes = {
  default: {
    primary: '#ff69b4',
    primaryRGB: '255, 105, 180',
    secondary: '#ffbd44', 
    secondaryRGB: '255, 189, 68'
  },
  dark: {
    primary: '#2c3e50',
    primaryRGB: '44, 62, 80',
    secondary: '#3498db',
    secondaryRGB: '52, 152, 219'
  },
  forest: {
    primary: '#27ae60',
    primaryRGB: '39, 174, 96',
    secondary: '#2ecc71',
    secondaryRGB: '46, 204, 113'
  }
};
// Update setTheme to save the selection
window.setTheme = function(theme) {
  localStorage.setItem('theme', theme);
  const root = document.documentElement;
  root.style.setProperty('--primary', themes[theme].primary);
  root.style.setProperty('--primary-rgb', themes[theme].primaryRGB);
  root.style.setProperty('--secondary', themes[theme].secondary);
  root.style.setProperty('--secondary-rgb', themes[theme].secondaryRGB);

  // Update SVG icon colors
  const desktopIcons = document.querySelectorAll('.desktop-icon .icon-img rect');
  desktopIcons.forEach(icon => {
    icon.setAttribute('fill', themes[theme].primary);
  });
  
  // Update active state in settings window if open
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.toggle('active', option.textContent.toLowerCase().includes(theme));
  });
}
