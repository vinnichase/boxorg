import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import ImageEditor from '@react-native-community/image-editor';

type CropImageProps = {
    base64: string;
    rect: [number, number, number, number];
};

const CropImage = ({ base64, rect }: CropImageProps) => {
    const [croppedImage, setCroppedImage] = useState<string | null>(null);

    const cropImage = async () => {
        const uri = `data:image/png;base64,${base64}`;

        const [x, y, w, h] = getSquareDimensions(...rect);

        const croppedUri = await ImageEditor.cropImage(uri, {
            offset: { x, y },
            size: { width: w, height: h },
            displaySize: { width: 1000, height: 1000 },
            resizeMode: 'contain',
            // format: 'png',
            quality: 0.3,
        });
        console.log(croppedUri.size);
        setCroppedImage(croppedUri.uri);
    };

    useEffect(() => {
        cropImage();
    }, [base64, rect]);

    return croppedImage && <Image source={{ uri: croppedImage }} style={{ width: 200, height: 200 }} />;
};

/**
 * Get square dimensions with 5% padding but without moving the crop area outside the image
 */
const getSquareDimensions = (x: number, y: number, w: number, h: number) => {
    const padding = 0.05;
    const size = Math.max(w, h);
    const halfSize = size / 2;
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const halfPadding = (size * padding) / 2;
    return [
        Math.max(0, centerX - halfSize - halfPadding),
        Math.max(0, centerY - halfSize - halfPadding),
        size + halfPadding * 2,
        size + halfPadding * 2,
    ];
};

export default CropImage;
