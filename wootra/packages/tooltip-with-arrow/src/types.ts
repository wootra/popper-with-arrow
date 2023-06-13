import { Placement } from "@popperjs/core";
import { ReactElement } from "react";
import { steps } from "./consts";

export type AnimationSteps = (typeof steps)[number];

export type AnimiationActions = "show" | "hide";
export type AnimationState = {
  curr: AnimationSteps;
  prev: AnimationSteps;
  forward: boolean | null;
};

export type ContentStyleOverridesFilled = {
  singleLine: boolean;
  defaultList: boolean; // make list's style to be pretty
  defaultText: boolean;
  defaultLink: boolean;
};

export type ContentStyleOverrides = Partial<ContentStyleOverridesFilled>;

export type ArrowStyleOverridesFilled = {
  arrowElement: (placement?: Placement) => ReactElement;
  arrowWidth: number;
  offsetToArrow: number;
  paddingOnBox: number;
};

export type ArrowStyleOverrides = Partial<ArrowStyleOverridesFilled>;
