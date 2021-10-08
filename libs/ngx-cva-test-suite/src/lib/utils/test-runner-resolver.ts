import { CompatibleSpy, TestRunnerType } from '../models/test-runner.models';

declare const jest: any;

export class TestRunnerResolver {
    readonly testRunnerType: TestRunnerType;

    constructor(forceType?: TestRunnerType) {
        this.testRunnerType = forceType ?? this.getTestRunnerType();
    }

    createSpy(): CompatibleSpy {
        switch (this.testRunnerType) {
            case TestRunnerType.Jasmine:
                return jasmine.createSpy();

            case TestRunnerType.Jest:
                return jest.fn();
        }
    }

    spyOn<T, K extends keyof T = keyof T>(object: T, method: T[K] extends Function ? K : never): CompatibleSpy {
        switch (this.testRunnerType) {
            case TestRunnerType.Jasmine:
                return spyOn(object, method).and.callThrough();

            case TestRunnerType.Jest:
                return jest.spyOn(object, method);
        }
    }

    /**
     * Ensure that a mock function is called with specific arguments on an nth call.
     *
     * Jasmine doesn't have the "toHaveBeenNthCalledWith" matcher.
     * This function replaces it for Jasmine and calls existing "toHaveBeenNthCalledWith" for Jest.
     * @param spyFn spy to be checked
     * @param nthCall call number to be checked. Starts from 1.
     * @param params list of params nthCall should be invoked with
     * @param testRunnerType whether it's Jest or Jasmine
     */
    expectToHaveBeenNthCalledWith(spyFn: CompatibleSpy, nthCall: number, params: any[]) {
        if (this.testRunnerType === TestRunnerType.Jest) {
            (<any>expect(spyFn)).toHaveBeenNthCalledWith(nthCall, ...params);
        } else {
            const nthCallArgs = spyFn.calls.argsFor(nthCall - 1);
            expect(nthCallArgs).toEqual(params);
        }
    }

    private getTestRunnerType(): TestRunnerType {
        if (typeof jasmine !== 'undefined') {
            return TestRunnerType.Jasmine;
        }
        if (typeof jest !== 'undefined') {
            return TestRunnerType.Jest;
        }

        throw new Error('Could not identify test environment. Expected to get either "jest" or "jasmine"');
    }
}
