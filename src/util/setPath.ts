export const setPath = <TInput extends Record<string, unknown>, TVal, TPath extends (string | number)[]>(
    path: TPath,
    val: TVal,
    input: TInput,
): TPath['length'] extends 0 ? TVal : TInput => {
    if (path.length === 0) {
        return val as TPath['length'] extends 0 ? TVal : TInput;
    }

    let current: any = input;

    for (let i = 0; i < path.length - 1; i += 1) {
        const key = path[i];
        const nextKey = path[i + 1];

        // If there is no value at the current key, create one.
        if (current[key] === undefined) {
            // If the next key is a number, we want an array; otherwise, an object.
            current[key] = typeof nextKey === 'number' ? [] : {};
        }
        current = current[key];
    }

    // Set the value at the last key (which might be a string or a number).
    current[path[path.length - 1]] = val;

    return input as TPath['length'] extends 0 ? TVal : TInput;
};
