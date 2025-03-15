import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { getObjects, openDb } from '../db/accessLayer';
import { BLACK, PURPLE_DARK, PURPLE_LIGHT, WHITE } from '../util/constants';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MARGIN_TOP = 160;

type SearchResultsProps = {
    show: boolean;
    query: string;
};

type ObjectWithTags = { id: number; thumb_path: string; box_id: number; tags: string[] };

export const SearchResults = ({ show, query }: SearchResultsProps) => {
    const [results, setResults] = useState<ObjectWithTags[]>([]);

    useEffect(() => {
        const db = openDb();
        const records =
            getObjects(db)?.reduce((acc, o) => {
                const accO = acc[o.id] ?? { ...o, tags: [] };
                accO.tags.push(o.tag);
                return {
                    ...acc,
                    [o.id]: accO,
                };
            }, {} as Record<number, ObjectWithTags>) ?? {};
        records && setResults(Object.values(records));
        db.closeSync();
    }, [show, query]);

    const sharedOpacity = useSharedValue(1);

    useEffect(() => {
        sharedOpacity.value = withTiming(show ? 1 : 0, { duration: 250 });
        console.log('show', show, sharedOpacity.value);
    }, [show]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: sharedOpacity.value,
    }));

    return (
        <KeyboardAvoidingView
            behavior="padding"
            style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                overflowY: 'visible',
            }}
            pointerEvents={show ? 'auto' : 'none'}
        >
            <ScrollView style={{ flex: 1, marginTop: MARGIN_TOP, overflow: 'visible' }}>
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
                            <View key={record.id} style={{ height: 100, flexDirection: 'row', gap: 20 }}>
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
                                        source={{ uri: record.thumb_path }}
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
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
