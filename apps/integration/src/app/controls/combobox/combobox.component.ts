import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Input,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let UNIQUE_ID = 0;

const COUNTER_CONTROL_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ComboboxComponent),
    multi: true,
};

@Component({
    selector: 'lib-combobox',
    templateUrl: './combobox.component.html',
    styleUrls: ['./combobox.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [COUNTER_CONTROL_ACCESSOR],
})
export class ComboboxComponent implements ControlValueAccessor, AfterViewInit {
    @ViewChild('comboboxInput') comboboxInput: ElementRef<HTMLInputElement>;
    readonly uniqueId = ++UNIQUE_ID;

    @Input() options: string[];

    disabled = false;

    get value() {
        return this._value;
    }
    set value(v: string) {
        this.setValue(v, true);
    }
    private _value = '';
    private viewInit = false;

    private onTouched: () => void;
    private onChange: (value: string) => void;

    constructor(private _renderer: Renderer2) {}

    ngAfterViewInit() {
        this.viewInit = true;
        this.setValue(this._value, false);
    }

    onInput(event: Event) {
        this.setValue((<HTMLInputElement>event.target).value ?? '', true);
    }

    onBlur() {
        this.onTouched();
    }

    registerOnChange(fn: (value: string) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    writeValue(value: string) {
        this.setValue(value, false);
    }

    setValue(value: string, emitEvent: boolean) {
        this._value = value;
        if (this.viewInit) {
            this._renderer.setProperty(this.comboboxInput.nativeElement, 'value', value);
        }
        if (emitEvent && typeof this.onChange === 'function') {
            this.onChange(value);
        }
    }
}
