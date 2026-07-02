import { BLACK, PURPLE_MID, WHITE } from '../util/constants';
import { View } from 'react-native';
import type { ComponentProps, ReactNode } from 'react';
import Reanimated from 'react-native-reanimated';

type MainInputBoxProps = {
    children?: ReactNode;
} & ComponentProps<typeof Reanimated.View>;

export const MainInputBox = ({ children, style, ...props }: MainInputBoxProps) => (
    <Reanimated.View
        style={[
            {
                height: 65,
                marginHorizontal: 30,
                padding: 4,
                backgroundColor: WHITE,
                opacity: 0.9,
                shadowColor: `${BLACK}`,
                shadowOpacity: 1,
                shadowRadius: 30,
                elevation: 5,
                borderRadius: 20,
            },
            style,
        ]}
        {...props}
    >
        <View
            style={{
                flexDirection: 'row',
                width: '100%',
                height: '100%',
                padding: 10,
                borderRadius: 16,
                borderColor: `${PURPLE_MID}dd`,
                borderWidth: 1,
                gap: 10,
            }}
        >
            {children}
        </View>
    </Reanimated.View>
);
