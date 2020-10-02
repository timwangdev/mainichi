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

export function getRandomColor() {
    return COLORLIST[Math.floor(Math.random() * COLORLIST.length)];
}

export default COLORLIST;