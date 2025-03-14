export const setPath = <TInput extends Record<string, unknown>, TVal, TPath extends (string | number)[]>(
    path: TPath,
    val: TVal,
    input: TInput,
): TPath['length'] extends 0 ? TVal : TInput => {
    if (path.length === 0) {
        return val as TPath['length'] extends 0 ? TVal : TInput;
    }

    let current: any = JSON.parse(JSON.stringify(input));

    let obj = current;
    for (let i = 0; i < path.length - 1; i += 1) {
        const prop = path[i];
        if (prop in obj) {
            obj = obj[prop];
        } else {
            obj[prop] = {};
            obj = obj[prop];
        }
    }

    const lastProp = path[path.length - 1];
    obj[lastProp] = val;

    return current as TPath['length'] extends 0 ? TVal : TInput;
};
