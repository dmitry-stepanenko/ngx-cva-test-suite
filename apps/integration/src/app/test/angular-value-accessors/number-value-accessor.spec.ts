import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { CustomNumberValueAccessor } from './support/standard-value-accessors-directives';

@Component({
    template: `<input type="number" customNumberValueAccessor #ctrl />`,
})
export class CVAWrapperComponent {
    @ViewChild(CustomNumberValueAccessor) defaultCtrl: CustomNumberValueAccessor;
    @ViewChild('ctrl') readonly ctrl: ElementRef<HTMLInputElement>;

    get value(): string {
        return this.ctrl?.nativeElement.value;
    }
}

runValueAccessorTests<CustomNumberValueAccessor, CVAWrapperComponent>({
    component: CustomNumberValueAccessor,
    testModuleMetadata: {
        declarations: [CVAWrapperComponent, CustomNumberValueAccessor],
        imports: [FormsModule, ReactiveFormsModule],
    },
    hostTemplate: {
        hostComponent: CVAWrapperComponent,
        getTestingComponent: (fixture) => fixture.componentInstance.defaultCtrl,
    },
    supportsOnBlur: true,
    nativeControlSelector: 'input[customNumberValueAccessor]',
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    resetCustomValue: { value: '' },
    getValues: () => ['1', '2', '3'],
});
