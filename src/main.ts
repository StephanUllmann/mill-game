import './style.css';
import { initPWA } from './pwa.ts';
import game from './game.ts';

let black = '';
let white = '';
let player: 'black' | 'white' | '' = '';

let socket: WebSocket;

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

const showMessage = function (message: string, duration = 2000) {
  const msgEl = document.getElementById('msg')!;
  msgEl.textContent = message;
  msgEl.classList.remove('hidden');
  setTimeout(() => {
    msgEl.classList.add('hidden');
    msgEl.textContent = '';
  }, duration);
};

const handleMessage = (e: MessageEvent<string>) => {
  const [code, msg, p1, p2] = e.data.split('-');
  // console.log('CODE ', code);
  // console.log('ROOM ', msg);
  // console.log('BLACK ', p1);
  // console.log('WHITE ', p2);

  switch (code) {
    case '0': {
      black = p1;
      player = 'black';
      showMessage('Waiting for another player', 20000);
      break;
    }
    case '1': {
      black = p1;
      white = p2;
      player = player === '' ? 'white' : 'black';
      showMessage('You are playing ' + player, 2000);
      game(socket, { playerBlack: black, playerWhite: white, playerSelf: player });
      break;
    }
    case '9': {
      black = white = player = '';
      showMessage(msg, 50000); // is reason \_(- -)_/
      document.getElementById('close-ws')!.click();
      break;
    }
    case 'black':
    case 'white': {
      if (player !== code) {
        document.getElementById(msg)?.click();
      }
      break;
    }
    default: {
      console.log(e.data);
    }
  }
};

const handleConnection = async function (e: SubmitEvent) {
  e.preventDefault();
  const {
    name: { value: name },
    room: { value: room },
  } = (e.target! as HTMLFormElement).elements as unknown as { name: { value: string }; room: { value: string } };
  if (!room) {
    showMessage('Room required');
    return;
  }
  if (!name) {
    showMessage('Name required');
    return;
  }
  showMessage('Connecting...', 50000);
  // socket = new WebSocket(`ws://localhost:3000/${room}?name=${name}`);
  socket = new WebSocket(`wss://mill-game-socket-server.onrender.com/${room}?name=${name}`);
  socket.addEventListener('open', () => {
    (e.target! as HTMLFormElement).reset();
    const btn = document.getElementById('close-ws')!;
    document.getElementById('socketForm')!.classList.add('hidden');
    btn.classList.remove('hidden');
    btn.addEventListener('click', () => socket.close());
  });

  socket.addEventListener('message', handleMessage);

  socket.addEventListener('close', (e) => {
    const btn = document.getElementById('close-ws')!;
    btn.classList.add('hidden');
    document.getElementById('socketForm')!.classList.remove('hidden');
    black = '';
    white = '';
    player = '';
    if (e.reason) showMessage(e.reason);
    document.querySelector('.rooms')!.classList.add('hidden');
    document.getElementById('socketForm')!.removeEventListener('submit', handleConnection);
    run();
  });
  socket.addEventListener('error', () => {
    showMessage('Connection error');
  });
};

function run() {
  if (navigator.onLine) {
    const dialogEl = document.getElementById('mode')! as HTMLDialogElement;
    dialogEl.showModal();

    dialogEl.addEventListener('close', () => {
      const mode = dialogEl.returnValue;
      if (mode === 'local') game(null);
      else {
        document.querySelector('.rooms')!.classList.remove('hidden');
        document.getElementById('socketForm')!.addEventListener('submit', handleConnection);
      }
    });
  } else {
    game(null);
  }
}

window.addEventListener('DOMContentLoaded', run);
// game();
