/* eslint-disable @angular-eslint/directive-class-suffix */
/* eslint-disable @angular-eslint/directive-selector */
import { Directive } from '@angular/core';
import {
    CheckboxControlValueAccessor,
    NumberValueAccessor,
    RadioControlValueAccessor,
    RangeValueAccessor,
    SelectControlValueAccessor,
    SelectMultipleControlValueAccessor,
} from '@angular/forms';

// extending standard angular directives with different selectors,
// that does not require applying formControl on the target component

@Directive({
    selector: 'input[type="checkbox"][customCheckboxValueAccessor]',
})
export class CustomCheckboxControlValueAccessor extends CheckboxControlValueAccessor {}

@Directive({
    selector: 'input[type=number][customNumberValueAccessor]',
})
export class CustomNumberValueAccessor extends NumberValueAccessor {}

@Directive({
    // TODO: add missing tests for radio accessor
    selector: 'input[type="radio"][customRadioValueAccessor]',
})
export class CustomRadioControlValueAccessor extends RadioControlValueAccessor {}

@Directive({
    selector: 'input[type="range"][customRangeValueAccessor]',
})
export class CustomRangeValueAccessor extends RangeValueAccessor {}

@Directive({
    selector: 'select:not([multiple])[customSelectValueAccessor]',
})
export class CustomSelectControlValueAccessor extends SelectControlValueAccessor {}

@Directive({
    selector: 'select[multiple][customSelectMultipleValueAccessor]',
    providers: [{ provide: SelectMultipleControlValueAccessor, useExisting: CustomSelectMultipleControlValueAccessor }],
})
export class CustomSelectMultipleControlValueAccessor extends SelectMultipleControlValueAccessor {}
