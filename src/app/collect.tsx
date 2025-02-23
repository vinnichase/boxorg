import React from 'react';
import { Text, View } from 'react-native';
import { PURPLE_DARK } from '../util/constants';

function App(): JSX.Element {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: PURPLE_DARK,
            }}
        >
            <Text>Hallo</Text>
        </View>
    );
}

export default App;
