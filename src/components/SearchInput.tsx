import { useCallback, useEffect, useRef } from 'react';
import { Keyboard, TextInput, useWindowDimensions } from 'react-native';
import { KeyboardController } from 'react-native-keyboard-controller';
import { GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAtom } from '@gothub-team/got-atom';
import { HomeFocusAtom } from '../atoms/HomeFocusAtom';
import { SearchPullDownGestureAtom } from '../atoms/PullDownGestureAtom';
import { SearchAtom } from '../atoms/SearchAtom';
import { usePullDownBehavior } from '../hooks/usePullDownBehavior';
import { setPath } from '../util/setPath';
import { PURPLE_DARK } from '../util/constants';
import { SearchIcon } from './Icons';
import { MainInputBox } from './MainInputBox';

const SEARCH_OPEN_SHIFT_COMPLEMENT = 0.12;
export const SearchInput = () => {
    const inputRef = useRef<TextInput>(null);
    const focus = useAtom(HomeFocusAtom);
    const search = useAtom(SearchAtom);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const windowRatioComplement = 1 - windowWidth / windowHeight;
    const searchOpenShift = -(windowHeight * (windowRatioComplement - SEARCH_OPEN_SHIFT_COMPLEMENT));
    const pullDistance = Math.max(1, -searchOpenShift);
    const boxSearchActive = search.query.startsWith('#');
    const keyboardType = boxSearchActive ? 'number-pad' : 'default';
    const visibility = useSharedValue(1);

    useEffect(() => {
        if (focus !== 'search') return;

        const frame = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, [focus, keyboardType]);

    useEffect(() => {
        if (focus === 'search') return;

        inputRef.current?.blur();
    }, [focus]);

    const beginSearchPullDown = useCallback(() => {
        void KeyboardController.dismiss({ keepFocus: true, animated: true });
    }, []);

    const cancelSearchPullDown = useCallback(() => {
        inputRef.current?.focus();
        KeyboardController.setFocusTo('current');
        SearchAtom.set((a) => setPath(['show'], true, a));
    }, []);

    const completeSearchPullDown = useCallback(() => {
        inputRef.current?.blur();
        HomeFocusAtom.set('none');
        void KeyboardController.dismiss({ keepFocus: false, animated: true });
        Keyboard.dismiss();
    }, []);

    const searchPullDownBehavior = usePullDownBehavior(SearchPullDownGestureAtom, {
        enabled: focus === 'search',
        distance: pullDistance,
        onBegin: beginSearchPullDown,
        onCancel: cancelSearchPullDown,
        onComplete: completeSearchPullDown,
    });

    useEffect(() => {
        if (focus === 'search') {
            searchPullDownBehavior.actions.reset();
            return;
        }

        searchPullDownBehavior.actions.complete();
    }, [focus, searchPullDownBehavior.actions]);

    useEffect(() => {
        visibility.value = withTiming(focus === 'box' ? 0 : 1, { duration: focus === 'box' ? 200 : 400 });
    }, [focus, visibility]);

    const setSearchQuery = (query: string) => {
        SearchAtom.set((a) => setPath(['query'], query, a));
    };

    const handleChangeText = (text: string) => {
        if (boxSearchActive || text.startsWith('#')) {
            setSearchQuery(text ? `#${text.replace(/\D/g, '')}` : '');
            return;
        }

        setSearchQuery(text);
    };

    return (
        <GestureDetector gesture={searchPullDownBehavior.gesture}>
            <MainInputBox
                style={[
                    {
                        position: 'absolute',
                        width: windowWidth - 60,
                        top: windowHeight * windowRatioComplement * 0.95,
                    },
                    useAnimatedStyle(() => ({
                        opacity: visibility.value,
                        transform: [{ translateY: searchOpenShift * (1 - searchPullDownBehavior.progress.value) }],
                    })),
                ]}
                pointerEvents={focus === 'box' ? 'none' : 'auto'}
            >
                <SearchIcon color1={PURPLE_DARK} />
                <TextInput
                    key={keyboardType}
                    ref={inputRef}
                    value={search.query}
                    keyboardType={keyboardType}
                    style={{
                        flex: 1,
                        height: '100%',
                        fontSize: 25,
                        color: PURPLE_DARK,
                        textAlignVertical: 'center',
                        paddingVertical: 0,
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    onTouchEnd={(e) => e.stopPropagation()}
                    onFocus={() => HomeFocusAtom.set('search')}
                    onChangeText={handleChangeText}
                />
            </MainInputBox>
        </GestureDetector>
    );
};
