import { FormsModule } from '@angular/forms';
import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { ToggleComponent } from './toggle.component';

runValueAccessorTests({
    component: ToggleComponent,
    testModuleMetadata: {
        declarations: [ToggleComponent],
        imports: [FormsModule],
    },
    supportsOnBlur: true,
    nativeControlSelector: 'input.toggle__input',
    internalValueChangeSetter: (fixture, value) => {
        fixture.componentInstance.setValue(value, true);
    },
    getComponentValue: (fixture) => fixture.componentInstance.value,
    getValues: () => [true, false, true],
    resetCustomValue: { value: false },
});
