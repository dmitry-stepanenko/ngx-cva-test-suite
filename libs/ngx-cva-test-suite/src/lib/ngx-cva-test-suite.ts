import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { CVATestConfig, CVAComponentType, CVATestSteps } from './models/test-config.models';
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

        const includedSteps = new Set<CVATestSteps>(
            config.includeSteps ?? (Object.values(CVATestSteps).filter((v) => !isNaN(v as any)) as CVATestSteps[])
        );
        config.excludeSteps?.forEach((step) => includedSteps.delete(step));

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
            } else {
                // if there's no host template specified, component will be tested directly.
                // in this case fixture will be based on actual component
                fixture = TestBed.createComponent(config.component as any);
            }
        });

        if (typeof config.additionalSetup === 'function') {
            beforeEach((done) => {
                config.additionalSetup!(fixture, done);
                // if "done" is not expected to be called in the function, call it here
                if (config.additionalSetup!.length < 2) done();
            });
        }

        beforeEach(async () => {
            // defining componentInstance after "additionalSetup",
            // because "detectChanges()" should not be called before it
            fixture.detectChanges();
            await fixture.whenStable();
            componentInstance = config.hostTemplate
                ? config.hostTemplate.getTestingComponent(fixture)
                : (fixture.componentInstance as any);
            if (!componentInstance) {
                throw new Error(`Could not resolve component instance${config.hostTemplate && ' from "hostTemplate"'}`);
            }
        });

        beforeEach(() => {
            onChangeSpy = testRunnerResolver.createSpy('onChangeSpy');
            onTouchedSpy = testRunnerResolver.createSpy('onTouchedSpy');

            registerOnChangeSpy = testRunnerResolver.spyOn(componentInstance, 'registerOnChange');
            registerOnTouchedSpy = testRunnerResolver.spyOn(componentInstance, 'registerOnTouched');
            writeValueSpy = testRunnerResolver.spyOn(componentInstance, 'writeValue');
            setDisabledStateSpy = testRunnerResolver.spyOn(componentInstance, 'setDisabledState');
        });

        function setupPlainValues() {
            componentInstance.registerOnChange(onChangeSpy);
            componentInstance.registerOnTouched(onTouchedSpy);
            componentInstance.writeValue(getValuesFn()[0]);
            fixture.detectChanges();
        }

        function expectComponentValueToEqual(expected: any, context?: string): void {
            if (typeof config.getComponentValue === 'function') {
                try {
                    expect(config.getComponentValue(fixture)).toEqual(expected);
                } catch (error) {
                    context && console.error(context);
                    throw error;
                }
            }
        }

        if (includedSteps.has(CVATestSteps.MethodsAreDefined)) {
            it('valueAccessor methods are defined', () => {
                setupPlainValues();
                expect(componentInstance.registerOnChange).toBeDefined();
                expect(componentInstance.registerOnTouched).toBeDefined();
                expect(componentInstance.writeValue).toBeDefined();
                if (!config.disabledStateNotSupported) {
                    expect(componentInstance.setDisabledState).toBeDefined();
                }
            });
        }

        if (includedSteps.has(CVATestSteps.InitializationIsDoneProperly)) {
            it('valueAccessor initialization is done properly', () => {
                // When component is initialised, tests the amount of times each method is called
                setupPlainValues();
                expect(registerOnChangeSpy).toHaveBeenCalledTimes(1);
                expect(registerOnTouchedSpy).toHaveBeenCalledTimes(1);
                expect(writeValueSpy).toHaveBeenCalledTimes(1);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                expect(setDisabledStateSpy).toHaveBeenCalledTimes(0);
                expectComponentValueToEqual(getValuesFn()[0]);
            });
        }

        if (includedSteps.has(CVATestSteps.ValueSetExternally)) {
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
                expectComponentValueToEqual(getValuesFn()[1]);
                expect(writeValueSpy).toHaveBeenCalledTimes(2);
                testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 2, [getValuesFn()[1]]);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                componentInstance.writeValue(getValuesFn()[2]);
                tick(config.customDelay ?? 100);
                expectComponentValueToEqual(getValuesFn()[2]);
                expect(writeValueSpy).toHaveBeenCalledTimes(3);
                testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 3, [getValuesFn()[2]]);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
            }));
        }

        if (includedSteps.has(CVATestSteps.ResetHandledProperly)) {
            it("form control's reset() is handled properly", fakeAsync(() => {
                setupPlainValues();
                expect(writeValueSpy).toHaveBeenCalledTimes(1);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                expectComponentValueToEqual(getValuesFn()[0]);
                componentInstance.writeValue(null);
                tick(config.customDelay ?? 100);
                expect(writeValueSpy).toHaveBeenCalledTimes(2);
                testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 2, [null]);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                const context =
                    'Component\'s value after calling "control.reset()" didn\'t meet the expectations.\n' +
                    'If component is expected to get specific value, when nullish one is applied, provide is as "resetCustomValue" in test config.';
                expectComponentValueToEqual(config.resetCustomValue?.value ?? null, context);
            }));
        }

        if (!config.disabledStateNotSupported && includedSteps.has(CVATestSteps.SettingDisabledState)) {
            it('setting the disabled state does not trigger "onChange" or "onTouched"', fakeAsync(() => {
                // Tests if setting disabled state doesn't call the "onChange" or "onTouched"
                setupPlainValues();
                componentInstance.setDisabledState(true);
                tick(config.customDelay ?? 100);
                componentInstance.writeValue(getValuesFn()[1]);
                expectComponentValueToEqual(getValuesFn()[1]);
                testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 2, [getValuesFn()[1]]);
                expect(setDisabledStateSpy).toHaveBeenCalledTimes(1);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                tick(config.customDelay ?? 100);
                componentInstance.setDisabledState(false);
                tick(config.customDelay ?? 100);
                componentInstance.writeValue(getValuesFn()[2]);
                tick(config.customDelay ?? 100);
                expectComponentValueToEqual(getValuesFn()[2]);
                testRunnerResolver.expectToHaveBeenNthCalledWith(writeValueSpy, 3, [getValuesFn()[2]]);
                expect(setDisabledStateSpy).toHaveBeenCalledTimes(2);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
            }));
        }

        if (
            typeof config.internalValueChangeSetter === 'function' &&
            includedSteps.has(CVATestSteps.ValueChangedInternally)
        ) {
            it('value changed internally', fakeAsync(() => {
                // Tests the approach that is used to set value in the component, when the change is internal
                // E.g. option of a select is clicked or user typed in the input.
                // When value is set, "onChange" (and "onTouched" depending on the "blur" behavior) methods are expected to be invoked
                setupPlainValues();
                expect(writeValueSpy).toHaveBeenCalledTimes(1);
                expect(onChangeSpy).toHaveBeenCalledTimes(0);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                config.internalValueChangeSetter!(fixture, getValuesFn()[1]);
                flush(); // is needed in case "internalValueChangeSetter" returns a Promise
                tick(config.customDelay ?? 100);
                expectComponentValueToEqual(getValuesFn()[1]);
                testRunnerResolver.expectToHaveBeenNthCalledWith(onChangeSpy, 1, [getValuesFn()[1]]);
                expect(onTouchedSpy).toHaveBeenCalledTimes(config.supportsOnBlur ? 0 : 1);
            }));
        }

        if (config.supportsOnBlur && includedSteps.has(CVATestSteps.OnBlurSupport)) {
            it('should emit onTouched event, when "blur" event has been dispatched', fakeAsync(() => {
                setupPlainValues();
                let nativeControlDebugElement: DebugElement;
                let nativeControl: EventTarget | undefined;
                if (config.nativeControlSelector) {
                    nativeControlDebugElement = fixture.debugElement.query(By.css(config.nativeControlSelector));
                    nativeControl = nativeControlDebugElement?.nativeElement;
                }
                try {
                    expect(nativeControl).toBeDefined();
                } catch (error) {
                    console.error(
                        `Could not find control by provided nativeControlSelector: "${config.nativeControlSelector}"`
                    );
                }
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);
                const focusEvent = new Event('focus');
                nativeControl?.dispatchEvent(focusEvent);
                expect(onTouchedSpy).toHaveBeenCalledTimes(0);

                tick(config.customDelay ?? 100);

                const blurEvent = new Event('blur');
                nativeControl?.dispatchEvent(blurEvent);
                expect(onTouchedSpy).toHaveBeenCalledTimes(1);
            }));
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
    if (config.includeSteps && config.excludeSteps) {
        throw new Error('Either "includeSteps" or "excludeSteps" can be specified, not both.');
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
