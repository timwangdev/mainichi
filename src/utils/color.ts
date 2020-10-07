const COLORLIST = [
    '#ffa2a5',
    '#fda46f',
    '#ffff79',
    '#9af996',
    '#a3ffed',
    '#84c6f4',
    '#beb4ff',
    '#d89bde'
];

let currentColorIdx;

export function getRandomColor() {
    if (currentColorIdx == null) {
        currentColorIdx = Math.floor(Math.random() * COLORLIST.length);
    }
    return COLORLIST[currentColorIdx];
}

export function getNextColor() {
    if (currentColorIdx == null) {
        currentColorIdx = Math.floor(Math.random() * COLORLIST.length);
    } else if (currentColorIdx === COLORLIST.length - 1) {
        currentColorIdx = 0;
    } else {
        currentColorIdx += 1;
    }
    console.log(currentColorIdx);
    return COLORLIST[currentColorIdx];
}

export default COLORLIST;