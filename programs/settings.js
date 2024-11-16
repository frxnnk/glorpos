import { createWindow } from '../script.js';

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