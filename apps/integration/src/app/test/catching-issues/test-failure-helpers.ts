import { Type } from '@angular/core';
import { CVATestConfig, CVATestSteps, runValueAccessorTests } from 'ngx-cva-test-suite';

const getValueAccessorTestsConfig = (component: Type<any>, step: CVATestSteps): CVATestConfig<any> => ({
    component,
    testModuleMetadata: {
        declarations: [component],
    },
    supportsOnBlur: false,
    internalValueChangeSetter: null,
    getComponentValue: (fixture) => fixture.componentInstance.value,
    includeSteps: [step],
});

export const checkCVATestStepToFail = (
    component: Type<any>,
    step: CVATestSteps,
    configOverrides: Partial<CVATestConfig<any>>
): void => {
    const itRef = it;
    // @ts-expect-error asdfdas
    it = function (name, callback) {
        it = itRef;
        let failed = false;
        const wrappedCallback = function () {
            try {
                // @ts-expect-error omitting irrelevant errors
                // eslint-disable-next-line prefer-rest-params
                callback?.apply(this, arguments);
            } catch (error: any) {
                console.log('Test failed as expected', error.toString());
                failed = true;
                // const expression = /(\\x9B|\\x1B\[)[0-?]*[ -/]*[@-~]/g;
                // console.log(error.message.replace(expression, ''));
                // console.log({
                //     string: (error as any).toString(),
                //     r: (error as any).toString().replace(expression, ''),
                //     // btoa: btoa((error as any).toString()),
                //     parsed: atob(btoa((error as any).toString())).replace(expression, ''),
                // });
            }
            expect(failed).toBe(true);
        };
        // @ts-expect-error suppress an error with "this"
        // eslint-disable-next-line prefer-rest-params
        itRef.call(this, name, wrappedCallback);
    };
    const config = getValueAccessorTestsConfig(component, step);
    runValueAccessorTests({ ...config, ...configOverrides });
};
