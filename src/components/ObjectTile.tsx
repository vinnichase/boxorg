import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import { cropImage } from '../util/cropImage';
import { WHITE } from '../util/constants';

const BORDER_WIDTH = 3;

type ObjectTileProps = {
    image: ImagePickerAsset;
    // x, y, width, height
    rect: [number, number, number, number];
    width: number;
    tags: string[];
    onPress?: () => void;
};

export const ObjectTile = ({ image, tags, rect, width, onPress = () => {} }: ObjectTileProps) => {
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        const crop = async () => {
            const cropped = await cropImage(image, rect);
            setCroppedImage(cropped.uri);
        };
        crop();
    }, [image, rect]);

    return (
        croppedImage && (
            <View
                style={{ gap: 9, opacity: deleted ? 0.2 : 1 }}
                onTouchEnd={() => {
                    setDeleted((d) => !d);
                    onPress();
                }}
            >
                <View
                    style={{
                        width,
                        height: width,
                        borderColor: `${WHITE}cc`,
                        borderWidth: BORDER_WIDTH,
                        borderRadius: 15,
                        overflow: 'hidden',
                    }}
                >
                    <Image
                        source={{ uri: croppedImage }}
                        style={{ width, height: width, top: -BORDER_WIDTH, left: -BORDER_WIDTH }}
                    ></Image>
                </View>
                {tags.map((tag) => (
                    <Text
                        key={tag}
                        style={{ width, color: WHITE, fontWeight: 500, paddingHorizontal: 9, opacity: 0.8 }}
                    >
                        {tag.toUpperCase()}
                    </Text>
                ))}
            </View>
        )
    );
};
