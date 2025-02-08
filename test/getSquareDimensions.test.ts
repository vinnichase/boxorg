import getSquareDimensions from '../app/util/getSquareDimensions';

// top {"maxh": 4032, "maxw": 3024, "h": 539, "w": 2781, "x": 162, "y": 128}
const top = getSquareDimensions(162, 128, 2781, 539, 3024, 4032);
// bottom {"maxh": 4032, "maxw": 3024, "h": 693, "w": 2961, "x": 0, "y": 2904}
const bottom = getSquareDimensions(0, 2904, 2961, 693, 3024, 4032);
// middle {"maxh": 4032, "maxw": 3024, "h": 1729, "w": 2133, "x": 370, "y": 990}
const middle = getSquareDimensions(370, 990, 2133, 1729, 3024, 4032);
// left {"maxh": 4032, "maxw": 3024, "h": 2947, "w": 496, "x": 39, "y": 619}
const left = getSquareDimensions(39, 619, 496, 2947, 3024, 4032);
// right {"maxh": 4032, "maxw": 3024, "h": 2929, "w": 456, "x": 2344, "y": 465}
const right = getSquareDimensions(2344, 465, 456, 2929, 3024, 4032);

console.log('top', top);
console.log('bottom', bottom);
console.log('middle', middle);
console.log('left', left);
console.log('right', right);
