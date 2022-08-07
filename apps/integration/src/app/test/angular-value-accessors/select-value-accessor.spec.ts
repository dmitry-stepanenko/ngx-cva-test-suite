import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { CustomSelectControlValueAccessor } from './support/standard-value-accessors-directives';

@Component({
    template: ` <select customSelectValueAccessor #ctrl>
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
        <option value="4">Fourth</option>
    </select>`,
})
export class CVAWrapperComponent {
    @ViewChild(CustomSelectControlValueAccessor) defaultCtrl: CustomSelectControlValueAccessor;
    @ViewChild('ctrl') readonly ctrl: ElementRef<HTMLSelectElement>;

    get value(): string {
        return this.ctrl?.nativeElement.value;
    }
}

runValueAccessorTests<CustomSelectControlValueAccessor, CVAWrapperComponent>({
    component: CustomSelectControlValueAccessor,
    testModuleMetadata: {
        declarations: [CVAWrapperComponent, CustomSelectControlValueAccessor],
        imports: [FormsModule, ReactiveFormsModule],
    },
    hostTemplate: {
        hostComponent: CVAWrapperComponent,
        getTestingComponent: (fixture) => fixture.componentInstance.defaultCtrl,
    },
    supportsOnBlur: true,
    nativeControlSelector: 'select[customSelectValueAccessor]',
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    resetCustomValue: { value: '' },
    getValues: () => ['1', '2', '3'],
});
