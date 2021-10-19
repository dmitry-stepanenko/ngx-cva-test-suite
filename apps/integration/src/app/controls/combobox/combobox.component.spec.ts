import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { ComboboxComponent } from './combobox.component';

runValueAccessorTests({
    component: ComboboxComponent,
    testModuleMetadata: {
        declarations: [ComboboxComponent],
    },
    supportsOnBlur: true,
    nativeControlSelector: 'input.combobox-input',
    internalValueChangeSetter: (fixture, value) => {
        fixture.componentInstance.setValue(value, true);
    },
    getComponentValue: (fixture) => fixture.componentInstance.value,
});
