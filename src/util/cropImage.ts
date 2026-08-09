import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const cropImage = async (
    image: { uri: string; width: number; height: number },
    [x, y, w, h]: [number, number, number, number],
) => {
    const cropped = await manipulateAsync(
        image.uri,
        [
            { crop: { originX: x, originY: y, width: w, height: h } },
            w >= h ? { resize: { width: 1000 } } : { resize: { height: 1000 } },
        ],
        { compress: 0.3, format: SaveFormat.JPEG },
    );

    return cropped;
};
