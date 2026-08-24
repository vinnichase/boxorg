import { atom } from '@gothub-team/got-atom';
import { ObjectWithTags } from '../db/accessLayer';

// box_id is optional while editing (cleared input); saving requires it again
export type EditObject = Omit<ObjectWithTags, 'box_id'> & { box_id?: number };

export const EditObjectAtom = atom<EditObject>({ id: 0, box_id: 0, thumb_path: '', tags: [] });
