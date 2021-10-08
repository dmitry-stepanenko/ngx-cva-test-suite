import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { CounterControlComponent } from './counter.component';

runValueAccessorTests({
    component: CounterControlComponent,
    testModuleMetadata: {
        declarations: [CounterControlComponent],
    },
    supportsOnBlur: false,
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    resetCustomValue: { value: 0 },
    getValues: () => [1, 2, 3],
});
