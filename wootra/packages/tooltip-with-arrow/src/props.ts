import { Placement } from '@popperjs/core';
import { ArrowStyleOverrides, ContentStyleOverrides } from './types';
import type {
    CSSProperties,
    ReactElement,
    RefObject,
    PropsWithChildren,
} from 'react';

export type Props = {
    /**
     * default is 0. trigger will be automatically set as the direct previous sibling.
     * if set it > 0, the parent element of this tooltip will become a trigger.
     * i.e. 2 means glandparent of the tooltip element.
     */
    triggerDepth?: number;
    /**
     * if you already have RefObject for the trigger, set it here.
     * triggerDepth will be ignored and this ref will be trigger of the tooltip.
     */
    triggerRef?: RefObject<HTMLElement>;
    /**
     * content of the tooltip. you can add either string or react element on it.
     * if string is html, still will be parsed as html element.
     */
    body?: string | ReactElement;
    /**
     * when true, text content is force to be no-wrap.
     */
    singleLine?: boolean;
    /**
     * currently bottom | bottom-start | bottom-end | top | top-start | top-end is tested.
     * default is bottom-start
     */
    placement?: Placement;
    /**
     * make it true when you want to test the tooltip. it will show the tooltip.
     */
    forceDisplay?: boolean;
    /**
     * override tooltip's style
     */
    style?: Partial<CSSProperties>;
    /**
     * when true, tooltip will not be disappeared when mouse is hovered on the tooltip body area.
     * default is false.
     */
    clickable?: boolean;
    /**
     * when it is false, ul tag is not using dfa standard style.
     * default is true.
     */
    contentStyles?: ContentStyleOverrides;
    /**
     * when this class name is used, all tooltip style will use this class name instead of twa-popper(dfa standard style)
     */
    tooltipClassName?: string;
    arrowStyleOverride?: ArrowStyleOverrides;
} & PropsWithChildren;
