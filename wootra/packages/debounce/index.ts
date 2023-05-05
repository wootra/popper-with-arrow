type DebounceStore = {
    executedTime: number;
    id: ReturnType<typeof setTimeout> | 0;
    timeInMs: number;
    cb: (...args: any[]) => void;
    savedArgs: any[];
    count: number;
};

export const createDebounce = (
    cb: (...args: any[]) => void,
    timeInMs: number,
    avoidCount = 0
) => {
    const store: DebounceStore = {
        executedTime: -1,
        id: 0,
        timeInMs,
        cb,
        savedArgs: [] as any[],
        count: 0,
    };

    const execute = () => {
        if (store.id) clearTimeout(store.id);
        if (
            store.executedTime < 0 ||
            Date.now() - store.executedTime > store.timeInMs
        ) {
            store.executedTime = Date.now();
            if (avoidCount <= store.count) {
                store.cb(...store.savedArgs);
            }
            store.savedArgs = [];
            store.count++;
            return true;
        }
        return false;
    };

    const debounce = (...args: any[]) => {
        store.savedArgs = args;
        if (!execute()) {
            store.id = setTimeout(execute, store.timeInMs);
        }
    };

    const reset = () => {
        if (store.id) clearTimeout(store.id);
        store.executedTime = -1;
        store.count = 0;
        store.id = 0;
    };

    return {
        debounce,
        reset,
    };
};
