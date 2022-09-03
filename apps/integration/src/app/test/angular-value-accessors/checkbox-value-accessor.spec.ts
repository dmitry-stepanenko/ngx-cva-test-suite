import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { CustomCheckboxControlValueAccessor } from './support/standard-value-accessors-directives';

@Component({
    template: `<input type="checkbox" customCheckboxValueAccessor #ctrl />`,
})
export class CVAWrapperComponent {
    @ViewChild(CustomCheckboxControlValueAccessor) defaultCtrl: CustomCheckboxControlValueAccessor;
    @ViewChild('ctrl') readonly ctrl: ElementRef<HTMLInputElement>;

    get value(): boolean {
        return this.ctrl?.nativeElement.checked;
    }
}

runValueAccessorTests<CustomCheckboxControlValueAccessor, CVAWrapperComponent>({
    component: CustomCheckboxControlValueAccessor,
    testModuleMetadata: {
        declarations: [CVAWrapperComponent, CustomCheckboxControlValueAccessor],
        imports: [FormsModule, ReactiveFormsModule],
    },
    hostTemplate: {
        hostComponent: CVAWrapperComponent,
        getTestingComponent: (fixture) => fixture.componentInstance.defaultCtrl,
    },
    supportsOnBlur: true,
    nativeControlSelector: 'input[customCheckboxValueAccessor]',
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    resetCustomValue: { value: false },
    getValues: () => [true, false, true],
});
