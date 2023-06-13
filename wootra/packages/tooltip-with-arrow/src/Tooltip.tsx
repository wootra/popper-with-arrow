import React, { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";

import { Placement } from "@popperjs/core";
import { createDebounce } from "debounce";
import { usePopper } from "react-popper";
import { useTooltipAnimation } from "./useTooltipAnimation";
import "./twa-popper.scss";
import {
  ArrowStyleOverrides,
  ArrowStyleOverridesFilled,
  ContentStyleOverrides,
  ContentStyleOverridesFilled,
} from "./types";
import { AnimationOptions, Props } from "./props";

const startPlacements: Placement[] = ["bottom-start", "top-start"];
const endPlacements: Placement[] = ["bottom-end", "top-end"];
const topPlacements: Placement[] = ["top", "top-start", "top-end"];

let defaultClassName = "twa-popper";
const arrowDefaultStyle: ArrowStyleOverridesFilled = {
  arrowWidth: 24,
  offsetToArrow: 12,
  paddingOnBox: 12,
  arrowElement: () => (
    <svg data-default-arrow={true} role="presentation" viewBox="-13 -13 26 15">
      <path d="M-12,0 L0,-12 L12,0" />
      <rect x="-12" y="-1" width="26" height="2" />
    </svg>
  ),
};
const defaultAnimationOptions: AnimationOptions = {
  showTransitionDuration: 1000,
  hideTransitionDuration: 300,
  showTransitionDelay: 300,
  hideTransitionDelay: 0,
  useAutoTransitionStyle: true,
};

export const setDefaultTooltipClass = (className = "twa-popper") => {
  defaultClassName = className;
};

export const setDefaultArrowStyle = (arrowStyle: ArrowStyleOverrides) => {
  Object.assign(arrowDefaultStyle, arrowStyle);
};

const TwaTooltip = React.memo((props: Props) => {
  const {
    triggerRef,
    triggerDepth = 0,
    body,
    placement = "bottom-start",
    forceDisplay = false,
    style: styleOverride,
    clickable = false,
    contentStyles = {} as ContentStyleOverrides,
    arrowStyleOverride = {} as ArrowStyleOverrides,
    tooltipClassName = defaultClassName, //use default style
    animationOptions: animationOptionsFromProps = {} as AnimationOptions,
    children,
  } = props;
  const animationOptions = {
    ...defaultAnimationOptions,
    ...animationOptionsFromProps,
  };
  const { singleLine, defaultList, defaultLink, defaultText } = {
    singleLine: false,
    defaultLink: true,
    defaultText: true,
    defaultList: true, // make list's style to be pretty
    ...contentStyles,
  } as ContentStyleOverridesFilled;

  const { arrowElement, arrowWidth, offsetToArrow, paddingOnBox } = {
    ...arrowDefaultStyle,
    ...arrowStyleOverride,
  } as ArrowStyleOverridesFilled;
  const [offsetElement, setOffsetElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const visibleValueRef = useRef(false);
  const mouseIsInBoundaryRef = useRef(false);
  const placementRef = useRef(placement);

  const [currPlacement, setCurrPlacement] = useState(placement);
  const offset = useMemo<[number, number]>(() => {
    placementRef.current = currPlacement;
    return [
      startPlacements.includes(currPlacement)
        ? -arrowWidth
        : endPlacements.includes(currPlacement)
          ? arrowWidth
          : 0,
      offsetToArrow,
    ];
  }, [arrowWidth, currPlacement, offsetToArrow]);

  const { animationState, showTooltip, hideTooltip } =
    useTooltipAnimation(animationOptions);

  const { curr, forward } = animationState;

  visibleValueRef.current = curr !== "no-display"; // syncronize state to approach visible without affecting re-render

  const { styles, attributes, state } = usePopper(
    offsetElement,
    popperElement,
    {
      placement,
      strategy: "fixed",

      modifiers: [
        {
          name: "arrow",
          options: {
            padding: paddingOnBox,
          },
        },
        {
          name: "offset",
          options: {
            offset: offset,
          },
        },
        {
          name: "hide",
          data: {
            isReferenceHidden: curr === "no-display",
            hasPopperEscaped: curr === "no-display",
          },
        },
        { name: "applyStyles" },
      ],
    }
  );

  useEffect(() => {
    if (state?.placement) {
      setCurrPlacement(state.placement as Placement);
    }
  }, [state?.placement]);

  useEffect(() => {
    if (popperElement) {
      const { trigger, offsetHolder } = getTooltipElements(
        popperElement,
        triggerRef,
        triggerDepth
      );

      setOffsetElement(offsetHolder);

      const mouseMoveHandlerSource = (e: MouseEvent) => {
        const x = e.clientX;
        const y = e.clientY;
        const tr = trigger!.getClientRects()[0];
        const buffer = 10; // buffer is required to ensure margin of the boundary since the area does not match exactly occuring an early hide state.
        if (clickable) {
          const pr = popperElement.getClientRects()[0];

          if (
            isOutOfBoundary(x, y, tr, buffer) &&
            isOutOfBoundary(x, y, pr, buffer)
          ) {
            closeTooltip();
          }
        } else {
          if (isOutOfBoundary(x, y, tr, buffer)) {
            closeTooltip();
          }
        }
      };
      const { debounce: mouseMoveHandler, reset } = createDebounce(
        mouseMoveHandlerSource,
        30,
        0
      );

      const closeTooltip = () => {
        mouseIsInBoundaryRef.current = false;
        document.body.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("message", onOtherTooltipOpen);
        window.removeEventListener(
          "close-existing-tooltips",
          onOtherTooltipOpen
        );
        hideTooltip();
        reset();
      };

      const onOtherTooltipOpen = (e: Event) => {
        if (e.type === "close-existing-tooltips") {
          closeTooltip();
        }
      };

      const doWhenMouseEnter = () => {
        window.dispatchEvent(new Event("close-existing-tooltips"));
        showTooltip();
        document.body.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("close-existing-tooltips", onOtherTooltipOpen);
      };
      const mounseEnterHandler = (e: MouseEvent) => {
        if (e.target === e.currentTarget) {
          mouseIsInBoundaryRef.current = true;
          // prevent this is triggered when it is hidden
          doWhenMouseEnter();
        }
      };

      trigger!.addEventListener("mouseenter", mounseEnterHandler);
      if (mouseIsInBoundaryRef.current) {
        // for when tooltip is remounted.
        doWhenMouseEnter();
      }
      return () => {
        trigger?.removeEventListener("mouseenter", mounseEnterHandler);
        document.body.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("message", onOtherTooltipOpen);
        window.removeEventListener(
          "close-existing-tooltips",
          onOtherTooltipOpen
        );
        reset();
      };
    }
  }, [
    popperElement,
    triggerDepth,
    clickable,
    triggerRef,
    showTooltip,
    hideTooltip,
  ]);
  const arrowPlace = topPlacements.includes(placement) ? "top" : "bottom";
  const {
    showTransitionDuration,
    hideTransitionDuration,
    showTransitionDelay,
    hideTransitionDelay,
    useAutoTransitionStyle,
  } = animationOptions;
  const popperProps = {
    ...attributes.popper,
    className: [
      attributes.popper?.className,
      tooltipClassName,
      curr,
      forward !== null ? (forward ? "forward" : "backwrad") : "",
    ].join(" "),
    style: {
      ...(styles.popper as Partial<CSSProperties>),
      ...((curr === "no-display"
        ? { display: "none" }
        : {}) as Partial<CSSProperties>),
      ...(styleOverride || {}),
      ...(useAutoTransitionStyle &&
        forward !== null && {
        opacity: curr === "display-opacity-1" ? 1 : 0,
        transitionDuration: `${
          forward ? showTransitionDuration : hideTransitionDuration
        }ms`,
        ...(arrowPlace !== "top"
          ? { marginTop: curr === "display-opacity-0" ? `${10}px` : `${0}px` }
          : {
            marginBottom:
                  curr === "display-opacity-0" ? `${10}px` : `${0}px`,
          }),
        transitionProperty: "opacity, margin-top, margin-bottom",
        transitionDelay: `${
          forward ? showTransitionDelay : hideTransitionDelay
        }ms}`,
        msTransitionTimingFunction: "linear",
      }),
    } as Partial<CSSProperties>,
  };

  const bodyClassNames = [
    clickable && "clickable",
    defaultList && "default-list",
    defaultText && "default-text",
    defaultLink && "default-link",
    singleLine && "single-line",
  ]
    .filter(Boolean)
    .join(" ");

  return body || children ? (
    <div
      ref={(ref) => setPopperElement(ref)}
      {...popperProps}
      data-force-display={forceDisplay}
      data-testid="twa"
      data-twa
    >
      <div
        className={["arrow", arrowPlace].join(" ")}
        data-popper-arrow
        style={{ ...styles.arrow }}
      >
        {arrowElement(currPlacement)}
      </div>
      {!children && typeof body === "string" && (
        <div
          data-tooltip-body
          className={bodyClassNames}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}
      {!children && typeof body !== "string" && !!body && (
        <div data-tooltip-body className={bodyClassNames}>
          {body}
        </div>
      )}
      {children}
    </div>
  ) : null;
});
TwaTooltip.displayName = "TwaTooltip";

export default TwaTooltip;

const isOutOfBoundary = (
  x: number,
  y: number,
  rect: DOMRect,
  buffer: number
) => {
  return (
    rect &&
    (x < rect.left - buffer ||
      y < rect.top - buffer ||
      x > rect.right + buffer ||
      y > rect.bottom + buffer)
  );
};

const getTooltipElements = (
  popperElement: HTMLElement,
  triggerRef: RefObject<HTMLElement | null> | undefined,
  triggerDepth: number
) => {
  let offsetHolder: HTMLElement | null =
    (popperElement.previousElementSibling as HTMLElement) || null;

  let trigger: HTMLElement | null;
  if (!!triggerRef && triggerRef.current) {
    trigger = triggerRef.current;
  } else if (triggerDepth > 0) {
    trigger = popperElement.parentElement!;
    let depths = triggerDepth;
    while (depths > 1) {
      trigger = trigger.parentElement!;
      depths--;
    }
  } else {
    if (offsetHolder) {
      trigger = offsetHolder!;
    } else {
      throw new Error(
        "offset holder is an element above the tooltip element. if you want to set trigger something else, set triggerDepth>0 or set triggerRef"
      );
    }
  }
  offsetHolder = offsetHolder || trigger;

  return { trigger, offsetHolder };
};
