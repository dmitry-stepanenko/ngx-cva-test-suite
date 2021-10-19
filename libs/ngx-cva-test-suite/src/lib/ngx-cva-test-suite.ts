import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { CVATestConfig, CVAComponentType } from './models/test-config.models';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CompatibleSpy } from './models/test-runner.models';
import { TestRunnerResolver } from './utils/test-runner-resolver';

/**
 * `ngx-cva-test-suite` provides extensive set of test cases, ensuring your custom controls behave as intended.
 *
 * @param config shared tests config.
 * See docs for the each property for details
 *
 * @usage
 * in your component's spec file:
 * ```typescript
 * import { runValueAccessorTests } from `ngx-cva-test-suite`;
 *
 * runValueAccessorTests({
 *     component: ComboboxComponent,
 *     testModuleMetadata: {
 *         declarations: [ComboboxComponent],
 *     },
 *     supportsOnBlur: true,
 *     nativeControlSelector: 'input.combobox-input',
 *     internalValueChangeSetter: (fixture, value) => {
 *         fixture.componentInstance.setValue(value, true);
 *     },
 *     getComponentValue: (fixture) => fixture.componentInstance.value,
 * });
 *
 * ```
 */
export function runValueAccessorTests<T extends CVAComponentType, H = T>(config: CVATestConfig<T, H>) {
    validateConfig(config);

    describe(`${tryGetName(config)} value accessor tests`, () => {
        const getValuesFn = typeof config.getValues === 'function' ? config.getValues : getValues;
        const testRunnerResolver = new TestRunnerResolver(config.testRunnerType);
        let componentInstance: CVAComponentType;
        let fixture: ComponentFixture<H>;

        let registerOnChangeSpy: CompatibleSpy;
        let registerOnTouchedSpy: CompatibleSpy;
        let writeValueSpy: CompatibleSpy;
        let onChangeSpy: CompatibleSpy;
        let onTouchedSpy: CompatibleSpy;
        let setDisabledStateSpy: CompatibleSpy;

        beforeEach(
            waitForAsync(() => {
                TestBed.configureTestingModule(config.testModuleMetadata);
                TestBed.compileComponents();
            })
        );

        beforeEach(() => {
            if (config.hostTemplate) {
                fixture = TestBed.createComponent(config.hostTemplate.hostComponent);
                fixture.detectChanges();
                componentInstance = config.hostTemplate.getTestingComponent(fixture);
            } else {
                // if there's no host template specified, component will be tested directly.
                // in this case fixture will be based on actual component
                fixture = TestBed.createComponent(config.component as any);
                fixture.detectChanges();
                componentInstance = fixture.componentInstance as any;
            }
        });

        if (typeof config.additionalSetup === 'function') {
            beforeEach((done) => {
                config.additionalSetup!(fixture, done);
            });
        }

        beforeEach(() => {
            fixture.detectChanges();

            onChangeSpy = testRunnerResolver.createSpy();
            onTouchedSpy = testRunnerResolver.createSpy();

            registerOnChangeSpy = testRunnerResolver.spyOn(componentInstance, 'registerOnChange');
            registerOnTouchedSpy = testRunnerResolver.spyOn(componentInstance, 'registerOnTouched');
            writeValueSpy = testRunnerResolver.spyOn(componentInstance, 'writeValue');
            setDisabledStateSpy = testRunnerResolver.spyOn(componentInstance, 'setDisabledState');
        });

        function setupPlainValues() {
            componentInstance.writeValue(getValuesFn()[0]);
            componentInstance.registerOnChange(onChangeSpy);
            componentInstance.registerOnTouched(onTouchedSpy);
            fixture.detectChanges();
        }

        function expectComponentValueToBe(expected: any): void {
            if (typeof config.getComponentValue === 'function') {
                expect(config.getComponentValue(fixture)).toBe(expected);
            }
        }

        it('valueAccessor methods are defined', () => {
            setupPlainValues();
            expect(componentInstance.registerOnChange).toBeDefined();
            expect(componentInstance.registerOnTouched).toBeDefined();
            expect(componentInstance.writeValue).toBeDefined();
            if (!config.disabledStateNotSupported) {
                expect(componentInstance.setDisabledState).toBeDefined();
            }
        });

        it('valueAccessor initialization is done properly', () => {
            // When component is initialised, tests the amount of times each method is called
            setupPlainValues();
            expect(registerOnChangeSpy).toHaveBeenCalledTimes(1);
            expect(registerOnTouchedSpy).toHaveBeenCalledTimes(1);
            expect(writeValueSpy).toHaveBeenCalledTimes(1);
            expect(onChangeSpy).toHaveBeenCalledTimes(0);
            expect(onTouchedSpy).toHaveBeenCalledTimes(0);
            expect(setDisabledStateSpy).toHaveBeenCalledTimes(0);
            expectComponentValueToBe(getValuesFn()[0]);
        });

        it('value set externally', fakeAsync(() => {
            // Tests how much times each method should be called
            // when value is set externally (e.g. when used in the reactive form, form will call "writeValue")
            // expecting the "writeValue" to not cause any "onChange" or "onTouched" function calls
            setupPlainValues();
            expect(writeValueSpy).toHaveBeenCalledTimes(1);
            expect(onChangeSpy).toHaveBeenCalledTimes(0);
            expect(onTouchedSpy).toHaveBeenCalledTimes(0);
            componentInstance.writeValue(getValuesFn()[1]);
            tick(config.customDelay ?? 100);
            expectComponentValueToBe(getValuesFn()[1]);
            expect(writeValueSpy).toHaveBeenCalledTimes(2);
            testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 2, [getValuesFn()[1]]);
            expect(onChangeSpy).toHaveBeenCalledTimes(0);
            expect(onTouchedSpy).toHaveBeenCalledTimes(0);
            componentInstance.writeValue(getValuesFn()[2]);
            tick(config.customDelay ?? 100);
            expectComponentValueToBe(getValuesFn()[2]);
            expect(writeValueSpy).toHaveBeenCalledTimes(3);
            testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 3, [getValuesFn()[2]]);
            expect(onChangeSpy).toHaveBeenCalledTimes(0);
            expect(onTouchedSpy).toHaveBeenCalledTimes(0);
        }));

        it("form control's reset() is handled properly", fakeAsync(() => {
            setupPlainValues();
            expect(writeValueSpy).toHaveBeenCalledTimes(1);
            expect(onChangeSpy).toHaveBeenCalledTimes(0);
            expect(onTouchedSpy).toHaveBeenCalledTimes(0);
            expectComponentValueToBe(getValuesFn()[0]);
            componentInstance.writeValue(null);
            tick(config.customDelay ?? 100);
            expect(writeValueSpy).toHaveBeenCalledTimes(2);
            testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 2, [null]);
            expect(onChangeSpy).toHaveBeenCalledTimes(0);
            expect(onTouchedSpy).toHaveBeenCalledTimes(0);
            expectComponentValueToBe(config.resetCustomValue ? config.resetCustomValue.value : null);
        }));

        if (!config.disabledStateNotSupported) {
            it('setting the disabled state does not trigger "onChange" or "onTouched"', fakeAsync(() => {
                // Tests if setting disabled state doesn't call the "onChange" or "onTouched"
                setupPlainValues();
                componentInstance.setDisabledState(true);
                tick(config.customDelay ?? 100);
                componentInstance.writeValue(getValuesFn()[1]);
                expectComponentValueToBe(getValuesFn()[1]);
                testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 2, [getValuesFn()[1]]);
                expect(setDisabledStateSpy).toHaveBeenCalledTimes(1);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                tick(config.customDelay ?? 100);
                componentInstance.setDisabledState(false);
                tick(config.customDelay ?? 100);
                componentInstance.writeValue(getValuesFn()[2]);
                tick(config.customDelay ?? 100);
                expectComponentValueToBe(getValuesFn()[2]);
                testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 3, [getValuesFn()[2]]);
                expect(setDisabledStateSpy).toHaveBeenCalledTimes(2);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
            }));
        }

        if (typeof config.internalValueChangeSetter === 'function') {
            it('value changed internally', fakeAsync(() => {
                // Tests the approach that is used to set value in the component, when the change is internal
                // E.g. option of a select is clicked or user typed in the input.
                // When value is set, "onChange" (and "onTouched" depending on the "blur" behavior) methods are expected to be invoked
                setupPlainValues();
                expect(writeValueSpy).toHaveBeenCalledTimes(1);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                config.internalValueChangeSetter!(fixture, getValuesFn()[1]);
                tick(config.customDelay ?? 100);
                expectComponentValueToBe(getValuesFn()[1]);
                testRunnerResolver.expectToHaveBeenNthCalledWith(onChangeSpy, 1, [getValuesFn()[1]]);
                expect(onTouchedSpy).toHaveBeenCalledTimes(config.supportsOnBlur ? 0 : 1);
            }));
        }

        if (config.supportsOnBlur) {
            it('should emit onTouched event, when "blur" event has been dispatched', () => {
                setupPlainValues();
                let nativeControlDebugElement: DebugElement;
                let nativeControl: EventTarget | undefined;
                if (config.nativeControlSelector) {
                    nativeControlDebugElement = fixture.debugElement.query(By.css(config.nativeControlSelector));
                    nativeControl = nativeControlDebugElement?.nativeElement;
                }
                expect(nativeControl).toBeDefined();
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                const blurEvent = new Event('blur');
                nativeControl?.dispatchEvent(blurEvent);
                expect(onTouchedSpy).toHaveBeenCalledTimes(1);
            });
        }
    });
}

function getValues(): [string, string, string] {
    return ['a', 'b', 'c'];
}

function validateConfig(config: CVATestConfig<any>) {
    if (config.supportsOnBlur && typeof config.nativeControlSelector !== 'string') {
        throw new Error('Expected "nativeControlSelector" to be defined, if "supportsOnBlur" is set to true.');
    }
}

function tryGetName(config: CVATestConfig<any>): string {
    if (typeof config.name === 'string') {
        return config.name;
    }
    try {
        const name = new config.component().constructor.name;
        if (name) {
            return name;
        }
        throw new Error('Could not get constructor name');
    } catch {
        return 'Unnamed CVA';
    }
}
