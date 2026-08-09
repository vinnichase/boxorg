import { Keyboard, TouchableOpacity, useWindowDimensions } from 'react-native';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';
import { useAtom } from '@gothub-team/got-atom';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { SearchPullDownGestureAtom } from '../atoms/PullDownGestureAtom';
import { usePullDownBehavior } from '../hooks/usePullDownBehavior';
import { SEARCH_OPEN_TOP_RATIO, WHITE } from '../util/constants';
import { CloseDownIcon } from './Icons';

export const SearchCloseCaret = () => {
    const focus = useAtom(HomeFocusAtom);
    const { height: windowHeight } = useWindowDimensions();
    const visible = focus === 'search';
    const searchPullDownBehavior = usePullDownBehavior(SearchPullDownGestureAtom);

    return (
        <Reanimated.View
            pointerEvents={visible ? 'box-none' : 'none'}
            style={[
                {
                    position: 'absolute',
                    top: windowHeight * SEARCH_OPEN_TOP_RATIO - 50,
                    width: '100%',
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                useAnimatedStyle(() => {
                    const fadeProgress = Math.min(Math.max(searchPullDownBehavior.progress.value / 0.3, 0), 1);

                    return {
                        opacity: visible ? 0.6 * (1 - fadeProgress) : 0,
                    };
                }),
            ]}
        >
            <TouchableOpacity
                style={{
                    width: 50,
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onPress={() => {
                    searchPullDownBehavior.actions.complete();
                    HomeFocusAtom.set('none');
                    Keyboard.dismiss();
                }}
            >
                <CloseDownIcon color1={WHITE} />
            </TouchableOpacity>
        </Reanimated.View>
    );
};
