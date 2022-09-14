import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let UNIQUE_ID = 0;

const COUNTER_CONTROL_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ToggleComponent),
    multi: true,
};

// initial implementation has been taken from https://codepen.io/xirclebox/pen/wvGmjbV

@Component({
    selector: 'lib-toggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [COUNTER_CONTROL_ACCESSOR],
})
export class ToggleComponent implements ControlValueAccessor {
    readonly uniqueId = ++UNIQUE_ID;

    @Input() label: string;

    @Input() set disabled(isDisabled: boolean) {
        this.setDisabledState(isDisabled);
    }
    _disabled = false;

    get value() {
        return this._value;
    }
    set value(v: boolean) {
        this.setValue(v, true);
    }
    private _value = false;

    private onTouched: () => void;
    private onChange: (value: boolean) => void;

    constructor(private _cdr: ChangeDetectorRef) {}

    onInput(event: boolean) {
        this.setValue(event, true);
    }

    onBlur() {
        this.onTouched();
    }

    registerOnChange(fn: (value: boolean) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this._disabled = isDisabled;
    }

    writeValue(value: boolean) {
        this.setValue(value, false);
        this._cdr.markForCheck();
    }

    setValue(value: boolean, emitEvent: boolean) {
        value = !!value;
        this._value = value;
        if (emitEvent && typeof this.onChange === 'function') {
            this.onChange(value);
        }
    }
}
