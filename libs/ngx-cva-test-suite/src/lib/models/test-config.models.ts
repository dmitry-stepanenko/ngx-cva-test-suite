import { Type } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ComponentFixture, TestModuleMetadata } from '@angular/core/testing';
import { TestRunnerType } from './test-runner.models';

export type CVAComponentType = Required<ControlValueAccessor>;

export interface CVATestConfig<T extends CVAComponentType, H = T> {
    /** All the metadata required for this test to run. Under the hood calls `TestBed.configureTestingModule` with provided config */
    testModuleMetadata: TestModuleMetadata;
    /**
     * Is used in a root `describe` statement of the test suite.
     *
     * Should be the name of the component, that is being tested. By default will use the name of testing component.
     *
     */
    name?: string;
    /**
     * Allows to define custom wrapper template for this set of tests. Is useful if CVA cannot be tested in complete isolation.
     */
    hostTemplate?: HostTemplate<T, H>;
    /** Component, that is being tested */
    component: Type<T>;
    /**
     * Function to get the value of a component in a runtime. Is used to ensure component applies provided value correctly.
     *
     * Set to `null` if you want to skip this check.
     *
     * @example
     * ```typescript
     *  getComponentValue: (fixture) => fixture.componentInstance.getValue()
     * ```
     */
    getComponentValue: ((fixture: ComponentFixture<H>) => any) | null;
    /**
     * This is related to the ability to track blur events in order to set `emitOn: 'blur'` when used in reactive form.
     *
     * If set to true, component will be tested to not call `onTouched` event when value changed.
     * Instead of this, it will be expected to trigger this function
     * by html blur event using native control (see `getNativeControlSelector`in this config).
     */
    supportsOnBlur: boolean;
    /**
     * CSS selector for the element, that should dispatch `blur` event. Required and used only if `supportsOnBlur` is set to true.
     * Provided selected will be used to programmatically dispatch `blur` event.
     *
     * @example
     * ```html
     * <input class="combobox-input" />
     * ```
     * For the CVA with HTML as above the following should be provided:
     *
     * ```typescript
     * getNativeControlSelector: 'input.combobox-input'
     * ```
     */
    getNativeControlSelector?: string;
    /**
     * Tests the approach that is used to set value in the component, when the change is internal
     * (e.g. by clicking on an option of the select or typing in the input field).
     * When value is set, "onChange" (and "onTouched" depending on the "blur" behavior) methods are expected to be invoked
     *
     * Set to `null` if you want to skip this check.
     *
     * @example
     * ```html
     * <input (input)="onSearchChange($event.target.value) />
     * ```
     * for html above provide:
     *
     * ```typescript
     * internalValueChangeSetter: (fixture, value) => {
     *   fixture.componentInstance.onSearchChange(value);
     * }
     * ```
     */
    internalValueChangeSetter: ((fixture: ComponentFixture<H>, value: any) => void) | null;
    /**
     * Gives an ability to add any additional logic for the setup process.
     * It will be called before running each test.
     *
     * Make sure you are calling `done` callback after setup is finished.
     */
    additionalSetup?: (fixture: ComponentFixture<H>, done: () => void) => void;
    /** After setting the value, each test waits for the given amount of time before going further with checks. Defaults to 100ms  */
    customDelay?: number;
    /**
     * Customizer for plain values. By default will use ['a', 'b', 'c']
     *
     * This test suite applies up to 3 different values on the component. If strings are not supported in your component,
     * replace it with whatever is needed. It's recommended to __NOT__ use consecutive same values (like ~`[1, 1, 1]`~)
     *
     * @example
     * ```
     * getValues: () => [1, 2, 3]
     * // or
     * getValues: () => [true, false, true]
     * ```
     */
    getValues?: () => [any, any, any];
    /**
     * Component will be tested for correct behavior, when `FormControl`'s `reset()` method is called.
     * After simulating this call, it will check if value of the component is reset internally.
     *
     * If your component is not supposed to work with `null` as a value, specify what you're expecting to have as a value internally
     */
    resetCustomValue?: { value: any };
    /**
     * Set this to true, if component cannot be disabled.
     *
     * If set to true, `ControlValueAccessor.setDisabledState()` function will not be checked for existance and correct behavior.
     */
    disabledStateNotSupported?: boolean;
    /** Test suite will automatically detect whether it's Jest or Jasmine environment. If needed, this can be overriden */
    testRunnerType?: TestRunnerType;
}

export interface HostTemplate<T, H> {
    /**
     * Wrapper, that hosts testing component. For example, to test `app-select-component` the following wrapper is used
     *
     * ```typescript
     * @Component({
     *   selector: 'app-test-component-wrapper',
     *   template: `
     *   <app-select label="Label Value">
     *     <app-select-item [value]="1" label="Opt 1"></app-select-item>
     *     <app-select-item [value]="2" label="Opt 2"></app-select-item>
     *     <app-select-item [value]="3" label="Opt 3"></app-select-item>
     *   </app-select>
     * `,
     * })
     * class TestWrapperComponent {}
     * ```
     */
    hostComponent: Type<any>;
    /**
     * Getter for the actual component that is being tested
     *
     * Using the hostComponent above, the following function should be used:
     * `(fixture) => fixture.debugElement.children[0].componentInstance;`
     */
    getTestingComponent: (fixture: ComponentFixture<H>) => T;
}
