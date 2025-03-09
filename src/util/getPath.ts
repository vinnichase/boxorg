export const getPath = <TInput extends Record<string, unknown>, TRes>(
    fallback: TRes | undefined,
    path: (string | number)[],
    input: TInput | undefined,
): TRes | undefined => {
    if (!input) return fallback;

    try {
        let current: any = input;
        for (const key of path) {
            // Ensure current is not null or undefined, and that it has the key
            if (current != null && key in current) {
                current = current[key];
            } else {
                return fallback;
            }
        }
        return current as TRes;
    } catch {
        return fallback;
    }
};
