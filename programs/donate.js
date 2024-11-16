import { createWindow } from '../script.js';
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