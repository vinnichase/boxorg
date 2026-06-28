import { useEffect, useRef } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Image, KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BLACK, PURPLE_DARK, PURPLE_LIGHT, SEARCH_KEYBOARD_TOOLBAR_HEIGHT, WHITE } from '../util/constants';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAtom } from '@gothub-team/got-atom';
import { SearchAtom, SearchResultsAtom } from '../atoms/SearchAtom';
import { EditObjectAtom } from '../atoms/EditObjectAtom';
import { router } from 'expo-router';

const MARGIN_TOP = 160;
const BOTTOM_SPACER_HEIGHT = SEARCH_KEYBOARD_TOOLBAR_HEIGHT * (2 / 3);

type SearchResultsProps = {};

export const SearchResults = ({}: SearchResultsProps) => {
    const { show } = useAtom(SearchAtom);
    const results = useAtom(SearchResultsAtom);

    const sharedOpacity = useSharedValue(0);
    const previousResultCount = useRef(0);

    useEffect(() => {
        const currentResultCount = results.length;

        if (!show) {
            previousResultCount.current = 0;
            sharedOpacity.value = withTiming(0, { duration: 120 });
            return;
        }

        if (currentResultCount === 0) {
            previousResultCount.current = 0;
            sharedOpacity.value = 0;
            return;
        }

        const didLoadFirstResults = previousResultCount.current === 0;
        previousResultCount.current = currentResultCount;

        if (didLoadFirstResults) {
            sharedOpacity.value = 0;
            sharedOpacity.value = withTiming(1, { duration: 250 });
            return;
        }

        sharedOpacity.value = 1;
    }, [results.length, show]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: sharedOpacity.value,
    }));

    return (
        <KeyboardAvoidingView
            behavior="height"
            style={{
                position: 'absolute',
                top: MARGIN_TOP,
                bottom: 0,
                width: '100%',
                overflow: 'visible',
            }}
            pointerEvents={show ? 'auto' : 'none'}
        >
            <ScrollView
                automaticallyAdjustKeyboardInsets={false}
                automaticallyAdjustsScrollIndicatorInsets={false}
                contentInsetAdjustmentBehavior="never"
                keyboardShouldPersistTaps="handled"
                scrollIndicatorInsets={{ top: 0, bottom: BOTTOM_SPACER_HEIGHT }}
                style={{ flex: 1, overflow: 'visible' }}
            >
                <Animated.View style={animatedStyle}>
                    <View
                        style={{
                            gap: 10,
                            paddingHorizontal: 30,
                            paddingBottom: 30,
                            shadowColor: `${PURPLE_LIGHT}`,
                            shadowOpacity: 1,
                            shadowRadius: 20,
                        }}
                    >
                        {results.map((record) => (
                            <TouchableOpacity
                                key={record.id}
                                style={{ height: 100, flexDirection: 'row', gap: 20 }}
                                onPress={() => {
                                    EditObjectAtom.set(record);
                                    router.push('/edit');
                                }}
                            >
                                <View
                                    style={{
                                        overflow: 'hidden',
                                        borderRadius: 10,
                                        width: 100,
                                        height: 100,
                                        borderWidth: 2,
                                        borderColor: WHITE,
                                    }}
                                >
                                    <Image
                                        source={{ uri: FileSystem.documentDirectory + record.thumb_path }}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        maxWidth: '100%',
                                        flexWrap: 'wrap',
                                        gap: 5,
                                        paddingVertical: 5,
                                        // backgroundColor: `#ff000033`,
                                        overflow: 'hidden',
                                        alignItems: 'baseline',
                                        flexDirection: 'row',
                                    }}
                                >
                                    {record.tags.map((tag) => (
                                        <View
                                            key={tag}
                                            style={{ padding: 5, backgroundColor: `${WHITE}22`, borderRadius: 5 }}
                                        >
                                            <Text style={{ color: WHITE }}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        backgroundColor: `${WHITE}66`,
                                        padding: 5,
                                        aspectRatio: 1,
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        shadowColor: `${BLACK}`,
                                        shadowOpacity: 1,
                                        shadowRadius: 10,
                                    }}
                                >
                                    <Text style={{ fontSize: 25, color: PURPLE_DARK, fontWeight: 600, opacity: 0.9 }}>
                                        {record.box_id}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ height: BOTTOM_SPACER_HEIGHT }} />
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
