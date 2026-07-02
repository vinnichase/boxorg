import { atom } from '@gothub-team/got-atom';
import { makeMutable } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

type PullDownGestureState = {
    progress: SharedValue<number>;
};

export const SearchPullDownGestureAtom = atom<PullDownGestureState>({
    progress: makeMutable(1),
});
