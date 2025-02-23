import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import { cropImage } from '../util/cropImage';

type ObjectTileProps = {
    image: ImagePickerAsset;
    // x, y, width, height
    rect: [number, number, number, number];
    width: number;
};

export const ObjectTile = ({ image, rect, width }: ObjectTileProps) => {
    const [croppedImage, setCroppedImage] = useState<string | null>(null);

    useEffect(() => {
        const crop = async () => {
            const cropped = await cropImage(image, rect);
            setCroppedImage(cropped.uri);
        };
        crop();
    }, [image, rect]);

    return croppedImage && <Image source={{ uri: croppedImage }} style={{ width, height: width }} />;
};
