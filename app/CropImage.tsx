import { useEffect, useState } from 'react';
import { View, Image, Button } from 'react-native';
import ImageEditor from '@react-native-community/image-editor';

type CropImageProps = {
    base64: string;
    rect: [number, number, number, number];
};

const CropImage = ({ base64, rect: [x, y, w, h] }: CropImageProps) => {
    const [croppedImage, setCroppedImage] = useState<string | null>(null);

    const cropImage = async () => {
        const uri = `data:image/png;base64,${base64}`;
        const croppedUri = await ImageEditor.cropImage(uri, {
            offset: { x, y },
            size: { width: w, height: h },
            // displaySize: { width: 200, height: 200 },
            // resizeMode: 'cover',
            // format: 'png',
            quality: 0.3,
        });
        console.log(croppedUri.uri);
        setCroppedImage(croppedUri.uri);
    };

    useEffect(() => {
        cropImage();
    }, [base64, x, y, w, h]);

    return croppedImage && <Image source={{ uri: croppedImage }} style={{ width: 200, height: 200 }} />;
};

export default CropImage;
