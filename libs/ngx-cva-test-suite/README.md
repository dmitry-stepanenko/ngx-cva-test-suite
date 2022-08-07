# ngx-cva-test-suite

## Standardise your custom UI form components with ControlValueAccessor Test Suite

`ngx-cva-test-suite` provides an extensive set of test cases, ensuring your custom controls behave as intended. Package is designed and tested to work properly with both **Jest** and **Jasmine** test runners.

It provides various configurations, that allows even the most non-standard components to be properly tested.

Among the main features:

-   ensures the correct amount of calls for the `onChange` function _(incorrect usage may result in extra emissions of `valueChanges` of formControl)_
-   ensures correct triggering of `onTouched` function _(is needed for `touched` state of the control and `updateOn: 'blur'` [strategy](https://angular.io/api/forms/AbstractControl#updateOn) to function properly)_
-   ensures that no extra emissions are present when control is disabled
-   checks for control to be resettable using `AbstractControl.reset()`

In the repository you can also [find few simple CVA components](https://github.com/dmitry-stepanenko/ngx-cva-test-suite/tree/master/apps/integration/src/app/controls), that are configured properly along with `ngx-cva-test-suite` setup for them.

## Installation

```
npm i ngx-cva-test-suite --save-dev
```

## Simple Usage

```typescript
import { runValueAccessorTests } from `ngx-cva-test-suite`;

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
```

Full details can be found on [GitHub repo's README](https://github.com/dmitry-stepanenko/ngx-cva-test-suite#readme)
