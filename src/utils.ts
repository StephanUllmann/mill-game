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

export { checkIsMill, connectedMap };
