import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import { cropImage } from '../util/cropImage';
import { PURPLE_MID, RED, WHITE } from '../util/constants';
import { BackIcon, CrossIcon } from './Icons';

const BORDER_WIDTH = 3;

type ObjectTileProps = {
    imageUri: string;
    width: number;
    tags: string[];
    deleted: boolean;
    onEdit?: () => void;
    onDeleted?: (deleted: boolean) => void;
};

export const ObjectTile = ({
    imageUri,
    deleted,
    tags,
    width,
    onEdit = () => {},
    onDeleted = () => {},
}: ObjectTileProps) => (
    <View>
        <TouchableOpacity style={{ gap: 9, opacity: deleted ? 0.35 : 1 }} onPress={() => onEdit()}>
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
                    source={{ uri: imageUri }}
                    style={{ width, height: width, top: -BORDER_WIDTH, left: -BORDER_WIDTH }}
                ></Image>
            </View>
            {tags.map((tag) => (
                <Text key={tag} style={{ width, color: WHITE, fontWeight: 500, paddingHorizontal: 9, opacity: 0.8 }}>
                    {tag.toUpperCase()}
                </Text>
            ))}
        </TouchableOpacity>
        <TouchableOpacity
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: 7 + BORDER_WIDTH,
            }}
            onPress={() => onDeleted(!deleted)}
        >
            <View
                style={{
                    width: 23,
                    height: 23,
                    padding: 4,
                    borderRadius: 7,
                    backgroundColor: WHITE,
                    opacity: deleted ? 0.5 : 0.9,
                }}
            >
                {deleted ? <BackIcon color1={PURPLE_MID} /> : <CrossIcon color1={RED} />}
            </View>
        </TouchableOpacity>
    </View>
);
