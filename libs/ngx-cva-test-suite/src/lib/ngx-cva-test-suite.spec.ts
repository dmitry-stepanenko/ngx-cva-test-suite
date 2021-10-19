import { DefaultValueAccessor, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { runValueAccessorTests } from './ngx-cva-test-suite';

import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'lib-default-input-cva-wrapper',
    template: `<input type="text" ngDefaultControl #ctrl />`,
})
export class DefaultCVAWrapperComponent {
    @ViewChild(DefaultValueAccessor) defaultCtrl: DefaultValueAccessor;
    @ViewChild('ctrl') readonly ctrl: ElementRef<HTMLInputElement>;

    get value(): string {
        return this.ctrl?.nativeElement.value;
    }
}

runValueAccessorTests<DefaultValueAccessor, DefaultCVAWrapperComponent>({
    component: DefaultValueAccessor,
    testModuleMetadata: {
        declarations: [DefaultCVAWrapperComponent],
        imports: [FormsModule, ReactiveFormsModule],
    },
    hostTemplate: {
        hostComponent: DefaultCVAWrapperComponent,
        getTestingComponent: (fixture) => fixture.componentInstance.defaultCtrl,
    },
    supportsOnBlur: true,
    nativeControlSelector: 'input[ngDefaultControl]',
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    resetCustomValue: { value: '' },
});
