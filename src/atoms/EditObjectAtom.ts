import { atom } from '@gothub-team/got-atom';
import { ObjectWithTags } from '../db/accessLayer';
import { loadBoxTags } from '../service/boxTags';
import { setPath } from '../util/setPath';

// box_id is optional while editing (cleared input); saving requires it again.
// boxTags holds the box tag drafts per box number entered on the edit screen;
// only the final box's draft is saved with the object
export type EditObject = Omit<ObjectWithTags, 'box_id'> & { box_id?: number; boxTags: Record<number, string[]> };

export const EditObjectAtom = atom<EditObject>({ id: 0, box_id: 0, thumb_path: '', tags: [], boxTags: {} });

// a box number entered on edit pulls the box's saved tags into the draft once
export const loadEditBoxTags = (boxId: number) =>
    EditObjectAtom.set((a) => (a.boxTags[boxId] ? a : setPath(['boxTags', boxId], loadBoxTags(boxId), a)));
