/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the BSD-3 License as modified (the “License”); you may obtain a copy
 * of the license at https://github.com/palantir/blueprint/blob/master/LICENSE
 * and https://github.com/palantir/blueprint/blob/master/PATENTS
 */

import * as React from "react";
import { ReactElement } from "react";

import { AbstractComponent } from "../../common";
import { KeyCombo } from "./keyCombo";

export interface IHotkeyProps {
    /**
     * Whether the hotkey should be triggerable when focused in a text input.
     * @default false
     */
    allowInInput?: boolean;

    /**
     * Hotkey combination string, such as "space" or "cmd+n".
     */
    combo: string;

    /**
     * Whether the hotkey can be triggered.
     * @default false
     */
    disabled?: boolean;

    /**
     * Human-friendly label for the hotkey.
     */
    label: string;

    /**
     * If `false`, the hotkey is active only when the target is focused. If
     * `true`, the hotkey can be triggered regardless of what component is
     * focused.
     * @default false
     */
    global?: boolean;

    /**
     * Unless the hotkey is global, you must specify a group where the hotkey
     * will be displayed in the hotkeys dialog. This string will be displayed
     * in a header at the start of the group of hotkeys.
     */
    group?: string;

    /**
     * When true, invokes `event.preventDefault()` in response to `keydown` and `keyup` events
     * before the respective `onKeyDown` and `onKeyUp` callbacks are invoked.
     * @default false
     */
    preventDefault?: boolean;

    /**
     * When true, invokes `event.stopPropagation()` in response to `keydown` and `keyup` events
     * before the respective `onKeyDown` and `onKeyUp` callbacks are invoked.
     * @default false
     */
    stopPropagation?: boolean;

    /**
     * `keydown` event handler.
     */
    onKeyDown?(e: KeyboardEvent): any;

    /**
     * `keyup` event handler.
     */
    onKeyUp?(e: KeyboardEvent): any;
}

export class Hotkey extends AbstractComponent<IHotkeyProps, {}> {
    public static defaultProps = {
        allowInInput: false,
        disabled: false,
        global: false,
    };

    public static isInstance(element: any): element is ReactElement<IHotkeyProps> {
        return element != null && (element as JSX.Element).type === Hotkey;
    }

    public render() {
        const { allowInInput, combo, disabled, label, preventDefault, stopPropagation } = this.props;
        return <div className="pt-hotkey">
            <div className="pt-hotkey-label">{label}</div>
            <KeyCombo
                allowInInput={allowInInput}
                combo={combo}
                disabled={disabled}
                preventDefault={preventDefault}
                stopPropagation={stopPropagation}
            />
        </div>;
    }

    protected validateProps(props: IHotkeyProps) {
        if (props.global !== true && props.group == null) {
            throw new Error("non-global <Hotkey>s must define a group");
        }
    }
}
