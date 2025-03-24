import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import { cropImage } from '../util/cropImage';
import { PURPLE_MID, RED, WHITE } from '../util/constants';
import { BackIcon, CrossIcon } from './Icons';
import { SegmentImageAtom } from '../atoms/SegmentImageAtom';
import { useAtom } from '@gothub-team/got-atom';

const BORDER_WIDTH = 3;

type ObjectTileProps = {
    imageUri: string;
    width: number;
    rect: [number, number, number];
    tags: string[];
    deleted: boolean;
    onEdit?: () => void;
    onDeleted?: (deleted: boolean) => void;
};

export const ObjectTile = ({
    imageUri,
    deleted,
    tags,
    rect: [x, y, w],
    width,
    onEdit = () => {},
    onDeleted = () => {},
}: ObjectTileProps) => {
    const segmentImage = useAtom(SegmentImageAtom);
    const aspectRatio = (segmentImage?.height ?? 1) / (segmentImage?.width ?? 1);
    const imgWidth = width / w;
    const xShift = x * imgWidth;
    const yShift = y * aspectRatio * imgWidth;
    console.log(imgWidth, w, x, y, xShift, yShift);
    console.log('RATIO', aspectRatio);
    return (
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
                        style={{
                            width: imgWidth,
                            height: aspectRatio * imgWidth,
                            top: -BORDER_WIDTH - yShift,
                            left: -BORDER_WIDTH - xShift,
                        }}
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
};
