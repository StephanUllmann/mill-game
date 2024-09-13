import './style.css';
import { initPWA } from './pwa.ts';
import { NetworkHandler } from './NetworkHandler.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML += `
   <div
    id="pwa-toast"
    role="alert"
    aria-labelledby="toast-message"
  >
    <div class="message">
      <span id="toast-message"></span>
    </div>
    <div class="buttons">
        <button id="pwa-refresh" type="button">
          Reload
        </button>
        <button id="pwa-close" type="button">
          Close
        </button>
    </div>
  </div>
`;
initPWA(app);

window.addEventListener('DOMContentLoaded', () => {
  const go = new NetworkHandler();
  go.run();
});
