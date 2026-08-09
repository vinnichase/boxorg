import { Image, Text, TouchableOpacity, View } from 'react-native';
import { BLACK, PURPLE_DARK, PURPLE_MID, RED, WHITE } from '../util/constants';
import { BackIcon, CrossIcon } from './Icons';

const BORDER_WIDTH = 3;
const BOX_BADGE_SIZE = 40;
const BOX_BADGE_OFFSET = 10;

type ObjectTileProps = {
    width: number;
    tags: string[];
    deleted: boolean;
    boxId?: number;
    imageUri?: string;
    onEdit?: () => void;
    onDeleted?: (deleted: boolean) => void;
};

export const ObjectTile = ({
    imageUri,
    deleted,
    tags,
    width,
    boxId,
    onEdit = () => {},
    onDeleted = () => {},
}: ObjectTileProps) => {
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
                        backgroundColor: BLACK,
                        overflow: 'hidden',
                    }}
                >
                    {imageUri && (
                        <Image
                            source={{ uri: imageUri }}
                            style={{ width, height: width, top: -BORDER_WIDTH, left: -BORDER_WIDTH }}
                        ></Image>
                    )}
                </View>
                {boxId !== undefined && (
                    <View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            top: width - BOX_BADGE_SIZE - BOX_BADGE_OFFSET,
                            right: BOX_BADGE_OFFSET,
                            backgroundColor: `${WHITE}66`,
                            padding: 5,
                            aspectRatio: 1,
                            width: BOX_BADGE_SIZE,
                            height: BOX_BADGE_SIZE,
                            borderRadius: BOX_BADGE_SIZE / 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            shadowColor: `${BLACK}`,
                            shadowOpacity: 1,
                            shadowRadius: 10,
                        }}
                    >
                        <Text style={{ fontSize: 25, color: PURPLE_DARK, fontWeight: 600, opacity: 0.9 }}>
                            {boxId}
                        </Text>
                    </View>
                )}
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
