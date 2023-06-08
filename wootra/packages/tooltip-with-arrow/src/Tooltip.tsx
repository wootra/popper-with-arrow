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
import { Props } from "./props";

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
    children,
  } = props;

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

  const { animationState, showTooltip, hideTooltip } = useTooltipAnimation();

  useEffect(() => {
    visibleValueRef.current = animationState.curr !== "no-display"; // syncronize state to approach visible without affecting re-render
  }, [animationState]);

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
            isReferenceHidden: animationState.curr === "no-display",
            hasPopperEscaped: animationState.curr === "no-display",
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

      const { debounce: mouseMoveHandler, reset } = createDebounce(
        (e: MouseEvent) => {
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
              window.dispatchEvent(new Event("close-existing-tooltips"));
            } else {
              if (!visibleValueRef.current) {
                showTooltip();
              }
            }
          } else {
            if (isOutOfBoundary(x, y, tr, buffer)) {
              window.dispatchEvent(new Event("close-existing-tooltips"));
            } else {
              if (!visibleValueRef.current) {
                showTooltip();
              }
            }
          }
        },
        250,
        1
      );

      const closeTooltip = () => {
        hideTooltip();
        reset();
        visibleValueRef.current = false;
        document.body.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("message", onOtherTooltipOpen);
        window.removeEventListener(
          "close-existing-tooltips",
          onOtherTooltipOpen
        );
      };

      const onOtherTooltipOpen = (e: Event) => {
        if (e.type === "close-existing-tooltips") {
          closeTooltip();
        }
      };

      const mounseEnterHandler = (e: MouseEvent) => {
        if (e.target === e.currentTarget) {
          // prevent this is triggered when it is hidden
          window.dispatchEvent(new Event("close-existing-tooltips"));
          showTooltip();
          document.body.addEventListener("mousemove", mouseMoveHandler);
          window.addEventListener(
            "close-existing-tooltips",
            onOtherTooltipOpen
          );
        }
      };

      trigger!.addEventListener("mouseenter", mounseEnterHandler);

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
    // return () => {};
  }, [
    popperElement,
    triggerDepth,
    clickable,
    triggerRef,
    showTooltip,
    hideTooltip,
  ]);

  const popperProps = {
    ...attributes.popper,
    className: [attributes.popper?.className, tooltipClassName].join(" "),
    style: {
      ...(styles.popper as Partial<CSSProperties>),
      ...((animationState.curr === "no-display"
        ? { display: "none" }
        : {}) as Partial<CSSProperties>),
      ...(styleOverride || {}),
      opacity:
        animationState.curr === "display-opacity-1" ||
        animationState.curr === "display-stable"
          ? 1
          : 0,
      ...(animationState.curr !== "no-display" && {
        transitionDuration: "1s",
        transitionProperty: "opacity",
        transitionDelay: "20ms",
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
        className={[
          "arrow",
          topPlacements.includes(placement) ? "top" : "bottom",
        ].join(" ")}
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
