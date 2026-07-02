import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }} />
            </KeyboardProvider>
        </GestureHandlerRootView>
    );
}
