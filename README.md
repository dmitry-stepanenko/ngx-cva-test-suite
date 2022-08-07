# ngx-cva-test-suite

## Standardise your custom UI form components with ControlValueAccessor Test Suite

<a href="https://www.npmjs.com/ngx-cva-test-suite">
    <img src="https://img.shields.io/npm/v/ngx-cva-test-suite.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen" alt="NPM package" />
</a>

`ngx-cva-test-suite` provides extensive set of test cases, ensuring your custom controls behave as intended.

It provides various configurations, that allows even the most non-standard components to be properly tested.

Among the main features:

-   ensures correct amount of calls for `onChange` function _(incorrect usage may result in extra emissions of `valueChanges` of formControl)_
-   ensures correct triggering of `onTouched` function _(is needed for `touched` state of the control and `updateOn: 'blur'` [strategy](https://angular.io/api/forms/AbstractControl#updateOn) to function properly)_
-   ensures that no extra emissions are present when control is disabled
-   checks for control to be resettable using `AbstractControl.reset()`

## Installation

```
npm i ngx-cva-test-suite --save-dev
```

## Simple Usage

See [config](#config) below for the details on each property.

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

## Using host template

```typescript
import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { Component, ViewChild } from '@angular/core';

import { CustomCheckboxControlValueAccessor } from './support/standard-value-accessors-directives';

@Component({
    template: `
        <app-select>
            <app-select-option [value]="1">Opt 1</app-select-option>
            <app-select-option [value]="2">Opt 2</app-select-option>
            <app-select-option [value]="3">Opt 3</app-select-option>
        </app-select>
    `,
})
export class SelectWrapperComponent {
    @ViewChild(AppSelectComponent) ctrl: AppSelectComponent;
}

runValueAccessorTests<AppSelectComponent, SelectWrapperComponent>({
    // <= if host template is used, it should be marked explicitly as a type
    component: AppSelectComponent, // <= using actual AppSelectComponent as a test target
    testModuleMetadata: {
        declarations: [SelectWrapperComponent],
        imports: [AppSelectModule], // <= importing the module for app-select
    },
    hostTemplate: {
        // specify that "AppSelectComponent" should not be tested directly
        hostComponent: SelectWrapperComponent,
        // specify the way to access "AppSelectComponent" from the host template
        getTestingComponent: (fixture) => fixture.componentInstance.ctrl,
    },
    supportsOnBlur: false,
    internalValueChangeSetter: (fixture, value) => {
        // "setValue" is a function that is being called
        // when user selects any "app-select-option"
        fixture.componentInstance.ctrl.setValue(value, true);
    },
    getComponentValue: (fixture) => fixture.componentInstance.ctrl.value,
    getValues: () => [1, 2, 3], // <= setting the same values as select options in host template
});
```

## Config

### interface CVATestConfig<T extends CVAComponentType, H = T>

#### testModuleMetadata: TestModuleMetadata

All the metadata required for this test to run. Under the hood calls `TestBed.configureTestingModule` with provided config

#### name?: string

Is used in a root `describe` statement of the test suite.

Should be the name of the component, that is being tested. By default will use the name of testing component.

#### hostTemplate?: HostTemplate<T, H>

Allows to define custom wrapper template for this set of tests. Is useful if CVA cannot be tested in complete isolation.

See details [below](#interface-hosttemplatet-h)

#### component: Type<T>

Component, that is being tested

#### getComponentValue: (fixture: ComponentFixture<H>) => any

Function to get the value of a component in a runtime. Is used to ensure component applies provided value correctly.
Set to `null` if you want to skip this check.

Example usage:

```typescript
// supposed your component has "getValue()" method
getComponentValue: (fixture) => fixture.componentInstance.getValue();
```

#### supportsOnBlur: boolean

This is related to the ability to track blur events in order to set `emitOn: 'blur'` when used in reactive form.

If set to true, component will be tested to not call `onTouched` event when value changed.
Instead of this, it will be expected to trigger this function
by html blur event using native control (see `nativeControlSelector`in this config).

#### nativeControlSelector?: string

CSS selector for the element, that should dispatch `blur` event. Required and used only if `supportsOnBlur` is set to true.
Provided selected will be used to programmatically dispatch `blur` event.

Example:

```html
<input class="combobox-input" />
```

For the CVA with HTML as above the following should be provided:

```typescript
nativeControlSelector: 'input.combobox-input';
```

#### internalValueChangeSetter: (fixture: ComponentFixture<H>, value: any) => void

Tests the approach that is used to set value in the component, when the change is internal
(e.g. by clicking on an option of the select or typing in the input field).
When value is set, "onChange" (and "onTouched" depending on the "blur" behavior) methods are expected to be invoked

Set to `null` if you want to skip this check.

Example:
if in your component you have something like this in html

```html
<input (input)="onSearchChange($event.target.value) />
```

then provide here

```typescript
internalValueChangeSetter: (fixture, value) => {
    fixture.componentInstance.onSearchChange(value);
};
```

#### additionalSetup?: (fixture: ComponentFixture<H>, done: () => void) => void

Gives an ability to add any additional logic for the setup process.
It will be called before running each test.

Make sure you are calling `done` callback after setup is finished.

#### customDelay?: number

After setting the value, each test waits for the given amount of time before going further with checks. Defaults to 100ms

#### getValues?: () => [any, any, any]

Customizer for plain values. By default will use ['a', 'b', 'c']

This test suite applies up to 3 different values on the component. If strings are not supported in your component,
replace it with whatever is needed. It's recommended to **NOT** use consecutive same values (like ~`[1, 1, 1]`~)

Example:

```
getValues: () => [1, 2, 3]
// or
getValues: () => [true, false, true]
```

#### resetCustomValue?: { value: any }

Component will be tested for correct behavior, when `FormControl`'s `reset()` method is called.
After simulating this call, it will check if value of the component is reset internally.

If your component is not supposed to work with `null` as a value, specify what you're expecting to have as a value internally

#### disabledStateNotSupported?: boolean

Set this to true, if component cannot be disabled.

If set to true, `ControlValueAccessor.setDisabledState()` function will not be checked for existance and correct behavior.

#### testRunnerType?: TestRunnerType

Test suite will automatically detect whether it's Jest or Jasmine environment. If needed, this can be overriden

### interface HostTemplate<T, H>

#### hostComponent: Type<any>

Wrapper, that hosts testing component. For example, to test `app-select-component` the following wrapper is used

```typescript
@Component({
    selector: 'app-test-component-wrapper',
    template: `
        <app-select label="Label Value" #ctrl>
            <app-select-option [value]="1" label="Opt 1"></app-select-option>
            <app-select-option [value]="2" label="Opt 2"></app-select-option>
            <app-select-option [value]="3" label="Opt 3"></app-select-option>
        </app-select>
    `,
})
class TestWrapperComponent {
    @ViewChild('ctrl') ctrl: AppSelectComponent;
}
```

#### getTestingComponent: (fixture: ComponentFixture<H>) => T

Getter for the actual component that is being tested

Using the hostComponent above, the following function should be used:
`(fixture) => fixture.componentInstance.ctrl;`
