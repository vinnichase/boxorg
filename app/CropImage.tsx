import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import ImageEditor from '@react-native-community/image-editor';
import { ImagePickerAsset } from 'expo-image-picker';
import { getSquareDimensions } from './util/getSquareDimensions';

type CropImageProps = {
    image: ImagePickerAsset;
    // x, y, width, height
    rect: [number, number, number, number];
};

const CropImage = ({ image, rect }: CropImageProps) => {
    const [croppedImage, setCroppedImage] = useState<string | null>(null);

    useEffect(() => {
        const crop = async () => {
            const cropped = await cropImage(image, rect);
            setCroppedImage(cropped.uri);
        };
        crop();
    }, [image, rect]);

    return croppedImage && <Image source={{ uri: croppedImage }} style={{ width: 200, height: 200 }} />;
};

const cropImage = async (image: ImagePickerAsset, rect: [number, number, number, number]) => {
    const uri = `data:image/png;base64,${image.base64}`;

    // const [x, y, w, h] = [162, 0, 2781, 2781];
    const [x, y, w, h] = getSquareDimensions(...rect, image.width, image.height);

    const cropped = await ImageEditor.cropImage(uri, {
        offset: { x, y },
        size: { width: w, height: h },
        displaySize: { width: 1000, height: 1000 },
        resizeMode: 'contain',
        // format: 'png',
        quality: 0.3,
    });

    return cropped;
};

export default CropImage;
