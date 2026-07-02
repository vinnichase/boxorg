import { atom } from '@gothub-team/got-atom';

export type HomeFocusState = 'search' | 'box' | 'none';

export const HomeFocusAtom = atom<HomeFocusState>('none');
