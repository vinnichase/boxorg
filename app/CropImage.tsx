import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import ImageEditor from '@react-native-community/image-editor';
import { ImagePickerAsset } from 'expo-image-picker';

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

/**
 * Get square dimensions with 5% padding but without moving the crop area outside the image
 */
const getSquareDimensions = (x: number, y: number, w: number, h: number, maxw: number, maxh: number) => {
    const padding = 0.05;
    const size = Math.max(w, h);
    const paddedSize = size + size * padding;
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const paddedX = Math.min(Math.max(0, centerX - paddedSize / 2));
    const paddedY = Math.min(Math.max(0, centerY - paddedSize / 2));
    console.log({ x, y, w, h });
    console.log(
        { maxw, maxh, size, paddedSize, paddedX, paddedY, centerX, centerY },
        maxw - paddedSize,
        maxh - paddedSize,
    );

    return [x, y, w, h];
};

export default CropImage;
