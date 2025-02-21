import { BLACK, PURPLE_MID, WHITE } from '../util/constants';
import { Animated, View } from 'react-native';
import { useState } from 'react';

type AnimatedViewProps = Parameters<typeof Animated.View>[0];
type MainInputBoxProps = {
    children?: React.ReactNode;
} & AnimatedViewProps;
export const MainInputBox = ({ children, style, ...props }: MainInputBoxProps) => (
    <Animated.View
        style={{
            height: 65,
            marginHorizontal: 30,
            padding: 4,
            backgroundColor: WHITE,
            opacity: 0.9,
            boxShadow: `0 0 100px 10px ${BLACK}44`,
            borderRadius: 20,
            ...(typeof style === 'object' ? style : {}),
        }}
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
    </Animated.View>
);
