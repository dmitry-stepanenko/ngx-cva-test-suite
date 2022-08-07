import { DefaultValueAccessor, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { runValueAccessorTests } from 'ngx-cva-test-suite';

import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    template: `<input type="text" ngDefaultControl #ctrl />`,
})
export class CVAWrapperComponent {
    @ViewChild(DefaultValueAccessor) defaultCtrl: DefaultValueAccessor;
    @ViewChild('ctrl') readonly ctrl: ElementRef<HTMLInputElement>;

    get value(): string {
        return this.ctrl?.nativeElement.value;
    }
}

runValueAccessorTests<DefaultValueAccessor, CVAWrapperComponent>({
    component: DefaultValueAccessor,
    testModuleMetadata: {
        declarations: [CVAWrapperComponent],
        imports: [FormsModule, ReactiveFormsModule],
    },
    hostTemplate: {
        hostComponent: CVAWrapperComponent,
        getTestingComponent: (fixture) => fixture.componentInstance.defaultCtrl,
    },
    supportsOnBlur: true,
    nativeControlSelector: 'input[ngDefaultControl]',
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    resetCustomValue: { value: '' },
});
