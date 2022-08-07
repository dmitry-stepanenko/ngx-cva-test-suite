import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { CustomSelectMultipleControlValueAccessor } from './support/standard-value-accessors-directives';

@Component({
    template: ` <select multiple customSelectMultipleValueAccessor #ctrl>
        <option value="a">First</option>
        <option value="b">Second</option>
        <option value="c">Third</option>
        <option value="d">Fourth</option>
    </select>`,
})
export class CVAWrapperComponent {
    @ViewChild(CustomSelectMultipleControlValueAccessor) defaultCtrl: CustomSelectMultipleControlValueAccessor;
    @ViewChild('ctrl') readonly ctrl: ElementRef<HTMLSelectElement>;

    get value(): string[] {
        const result = [];
        const selectedOptions = this.ctrl.nativeElement.selectedOptions;
        for (let index = 0; index < selectedOptions.length; index++) {
            // angular modifies "value" attribute for multi select options as follows: `${id}: '${value}'`
            // see https://github.com/angular/angular/blob/master/packages/forms/src/directives/select_multiple_control_value_accessor.ts#L19
            const value = selectedOptions[index].value?.split(': ')[1].replace(/'/g, '');
            result.push(value);
        }
        return result;
    }
}

runValueAccessorTests<CustomSelectMultipleControlValueAccessor, CVAWrapperComponent>({
    component: CustomSelectMultipleControlValueAccessor,
    testModuleMetadata: {
        declarations: [CVAWrapperComponent, CustomSelectMultipleControlValueAccessor],
        imports: [FormsModule, ReactiveFormsModule],
    },
    hostTemplate: {
        hostComponent: CVAWrapperComponent,
        getTestingComponent: (fixture) => fixture.componentInstance.defaultCtrl,
    },
    supportsOnBlur: true,
    nativeControlSelector: 'select[customSelectMultipleValueAccessor]',
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    resetCustomValue: { value: [] },
    getValues: () => [['a'], ['b'], ['c']],
});
