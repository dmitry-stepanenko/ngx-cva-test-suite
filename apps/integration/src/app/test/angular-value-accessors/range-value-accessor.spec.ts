import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { CustomRangeValueAccessor } from './support/standard-value-accessors-directives';

@Component({
    template: `<input type="range" customRangeValueAccessor #ctrl />`,
})
export class CVAWrapperComponent {
    @ViewChild(CustomRangeValueAccessor) defaultCtrl: CustomRangeValueAccessor;
    @ViewChild('ctrl') readonly ctrl: ElementRef<HTMLInputElement>;

    get value(): string {
        return this.ctrl?.nativeElement.value;
    }
}

runValueAccessorTests<CustomRangeValueAccessor, CVAWrapperComponent>({
    component: CustomRangeValueAccessor,
    testModuleMetadata: {
        declarations: [CVAWrapperComponent, CustomRangeValueAccessor],
        imports: [FormsModule, ReactiveFormsModule],
    },
    hostTemplate: {
        hostComponent: CVAWrapperComponent,
        getTestingComponent: (fixture) => fixture.componentInstance.defaultCtrl,
    },
    supportsOnBlur: true,
    nativeControlSelector: 'input[customRangeValueAccessor]',
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    resetCustomValue: { value: '50' },
    getValues: () => ['1', '2', '3'],
});
