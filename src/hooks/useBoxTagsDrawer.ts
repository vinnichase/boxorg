import { useEffect, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

const TOGGLE_DURATION = 250;

// the box tags of a screen sit in a drawer below the header's title row; the
// toggle in the row and the drawer share this state, and the scroll content
// follows the drawer through `progress` and the measured `contentHeight`
// `enabled` is false while the screen has no box number: the drawer closes and
// the toggle is greyed out
export const useBoxTagsDrawer = (hasTags: boolean, enabled: boolean) => {
    const [expanded, setExpanded] = useState(enabled && hasTags);
    const [seen, setSeen] = useState({ hasTags, enabled });
    const progress = useSharedValue(expanded ? 1 : 0);
    const contentHeight = useSharedValue(0);

    // a box that already has tags shows them right away, also when its number
    // is entered later on; closing stays a manual choice
    if (hasTags !== seen.hasTags || enabled !== seen.enabled) {
        setSeen({ hasTags, enabled });
        if (!enabled) setExpanded(false);
        else if (hasTags) setExpanded(true);
    }

    useEffect(() => {
        progress.set(withTiming(expanded ? 1 : 0, { duration: TOGGLE_DURATION }));
    }, [expanded, progress]);

    return { expanded, enabled, progress, contentHeight, toggle: () => setExpanded(!expanded) };
};

export type BoxTagsDrawerState = ReturnType<typeof useBoxTagsDrawer>;
