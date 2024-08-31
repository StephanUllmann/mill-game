import { checkIsMill, connectedMap, lToi } from './utils';
let boardEl: HTMLDivElement;
let playerIndicator: HTMLHeadingElement;
let playPiece: HTMLDivElement;
let millEl: HTMLDivElement;

let isPlayerOne = true;

let phaseOneRound = 1;
let isPhaseTwo = false;

let p1Places: string[] = [];
let p2Places: string[] = [];

let isMill = false;

let opponentPieces: NodeListOf<HTMLDivElement>;

let selectedPoint: HTMLDivElement | null;

let millStateRunning = false;

function endGame() {
  boardEl.inert = true;
  document.getElementById('reset')!.classList.remove('hidden');
  boardEl.removeEventListener('click', handleBoardClick);
  document.removeEventListener('mousemove', handleMouseMove);
  playerIndicator.textContent = isPlayerOne ? 'Player One Won!' : 'Player Two Won!';
}

function isInMill(piece: HTMLDivElement) {
  const place = piece.style.getPropertyValue('--place');
  const opponentPlaces = isPlayerOne ? [...p2Places] : [...p1Places];
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
    p2Places.splice(
      p2Places.findIndex((p) => clickedPlace === p),
      1
    );
  } else {
    p1Places.splice(
      p1Places.findIndex((p) => clickedPlace === p),
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
    const opponentPlaces = isPlayerOne ? p2Places : p1Places;
    if (opponentPlaces.length < 3) endGame();
  }
}

function endRound() {
  if (selectedPoint) return;
  if (boardEl.inert) return;
  isPlayerOne = !isPlayerOne;
  playerIndicator.textContent = isPlayerOne ? 'Player One' : 'Player Two';
  document.body.classList.toggle('player-two');
}

function handleMove(point: HTMLDivElement) {
  if (point === selectedPoint) {
    selectedPoint?.classList.remove('selected');
    selectedPoint = null;
    return;
  }
  const place = point.style.getPropertyValue('--place');

  const playerPlaces = isPlayerOne ? p1Places : p2Places;
  if (playerPlaces.includes(place)) {
    selectedPoint?.classList.remove('selected');
    selectedPoint = point;
    selectedPoint?.classList.add('selected');
    return;
  }

  const oldPlace = selectedPoint?.style.getPropertyValue('--place') as keyof typeof connectedMap;
  if (!connectedMap[oldPlace].includes(place) && playerPlaces.length > 3) return;
  const opponentPlaces = isPlayerOne ? p2Places : p1Places;
  if (opponentPlaces.includes(place)) return;

  const yMove = Number(oldPlace[1]) - Number(place[1]);
  const xMove = lToi[place[0] as keyof typeof lToi] - lToi[oldPlace[0] as keyof typeof lToi];

  selectedPoint!.classList.add('move');
  selectedPoint!.style.transform = `translate(calc(11cqh * ${xMove}), calc(11cqh * ${yMove}))`;
  setTimeout(() => {
    if (isPlayerOne) {
      p1Places.splice(
        p1Places.findIndex((p) => oldPlace === p),
        1
      );
    } else {
      p2Places.splice(
        p2Places.findIndex((p) => oldPlace === p),
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
  const placesArr = isPlayerOne ? p1Places : p2Places;
  isMill = checkIsMill(place, placesArr);
  isPlayerOne ? p1Places.push(place) : p2Places.push(place);
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

function handleBoardClick(e: MouseEvent) {
  const point = (e.target as HTMLDivElement).closest('.point') as HTMLDivElement;
  if (!point) return;
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
  document.getElementById('reset')!.classList.add('hidden');
  document.body.classList.remove('phase-two', 'player-two');
  isPlayerOne = true;
  phaseOneRound = 1;
  p1Places = [];
  p2Places = [];
  isPhaseTwo = false;
  isMill = false;
  millStateRunning = false;
  opponentPieces = document.querySelectorAll('not-in-doc');
  selectedPoint = null;
  boardEl = document.querySelector<HTMLDivElement>('.board')!;
  boardEl.inert = false;
  playerIndicator = document.getElementById('player-indicator')! as HTMLHeadingElement;
  playPiece = document.getElementById('play-piece')! as HTMLDivElement;
  millEl = document.querySelector('.mill')! as HTMLDivElement;

  millEl.classList.add('hidden');

  playerIndicator.textContent = 'Player One';

  [...boardEl.children].forEach((el) => {
    el.classList.remove('p1', 'p2');
  });

  ['p1', 'p2'].forEach((player) => {
    const container = document.getElementById(`pieces-${player}`);
    const ind = `<div class="${player}ind"></div>`;
    Array.from(Array(9)).forEach((_) => container?.insertAdjacentHTML('beforeend', ind));
  });

  boardEl.addEventListener('click', handleBoardClick);
  document.addEventListener('mousemove', handleMouseMove);
}

export default function game() {
  window.addEventListener('load', startGame);
  document.getElementById('reset')!.addEventListener('click', startGame);
}
