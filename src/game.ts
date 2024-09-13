import { checkIsMill, connectedMap, lToi } from './utils';

export class Game {
  #socket: WebSocket | null;
  #boardEl: HTMLDivElement;
  #playerIndicator: HTMLHeadingElement;
  #playPiece: HTMLDivElement;
  #millEl: HTMLDivElement;

  #playerBlackName = 'Black';
  #playerWhiteName = 'White';
  #playerSelf: 'black' | 'white' = 'black';

  #isPlayerOne = true;

  #phaseOneRound = 1;
  #isPhaseTwo = false;

  #p1Points: string[] = [];
  #p2Points: string[] = [];

  #isMill = false;

  #opponentPieces: NodeListOf<HTMLDivElement>;

  #selectedPoint: HTMLDivElement | null;

  #millStateRunning = false;

  constructor(
    socketParam: WebSocket | null,
    options?: { playerBlack: string; playerWhite: string; playerSelf: 'black' | 'white' }
  ) {
    this.#socket = socketParam;
    if (this.#socket) {
      this.#playerBlackName = options!.playerBlack;
      this.#playerWhiteName = options!.playerWhite;
      this.#playerSelf = options!.playerSelf;
    }

    this.#boardEl = document.querySelector<HTMLDivElement>('.board')!;
    this.#playerIndicator = document.getElementById('player-indicator')! as HTMLHeadingElement;
    this.#playPiece = document.getElementById('play-piece')! as HTMLDivElement;
    this.#millEl = document.querySelector('.mill')! as HTMLDivElement;
    this.#opponentPieces = document.querySelectorAll('not-in-doc');
    this.#selectedPoint = null;
  }
  start() {
    if (this.#socket && (this.#playerSelf === 'white') === this.#isPlayerOne) {
      this.#boardEl.inert = true;
    } else {
      this.#boardEl.inert = false;
      document.body.classList.add('is-player');
    }

    document.getElementById('reset')!.classList.add('hidden');
    document.body.classList.remove('phase-two', 'player-two');
    this.#isPlayerOne = true;
    this.#phaseOneRound = 1;
    this.#p1Points = [];
    this.#p2Points = [];
    this.#isPhaseTwo = false;
    this.#isMill = false;
    this.#millStateRunning = false;
    this.#opponentPieces = document.querySelectorAll('not-in-doc');
    this.#selectedPoint = null;

    this.#millEl.classList.add('hidden');

    this.#playerIndicator.textContent = this.#playerBlackName + "'s turn";

    [...this.#boardEl.children].forEach((el) => {
      el.classList.remove('p1', 'p2');
    });

    ['p1', 'p2'].forEach((player) => {
      const container = document.getElementById(`pieces-${player}`)!;
      container.innerHTML = '';
      const ind = `<div class="${player}ind"></div>`;
      Array.from(Array(9)).forEach((_) => container?.insertAdjacentHTML('beforeend', ind));
    });

    this.#boardEl.addEventListener('click', this.#handleBoardClick.bind(this));
    document.addEventListener('mousemove', this.#handleMouseMove.bind(this));
  }

  #handleMouseMove(e: MouseEvent) {
    const { clientX, clientY } = e;
    this.#playPiece.style.setProperty('--x', clientX + 'px');
    this.#playPiece.style.setProperty('--y', clientY + 'px');
  }

  #handleBoardClick(e: MouseEvent) {
    const point = (e.target as HTMLDivElement).closest('.point') as HTMLDivElement;
    if (!point) return;
    // if socket and it's my turn
    if (this.#socket && (this.#playerSelf === 'black') === this.#isPlayerOne) {
      this.#socket.send(this.#playerSelf + '-' + point.id);
    }
    if (this.#isMill) this.#handleMillClick(point);
    else if (this.#selectedPoint) {
      this.#handleMove(point);
      return;
    } else if (this.#isPhaseTwo && !this.#selectedPoint) {
      this.#selectPoint(point);
      return;
    } else if (point.classList.contains('p1') || point.classList.contains('p2')) return;
    else this.#handlePlacement(point);

    if (this.#isMill) {
      this.#setupMillState();
      return;
    }
    this.#endRound();
  }

  #handlePlacement(point: HTMLDivElement) {
    const place = point.style.getPropertyValue('--place');
    const placesArr = this.#isPlayerOne ? this.#p1Points : this.#p2Points;
    this.#isMill = checkIsMill(place, placesArr);
    this.#isPlayerOne ? this.#p1Points.push(place) : this.#p2Points.push(place);
    point.classList.add(this.#isPlayerOne ? 'p1' : 'p2');
    if (!this.#isPhaseTwo && !this.#isPlayerOne) this.#phaseOneRound++;

    if (!this.#isPhaseTwo) {
      const select = document.getElementById(`pieces-${this.#isPlayerOne ? 'p1' : 'p2'}`)!;
      const lastChild = select.lastElementChild;
      if (lastChild) {
        select.removeChild(lastChild);
      }
    }
    if (!this.#isPhaseTwo && !this.#isPlayerOne && this.#phaseOneRound > 9) {
      this.#isPhaseTwo = true;
      document.body.classList.add('phase-two');
    }
  }

  #selectPoint(point: HTMLDivElement) {
    if (!point.classList.contains(this.#isPlayerOne ? 'p1' : 'p2')) return '';
    this.#selectedPoint = point;
    point.classList.add('selected');
  }

  #handleMove(point: HTMLDivElement) {
    if (point === this.#selectedPoint) {
      this.#selectedPoint?.classList.remove('selected');
      this.#selectedPoint = null;
      return;
    }
    const place = point.style.getPropertyValue('--place');

    const playerPlaces = this.#isPlayerOne ? this.#p1Points : this.#p2Points;
    if (playerPlaces.includes(place)) {
      this.#selectedPoint?.classList.remove('selected');
      this.#selectedPoint = point;
      this.#selectedPoint?.classList.add('selected');
      return;
    }

    const oldPlace = this.#selectedPoint?.style.getPropertyValue('--place') as keyof typeof connectedMap;
    if (!connectedMap[oldPlace].includes(place) && playerPlaces.length > 3) return;
    const opponentPlaces = this.#isPlayerOne ? this.#p2Points : this.#p1Points;
    if (opponentPlaces.includes(place)) return;

    const yMove = Number(oldPlace[1]) - Number(place[1]);
    const xMove = lToi[place[0] as keyof typeof lToi] - lToi[oldPlace[0] as keyof typeof lToi];

    this.#selectedPoint!.classList.add('move');
    this.#selectedPoint!.style.transform = `translate(calc(min(10.5cqh, 10.5cqw) * ${xMove}), calc(min(10.5cqh, 10.5cqw) * ${yMove}))`;
    setTimeout(() => {
      if (this.#isPlayerOne) {
        this.#p1Points.splice(
          this.#p1Points.findIndex((p) => oldPlace === p),
          1
        );
      } else {
        this.#p2Points.splice(
          this.#p2Points.findIndex((p) => oldPlace === p),
          1
        );
      }
      this.#selectedPoint!.style.transform = 'unset';
      this.#selectedPoint?.classList.remove('selected', 'p1', 'p2', 'move');
      this.#selectedPoint = null;
      this.#handlePlacement(point);
      if (this.#isMill) {
        this.#setupMillState();
        return;
      }
      this.#endRound();
    }, 500);
  }

  #endRound() {
    if (this.#selectedPoint) return;
    // if (boardEl.inert) return;
    if (this.#socket && (this.#playerSelf === 'black') === this.#isPlayerOne) {
      this.#boardEl.inert = true;
    } else {
      this.#boardEl.inert = false;
    }
    document.body.classList.toggle('is-player');
    this.#isPlayerOne = !this.#isPlayerOne;
    const text = this.#isPlayerOne ? this.#playerBlackName : this.#playerWhiteName;
    this.#playerIndicator.textContent = text + "'s turn";
    document.body.classList.toggle('player-two');
  }

  #endMillState() {
    this.#playPiece.classList.add('play-piece');
    this.#millEl.classList.add('hidden');
    this.#isMill = false;
    this.#millStateRunning = false;
    this.#opponentPieces.forEach((piece) => piece.classList.remove('clickablePiece'));
    if (this.#isPhaseTwo) {
      const opponentPlaces = this.#isPlayerOne ? this.#p2Points : this.#p1Points;
      if (opponentPlaces.length < 3) this.#endGame();
    }
  }

  #handleMillClick(point: HTMLDivElement) {
    const clickedPlace = point.style.getPropertyValue('--place');
    if (!clickedPlace || !point.classList.contains('clickablePiece')) return;
    if (this.#isPlayerOne) {
      this.#p2Points.splice(
        this.#p2Points.findIndex((p) => clickedPlace === p),
        1
      );
    } else {
      this.#p1Points.splice(
        this.#p1Points.findIndex((p) => clickedPlace === p),
        1
      );
    }
    point.classList.remove('p1', 'p2');
    this.#endMillState();
  }

  #setupMillState() {
    if (this.#millStateRunning) return;
    this.#millStateRunning = true;
    this.#millEl.classList.remove('hidden');
    this.#playPiece.classList.remove('play-piece');
    this.#opponentPieces = document.querySelectorAll(this.#isPlayerOne ? '.p2' : '.p1');
    const filteredPieces = [...this.#opponentPieces].filter((piece) => !this.#isInMill(piece));
    if (!filteredPieces.length) {
      this.#endMillState();
      return;
    }
    filteredPieces.forEach((piece) => piece.classList.add('clickablePiece'));
  }

  #isInMill(piece: HTMLDivElement) {
    const place = piece.style.getPropertyValue('--place');
    const opponentPlaces = this.#isPlayerOne ? [...this.#p2Points] : [...this.#p1Points];
    opponentPlaces.splice(
      opponentPlaces.findIndex((p) => p === place),
      1
    );
    return checkIsMill(place, opponentPlaces);
  }

  #endGame() {
    // boardEl.inert = true;
    document.getElementById('reset')!.classList.remove('hidden');
    this.#boardEl.removeEventListener('click', this.#handleBoardClick);
    document.removeEventListener('mousemove', this.#handleMouseMove);
    const text = this.#isPlayerOne ? this.#playerBlackName : this.#playerWhiteName;
    console.log(text);
    this.#playerIndicator.textContent = text + ' won!';
  }
}
