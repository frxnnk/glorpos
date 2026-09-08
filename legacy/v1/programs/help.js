import { createWindow } from '../script.js';
window.openHelp = function() {
    const helpContent = `
      <div class="help-content">
        <h2>GlorpCat OS Help</h2>
        <p>Created with 💚 by frxn</p>
        <a href="https://t.me/frxnco" target="_blank">
          <i>Visit Developer on Telegram</i>
        </a>
        <p style="margin-top: 20px;">Version 1.0</p>
        <p style="font-size: 0.9em; opacity: 0.7;">© 2024 GlorpCat OS</p>
      </div>
    `;
    createWindow('Help', helpContent, '400px', '300px');
  };