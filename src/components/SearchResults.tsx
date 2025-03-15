import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { getObjects, ObjectRecord, openDb } from '../db/accessLayer';
import { PURPLE_LIGHT, WHITE } from '../util/constants';

type SearchResultsProps = {
    query: string;
};

export const SearchResults = ({ query }: SearchResultsProps) => {
    const [results, setResults] = useState<ObjectRecord[]>([]);

    useEffect(() => {
        const db = openDb();
        const records = getObjects(db);
        records && setResults(records);
        db.closeSync();
    }, [query]);

    return (
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
                <View key={record.id} style={{ height: 100 }}>
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
                        <Image source={{ uri: record.thumb_path }} style={{ width: '100%', height: '100%' }} />
                    </View>
                </View>
            ))}
        </View>
    );
};
