import ImageEditor from '@react-native-community/image-editor';
import getSquareDimensions from './getSquareDimensions';
import { ImagePickerAsset } from 'expo-image-picker';

export const cropImage = async (image: ImagePickerAsset, rect: [number, number, number, number]) => {
    const uri = `data:image/png;base64,${image.base64}`;

    const [x, y, w, h] = getSquareDimensions(...rect, image.width, image.height);

    const cropped = await ImageEditor.cropImage(uri, {
        offset: { x, y },
        size: { width: w, height: h },
        displaySize: { width: 1000, height: 1000 },
        resizeMode: 'contain',
        quality: 0.3,
    });

    return cropped;
};
