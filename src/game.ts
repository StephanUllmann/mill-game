import { checkIsMill, connectedMap, lToi } from './utils';
let socket: WebSocket | null;
let boardEl: HTMLDivElement;
let playerIndicator: HTMLHeadingElement;
let playPiece: HTMLDivElement;
let millEl: HTMLDivElement;

let playerBlackName = 'Black';
let playerWhiteName = 'White';
let playerSelf: 'black' | 'white' = 'black';

let isPlayerOne = true;

let phaseOneRound = 1;
let isPhaseTwo = false;

let p1Points: string[] = [];
let p2Points: string[] = [];

let isMill = false;

let opponentPieces: NodeListOf<HTMLDivElement>;

let selectedPoint: HTMLDivElement | null;

let millStateRunning = false;

function endGame() {
  // boardEl.inert = true;
  document.getElementById('reset')!.classList.remove('hidden');
  boardEl.removeEventListener('click', handleBoardClick);
  document.removeEventListener('mousemove', handleMouseMove);
  const text = isPlayerOne ? playerBlackName : playerWhiteName;
  playerIndicator.textContent = text + ' won!';
}

function isInMill(piece: HTMLDivElement) {
  const place = piece.style.getPropertyValue('--place');
  const opponentPlaces = isPlayerOne ? [...p2Points] : [...p1Points];
  opponentPlaces.splice(
    opponentPlaces.findIndex((p) => p === place),
    1
  );
  return checkIsMill(place, opponentPlaces);
}

function setupMillState() {
  if (millStateRunning) return;
  millStateRunning = true;
  millEl.classList.remove('hidden');
  playPiece.classList.remove('play-piece');
  opponentPieces = document.querySelectorAll(isPlayerOne ? '.p2' : '.p1');
  const filteredPieces = [...opponentPieces].filter((piece) => !isInMill(piece));
  if (!filteredPieces.length) {
    endMillState();
    return;
  }
  filteredPieces.forEach((piece) => piece.classList.add('clickablePiece'));
}

function handleMillClick(point: HTMLDivElement) {
  const clickedPlace = point.style.getPropertyValue('--place');
  if (!clickedPlace || !point.classList.contains('clickablePiece')) return;
  if (isPlayerOne) {
    p2Points.splice(
      p2Points.findIndex((p) => clickedPlace === p),
      1
    );
  } else {
    p1Points.splice(
      p1Points.findIndex((p) => clickedPlace === p),
      1
    );
  }
  point.classList.remove('p1', 'p2');
  endMillState();
}

function endMillState() {
  playPiece.classList.add('play-piece');
  millEl.classList.add('hidden');
  isMill = false;
  millStateRunning = false;
  opponentPieces.forEach((piece) => piece.classList.remove('clickablePiece'));
  if (isPhaseTwo) {
    const opponentPlaces = isPlayerOne ? p2Points : p1Points;
    if (opponentPlaces.length < 3) endGame();
  }
}

function endRound() {
  if (selectedPoint) return;
  // if (boardEl.inert) return;
  if (socket && (playerSelf === 'black') === isPlayerOne) {
    boardEl.inert = true;
  } else {
    boardEl.inert = false;
  }
  isPlayerOne = !isPlayerOne;
  const text = isPlayerOne ? playerBlackName : playerWhiteName;
  playerIndicator.textContent = text + "'s turn";
  document.body.classList.toggle('player-two');
}

function handleMove(point: HTMLDivElement) {
  if (point === selectedPoint) {
    selectedPoint?.classList.remove('selected');
    selectedPoint = null;
    return;
  }
  const place = point.style.getPropertyValue('--place');

  const playerPlaces = isPlayerOne ? p1Points : p2Points;
  if (playerPlaces.includes(place)) {
    selectedPoint?.classList.remove('selected');
    selectedPoint = point;
    selectedPoint?.classList.add('selected');
    return;
  }

  const oldPlace = selectedPoint?.style.getPropertyValue('--place') as keyof typeof connectedMap;
  if (!connectedMap[oldPlace].includes(place) && playerPlaces.length > 3) return;
  const opponentPlaces = isPlayerOne ? p2Points : p1Points;
  if (opponentPlaces.includes(place)) return;

  const yMove = Number(oldPlace[1]) - Number(place[1]);
  const xMove = lToi[place[0] as keyof typeof lToi] - lToi[oldPlace[0] as keyof typeof lToi];

  selectedPoint!.classList.add('move');
  selectedPoint!.style.transform = `translate(calc(min(10.5cqh, 10.5cqw) * ${xMove}), calc(min(10.5cqh, 10.5cqw) * ${yMove}))`;
  setTimeout(() => {
    if (isPlayerOne) {
      p1Points.splice(
        p1Points.findIndex((p) => oldPlace === p),
        1
      );
    } else {
      p2Points.splice(
        p2Points.findIndex((p) => oldPlace === p),
        1
      );
    }
    selectedPoint!.style.transform = 'unset';
    selectedPoint?.classList.remove('selected', 'p1', 'p2', 'move');
    selectedPoint = null;
    handlePlacement(point);
    if (isMill) {
      setupMillState();
      return;
    }
    endRound();
  }, 500);
}

function selectPoint(point: HTMLDivElement) {
  if (!point.classList.contains(isPlayerOne ? 'p1' : 'p2')) return '';
  selectedPoint = point;
  point.classList.add('selected');
}

function handlePlacement(point: HTMLDivElement) {
  const place = point.style.getPropertyValue('--place');
  const placesArr = isPlayerOne ? p1Points : p2Points;
  isMill = checkIsMill(place, placesArr);
  isPlayerOne ? p1Points.push(place) : p2Points.push(place);
  point.classList.add(isPlayerOne ? 'p1' : 'p2');
  if (!isPhaseTwo && !isPlayerOne) phaseOneRound++;

  if (!isPhaseTwo) {
    const select = document.getElementById(`pieces-${isPlayerOne ? 'p1' : 'p2'}`)!;
    const lastChild = select.lastElementChild;
    if (lastChild) {
      select.removeChild(lastChild);
    }
  }
  if (!isPhaseTwo && !isPlayerOne && phaseOneRound > 9) {
    isPhaseTwo = true;
    document.body.classList.add('phase-two');
  }
}

export function handleBoardClick(e: MouseEvent) {
  const point = (e.target as HTMLDivElement).closest('.point') as HTMLDivElement;
  if (!point) return;
  // if socket and it's my turn
  if (socket && (playerSelf === 'black') === isPlayerOne) {
    socket.send(playerSelf + '-' + point.id);
  }
  if (isMill) handleMillClick(point);
  else if (selectedPoint) {
    handleMove(point);
    return;
  } else if (isPhaseTwo && !selectedPoint) {
    selectPoint(point);
    return;
  } else if (point.classList.contains('p1') || point.classList.contains('p2')) return;
  else handlePlacement(point);

  if (isMill) {
    setupMillState();
    return;
  }
  endRound();
}

function handleMouseMove(e: MouseEvent) {
  const { clientX, clientY } = e;
  playPiece.style.setProperty('--x', clientX + 'px');
  playPiece.style.setProperty('--y', clientY + 'px');
}

function startGame() {
  // console.log(socket);
  boardEl = document.querySelector<HTMLDivElement>('.board')!;

  if (socket && (playerSelf === 'white') === isPlayerOne) {
    boardEl.inert = true;
  } else {
    boardEl.inert = false;
  }

  document.getElementById('reset')!.classList.add('hidden');
  document.body.classList.remove('phase-two', 'player-two');
  isPlayerOne = true;
  phaseOneRound = 1;
  p1Points = [];
  p2Points = [];
  isPhaseTwo = false;
  isMill = false;
  millStateRunning = false;
  opponentPieces = document.querySelectorAll('not-in-doc');
  selectedPoint = null;
  playerIndicator = document.getElementById('player-indicator')! as HTMLHeadingElement;
  playPiece = document.getElementById('play-piece')! as HTMLDivElement;
  millEl = document.querySelector('.mill')! as HTMLDivElement;

  millEl.classList.add('hidden');

  playerIndicator.textContent = playerBlackName + "'s turn";

  [...boardEl.children].forEach((el) => {
    el.classList.remove('p1', 'p2');
  });

  ['p1', 'p2'].forEach((player) => {
    const container = document.getElementById(`pieces-${player}`)!;
    container.innerHTML = '';
    const ind = `<div class="${player}ind"></div>`;
    Array.from(Array(9)).forEach((_) => container?.insertAdjacentHTML('beforeend', ind));
  });

  boardEl.addEventListener('click', handleBoardClick);
  document.addEventListener('mousemove', handleMouseMove);
}

export default function game(
  socketParam: WebSocket | null,
  options?: { playerBlack: string; playerWhite: string; playerSelf: 'black' | 'white' }
) {
  socket = socketParam;
  if (socket) {
    playerBlackName = options!.playerBlack;
    playerWhiteName = options!.playerWhite;
    playerSelf = options!.playerSelf;
  }
  startGame();
  document.getElementById('reset')!.addEventListener('click', startGame);
}
