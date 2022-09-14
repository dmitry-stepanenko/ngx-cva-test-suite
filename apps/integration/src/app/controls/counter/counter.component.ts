import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const COUNTER_CONTROL_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CounterControlComponent),
    multi: true,
};

@Component({
    selector: 'lib-counter',
    template: `
        <button (click)="down()" [disabled]="disabled">Down</button>
        {{ value }}
        <button (click)="up()" [disabled]="disabled">Up</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [COUNTER_CONTROL_ACCESSOR],
})
export class CounterControlComponent implements ControlValueAccessor {
    disabled = false;
    value = 0;

    protected onTouched: () => void;
    protected onChange: (value: number) => void;

    constructor(private _cdr: ChangeDetectorRef) {}

    up() {
        this.setValue(this.value + 1, true);
    }

    down() {
        this.setValue(this.value - 1, true);
    }

    registerOnChange(fn: (value: number) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    writeValue(value: number) {
        this.setValue(value, false);
        this._cdr.markForCheck();
    }

    protected setValue(value: number, emitEvent: boolean) {
        const parsed = parseInt(value as any);
        this.value = isNaN(parsed) ? 0 : parsed;
        if (emitEvent && this.onChange) {
            this.onChange(value);
            this.onTouched();
        }
    }
}
