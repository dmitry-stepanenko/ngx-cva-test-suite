import { runValueAccessorTests } from 'ngx-cva-test-suite';

import { StarRatingComponent } from './star-rating.component';

runValueAccessorTests({
    component: StarRatingComponent,
    testModuleMetadata: {
        declarations: [StarRatingComponent],
    },
    supportsOnBlur: false,
    additionalSetup: (fixture, done) => {
        const component: StarRatingComponent = fixture.componentInstance;
        component.disabled = false;
        component.interactive = true;
        done();
    },
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    resetCustomValue: { value: 0 },
    getValues: () => [1, 2, 3],
});
