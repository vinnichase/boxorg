import ImageEditor from '@react-native-community/image-editor';

export const cropImage = async (
    image: { uri: string; width: number; height: number },
    [x, y, w, h]: [number, number, number, number],
) => {
    const cropped = await ImageEditor.cropImage(image.uri, {
        offset: { x, y },
        size: { width: w, height: h },
        displaySize: { width: 1000, height: 1000 },
        resizeMode: 'contain',
        quality: 0.3,
    });

    return cropped;
};
