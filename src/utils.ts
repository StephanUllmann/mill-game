function checkDs(number: string, placesArr: string[]) {
  const ds: string[] = [];

  for (let i = 0; i < placesArr.length; i++) {
    if (placesArr[i][0] === 'd') ds.push(placesArr[i][1]);
  }

  const compareStr = [...ds, number].sort().join('');
  const dsString = ds.sort().join('');
  if (
    (compareStr.includes('123') && !dsString.includes('123')) ||
    (compareStr.includes('567') && !dsString.includes('567'))
  )
    return true;
  let countNum = 0;
  for (let i = 0; i < placesArr.length; i++) {
    const curr = placesArr[i];
    if (curr[1] === number) countNum++;
  }
  if (countNum === 2) return true;
  return false;
}

function checkFours(letter: string, placesArr: string[]) {
  const fours: string[] = [];

  for (let i = 0; i < placesArr.length; i++) {
    if (placesArr[i][1] === '4') fours.push(placesArr[i][0]);
  }

  const compareStr = [...fours, letter].sort().join('');
  const foursStr = fours.sort().join('');

  if (
    (compareStr.includes('abc') && !foursStr.includes('abc')) ||
    (compareStr.includes('efg') && !foursStr.includes('efg'))
  )
    return true;
  let countLetter = 0;
  for (let i = 0; i < placesArr.length; i++) {
    const curr = placesArr[i];
    if (curr[0] === letter) countLetter++;
  }
  if (countLetter === 2) return true;
  return false;
}

function checkIsMill(place: string, placesArr: string[]) {
  const [letter, number] = place.split('');
  if (number === '4') return checkFours(letter, placesArr);
  if (letter === 'd') return checkDs(number, placesArr);
  let countLetter = 0;
  let countNum = 0;
  for (let i = 0; i < placesArr.length; i++) {
    const curr = placesArr[i];
    if (curr[0] === letter) countLetter++;
    if (curr[1] === number) countNum++;
  }
  if (countLetter === 2 || countNum === 2) return true;

  return false;
}

const connectedMap = {
  a7: ['d7', 'a4'],
  d7: ['a7', 'g7', 'd6'],
  g7: ['d7', 'g4'],
  b6: ['d6', 'b4'],
  d6: ['d7', 'b6', 'f6', 'd5'],
  f6: ['d6', 'f4'],
  c5: ['d5', 'c4'],
  d5: ['c5', 'd6', 'e5'],
  e5: ['d5', 'e4'],
  a4: ['a7', 'b4', 'a1'],
  b4: ['a4', 'b6', 'b2', 'c4'],
  c4: ['b4', 'c5', 'c3'],
  e4: ['e5', 'f4', 'e3'],
  f4: ['e4', 'f6', 'f2', 'g4'],
  g4: ['f4', 'g7', 'g1'],
  c3: ['c4', 'd3'],
  d3: ['c3', 'd2', 'e3'],
  e3: ['d3', 'e4'],
  b2: ['b4', 'd2'],
  d2: ['d3', 'b2', 'f2', 'd1'],
  f2: ['d2', 'f4'],
  a1: ['a4', 'd1'],
  d1: ['a1', 'd2', 'g1'],
  g1: ['d1', 'g4'],
};
const keyboardFocusMoveMap = {
  a7: {
    ArrowUp: 'a1',
    ArrowRight: 'd7',
    ArrowDown: 'a4',
    ArrowLeft: 'g7',
  },
  d7: {
    ArrowUp: 'd1',
    ArrowRight: 'g7',
    ArrowDown: 'd6',
    ArrowLeft: 'a7',
  },
  g7: {
    ArrowUp: 'g1',
    ArrowRight: 'a7',
    ArrowDown: 'g4',
    ArrowLeft: 'd7',
  },
  b6: {
    ArrowUp: 'a7',
    ArrowRight: 'd6',
    ArrowDown: 'b4',
    ArrowLeft: 'a7',
  },
  d6: {
    ArrowUp: 'd7',
    ArrowRight: 'f6',
    ArrowDown: 'd5',
    ArrowLeft: 'b6',
  },
  f6: {
    ArrowUp: 'g7',
    ArrowRight: 'g7',
    ArrowDown: 'f4',
    ArrowLeft: 'd6',
  },
  c5: {
    ArrowUp: 'b6',
    ArrowRight: 'd5',
    ArrowDown: 'c4',
    ArrowLeft: 'b6',
  },
  d5: {
    ArrowUp: 'd6',
    ArrowRight: 'e5',
    ArrowDown: 'd3',
    ArrowLeft: 'c5',
  },
  e5: {
    ArrowUp: 'f6',
    ArrowRight: 'f6',
    ArrowDown: 'e4',
    ArrowLeft: 'd5',
  },
  a4: {
    ArrowUp: 'a7',
    ArrowRight: 'b4',
    ArrowDown: 'a1',
    ArrowLeft: 'g4',
  },
  b4: {
    ArrowUp: 'b6',
    ArrowRight: 'c4',
    ArrowDown: 'b2',
    ArrowLeft: 'a4',
  },
  c4: {
    ArrowUp: 'c5',
    ArrowRight: 'e4',
    ArrowDown: 'c3',
    ArrowLeft: 'b4',
  },
  e4: {
    ArrowUp: 'e5',
    ArrowRight: 'f4',
    ArrowDown: 'e3',
    ArrowLeft: 'c4',
  },
  f4: {
    ArrowUp: 'f6',
    ArrowRight: 'g4',
    ArrowDown: 'f2',
    ArrowLeft: 'e4',
  },
  g4: {
    ArrowUp: 'g7',
    ArrowRight: 'a4',
    ArrowDown: 'g1',
    ArrowLeft: 'f4',
  },
  c3: {
    ArrowUp: 'c4',
    ArrowRight: 'd3',
    ArrowDown: 'b2',
    ArrowLeft: 'b2',
  },
  d3: {
    ArrowUp: 'd5',
    ArrowRight: 'e3',
    ArrowDown: 'd2',
    ArrowLeft: 'c3',
  },
  e3: {
    ArrowUp: 'e4',
    ArrowRight: 'f2',
    ArrowDown: 'f2',
    ArrowLeft: 'd3',
  },
  b2: {
    ArrowUp: 'b4',
    ArrowRight: 'd2',
    ArrowDown: 'a1',
    ArrowLeft: 'a1',
  },
  d2: {
    ArrowUp: 'd3',
    ArrowRight: 'f2',
    ArrowDown: 'd1',
    ArrowLeft: 'b2',
  },
  f2: {
    ArrowUp: 'f4',
    ArrowRight: 'g1',
    ArrowDown: 'g1',
    ArrowLeft: 'd2',
  },
  a1: {
    ArrowUp: 'a4',
    ArrowRight: 'd1',
    ArrowDown: 'a7',
    ArrowLeft: 'g1',
  },
  d1: {
    ArrowUp: 'd2',
    ArrowRight: 'g1',
    ArrowDown: 'd7',
    ArrowLeft: 'a1',
  },
  g1: {
    ArrowUp: 'g4',
    ArrowRight: 'a1',
    ArrowDown: 'g7',
    ArrowLeft: 'd1',
  },
};

const lToi = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
};

export { checkIsMill, connectedMap, keyboardFocusMoveMap, lToi };
