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
    createWindow('Web', '<iframe src="https://www.glorpcat.lol" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>');
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