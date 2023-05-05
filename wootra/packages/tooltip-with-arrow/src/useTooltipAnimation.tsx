import { useCallback, useEffect, useReducer, useRef } from 'react';
import { AnimationState, AnimationSteps, AnimiationActions } from './types';

const steps: AnimationSteps[] = [
    'no-display',
    'display-opacity-0',
    'display-opacity-1',
    'display-stable',
];
const animationReducer = (
    state: AnimationState,
    action: AnimiationActions
): AnimationState => {
    const currIndex = steps.indexOf(state.curr);
    switch (action) {
        case 'show': {
            const nextIdx = currIndex + 1;
            if (nextIdx < steps.length - 1) {
                return {
                    curr: steps[nextIdx],
                    prev: state.curr,
                };
            } else {
                if (state.curr !== state.prev) {
                    return {
                        curr: 'display-stable',
                        prev: 'display-stable',
                    };
                }
            }
            break;
        }

        case 'hide': {
            const nextIdx = currIndex - 1;
            if (nextIdx >= 0) {
                return {
                    curr: steps[nextIdx],
                    prev: state.curr,
                };
            } else {
                if (state.curr !== state.prev) {
                    return {
                        curr: 'no-display',
                        prev: 'no-display',
                    };
                }
            }
            break;
        }
        default:
            break;
    }
    return state;
};

export const useTooltipAnimation = () => {
    const [animationState, animationDispatch] = useReducer(animationReducer, {
        curr: 'no-display',
        prev: 'no-display',
    });
    const id = useRef<null | ReturnType<typeof setTimeout>>(null);
    const updateTimeout = useCallback((cb: () => void, timeInMs: number) => {
        if (id.current) {
            clearTimeout(id.current);
            id.current = null;
        }
        id.current = setTimeout(cb, timeInMs);
    }, []);
    useEffect(() => {
        const { curr, prev } = animationState;

        if (curr !== prev) {
            if (prev === 'no-display' && curr === 'display-opacity-0') {
                animationDispatch('show');
            } else if (
                prev === 'display-opacity-0' &&
                curr === 'display-opacity-1'
            ) {
                updateTimeout(() => {
                    animationDispatch('show');
                }, 1000);
            } else if (
                prev === 'display-opacity-1' &&
                curr === 'display-stable'
            ) {
                animationDispatch('show'); //make it stable.
            } else if (
                prev === 'display-stable' &&
                curr === 'display-opacity-1'
            ) {
                animationDispatch('hide');
            } else if (
                prev === 'display-opacity-1' &&
                curr === 'display-opacity-0'
            ) {
                updateTimeout(() => {
                    animationDispatch('hide');
                }, 1000);
            } else if (prev === 'display-opacity-0' && curr === 'no-display') {
                animationDispatch('hide'); // make it stable
            }
        }
    }, [animationState, updateTimeout]);
    const showTooltip = useCallback(() => animationDispatch('show'), []);
    const hideTooltip = useCallback(() => animationDispatch('hide'), []);
    return { animationState, showTooltip, hideTooltip };
};
