/**
 * Get square dimensions with 5% padding but without moving the crop area outside the image
 */
export const getSquareDimensions = (x: number, y: number, w: number, h: number, maxw: number, maxh: number) => {
    // 1. Determine the base side using the larger of the rectangle's dimensions.
    const baseSide = Math.max(w, h);

    // 2. Increase the side by 5%.
    let side = baseSide * 1.05;

    // 3. Clamp the side so it does not exceed the shorter edge of the image.
    side = Math.min(side, Math.min(maxw, maxh));

    // 4. Center the square relative to the original rectangular selection.
    let newX = x + (w - side) / 2;
    let newY = y + (h - side) / 2;

    // 5. Clamp the square's position so it remains fully within the image boundaries.
    newX = Math.max(0, Math.min(newX, maxw - side));
    newY = Math.max(0, Math.min(newY, maxh - side));

    return [newX, newY, side, side];
};
