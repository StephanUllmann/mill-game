import { Game } from './game';

export class NetworkHandler {
  private black = '';
  private white = '';
  private player: 'black' | 'white' | '' = '';

  private socket: WebSocket | null = null;

  private showMessage(message: string, duration = 2000) {
    const msgEl = document.getElementById('msg')!;
    msgEl.textContent = message;
    msgEl.classList.remove('hidden');
    setTimeout(() => {
      msgEl.classList.add('hidden');
      msgEl.textContent = '';
    }, duration);
  }

  private handleMessage(e: MessageEvent<string>) {
    const [code, msg, p1, p2] = e.data.split('-');

    switch (code) {
      case '0': {
        this.black = p1;
        this.player = 'black';
        this.showMessage('Waiting for another player', 200000);
        break;
      }
      case '1': {
        this.black = p1;
        this.white = p2;
        this.player = this.player === '' ? 'white' : 'black';
        this.showMessage('You are playing ' + this.player, 2000);
        let game = new Game(this.socket, {
          playerBlack: this.black,
          playerWhite: this.white,
          playerSelf: this.player,
        });
        game.start();
        break;
      }
      case '9': {
        this.black = this.white = this.player = '';
        this.showMessage(msg, 50000); // is reason \_(- -)_/
        document.getElementById('close-ws')!.click();
        break;
      }
      case 'b':
      case 'w': {
        if (this.player[0] !== code) {
          document.getElementById(msg)?.click();
        }
        break;
      }
      default: {
        console.log(e.data);
      }
    }
  }

  private async handleConnection(e: SubmitEvent) {
    e.preventDefault();
    const {
      name: { value: name },
      room: { value: room },
    } = (e.target! as HTMLFormElement).elements as unknown as { name: { value: string }; room: { value: string } };
    if (!room) {
      this.showMessage('Room required');
      return;
    }
    if (!name) {
      this.showMessage('Name required');
      return;
    }
    this.showMessage('Connecting...', 50000);
    this.socket = new WebSocket(`wss://mill-game-socket-server.onrender.com/${room}?name=${name}`);
    this.socket.addEventListener('open', () => {
      (e.target! as HTMLFormElement).reset();
      const btn = document.getElementById('close-ws')!;
      document.getElementById('socketForm')!.classList.add('hidden');
      btn.classList.remove('hidden');
      btn.addEventListener('click', () => this.socket!.close());
    });

    this.socket.addEventListener('message', this.handleMessage.bind(this));

    this.socket.addEventListener('close', (e) => {
      const btn = document.getElementById('close-ws')!;
      btn.classList.add('hidden');
      document.getElementById('socketForm')!.classList.remove('hidden');
      this.black = '';
      this.white = '';
      this.player = '';
      if (e.reason) {
        this.showMessage(e.reason);
        console.log(e);
      }
      document.querySelector('.rooms')!.classList.add('hidden');
      document.getElementById('socketForm')!.removeEventListener('submit', this.handleConnection.bind(this));
      this.run();
    });
    this.socket.addEventListener('error', () => {
      this.showMessage('Connection error');
    });
  }

  run() {
    if (navigator.onLine) {
      const dialogEl = document.getElementById('mode')! as HTMLDialogElement;
      dialogEl.showModal();

      dialogEl.addEventListener('close', () => {
        const mode = dialogEl.returnValue;
        if (mode === 'local') {
          let game = new Game(null);
          game.start();
        } else {
          document.querySelector('.rooms')!.classList.remove('hidden');
          document.getElementById('socketForm')!.addEventListener('submit', this.handleConnection.bind(this));
        }
      });
    } else {
      let game = new Game(null);
      game.start();
    }
  }
}
