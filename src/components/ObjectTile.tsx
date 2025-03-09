import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import { cropImage } from '../util/cropImage';
import { PURPLE_LIGHT, RED, WHITE } from '../util/constants';
import { CrossIcon } from './Icons';

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
            <View style={{ gap: 9 }}>
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
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 23,
                            height: 23,
                            padding: 4,
                            borderRadius: 7,
                            backgroundColor: WHITE,
                            opacity: 0.9,
                        }}
                        onPress={() => {
                            setDeleted((d) => !d);
                            onPress();
                        }}
                    >
                        <CrossIcon color1={RED} />
                    </TouchableOpacity>
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
