import { useEffect, useState } from 'react';
import { View, Image, Button } from 'react-native';
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

const getSquareDimensions = (x: number, y: number, w: number, h: number) => {
    const size = Math.max(w, h);
    return [x + (w - size) / 2, y + (h - size) / 2, size, size];
};

export default CropImage;
