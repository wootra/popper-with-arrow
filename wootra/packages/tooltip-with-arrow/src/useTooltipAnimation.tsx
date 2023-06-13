import { useCallback, useEffect, useReducer, useRef } from "react";
import { AnimationState, AnimiationActions } from "./types";
import { AnimationOptions } from "./props";
import { steps } from "./consts";

const animationReducer = (
  state: AnimationState,
  action: AnimiationActions
): AnimationState => {
  const currIndex = steps.indexOf(state.curr);
  switch (action) {
  case "show": {
    const nextIdx = currIndex + 1;
    if (nextIdx < steps.length - 1) {
      return {
        curr: steps[nextIdx],
        prev: state.curr,
        forward: true,
      };
    } else {
      if (state.curr !== state.prev) {
        return {
          curr: "display-stable",
          prev: "display-stable",
          forward: null,
        };
      }
    }
    break;
  }

  case "hide": {
    const nextIdx = currIndex - 1;
    if (nextIdx >= 0) {
      return {
        curr: steps[nextIdx],
        prev: state.curr,
        forward: false,
      };
    } else {
      if (state.curr !== state.prev) {
        return {
          curr: "no-display",
          prev: "no-display",
          forward: null,
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

export const useTooltipAnimation = (animationOptions: AnimationOptions) => {
  const {
    hideTransitionDelay,
    hideTransitionDuration,
    showTransitionDelay,
    showTransitionDuration,
  } = animationOptions;
  const [animationState, animationDispatch] = useReducer(animationReducer, {
    curr: "no-display",
    prev: "no-display",
    forward: null,
  });
  const id = useRef<null | ReturnType<typeof setTimeout>>(null);
  const updateTimeout = useCallback((cb: (() => void) | null, timeInMs = 0) => {
    if (id.current) {
      clearTimeout(id.current);
      id.current = null;
    }
    id.current = cb ? setTimeout(cb, timeInMs) : null;
  }, []);
  const { curr, forward } = animationState;
  useEffect(() => {
    if (forward !== null) {
      if (forward) {
        if (curr === "display-opacity-0") {
          updateTimeout(() => {
            animationDispatch("show");
          }, showTransitionDelay);
        } else if (curr === "display-opacity-1") {
          updateTimeout(() => {
            animationDispatch("show");
          }, showTransitionDuration);
        } else if (curr === "display-stable") {
          //animationDispatch("show"); //make it stable.
        }
      } else {
        if (curr === "display-opacity-1") {
          updateTimeout(() => {
            animationDispatch("hide");
          }, hideTransitionDelay);
        } else if (curr === "display-opacity-0") {
          updateTimeout(() => {
            animationDispatch("hide");
          }, hideTransitionDuration);
        } else if (curr === "no-display") {
          //animationDispatch("hide"); // make it stable
        }
      }
    } else {
      updateTimeout(null);
    }
  }, [
    curr,
    updateTimeout,
    hideTransitionDelay,
    hideTransitionDuration,
    showTransitionDelay,
    showTransitionDuration,
    forward,
  ]);
  const showTooltip = useCallback(() => {
    if (forward !== true) updateTimeout(() => animationDispatch("show"), 0);
  }, [forward, updateTimeout]);
  const hideTooltip = useCallback(() => {
    if (forward !== false) updateTimeout(() => animationDispatch("hide"), 0);
  }, [forward, updateTimeout]);
  return { animationState, showTooltip, hideTooltip };
};
