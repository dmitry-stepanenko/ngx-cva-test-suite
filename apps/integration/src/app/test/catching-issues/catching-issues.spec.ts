/* eslint-disable prefer-rest-params */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CVATestSteps } from 'ngx-cva-test-suite';
import { CounterControlComponent } from './../../controls/counter/counter.component';
import { checkCVATestStepToFail } from './test-failure-helpers';

const counterMetadata = {
    selector: 'lib-counter',
    template: `
        <button (click)="down()" [disabled]="disabled">Down</button>
        {{ value }}
        <button (click)="up()" [disabled]="disabled">Up</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
};

@Component(counterMetadata)
class CounterMock1Component extends CounterControlComponent {
    writeValue(value: number) {
        this.setValue(value, true);
    }
}

@Component(counterMetadata)
class CounterMock2Component extends CounterControlComponent {
    writeValue(value: number) {
        this.onChange(value);
        this.setValue(value, false);
    }
}

@Component(counterMetadata)
class CounterMock3Component extends CounterControlComponent {
    setValue(value: number) {
        if (value) {
            super.setValue(value, true);
        }
    }
}

describe('Catching issues', () => {
    if (typeof jasmine !== 'undefined') {
        // run these tests only in jest
        it('empty test', () => {
            expect(true).toBe(true);
        });
    } else {
        checkCVATestStepToFail(CounterMock1Component, CVATestSteps.ValueSetExternally, { getValues: () => [0, 1, 2] });
        checkCVATestStepToFail(CounterMock2Component, CVATestSteps.ValueSetExternally, { getValues: () => [0, 1, 2] });
        checkCVATestStepToFail(CounterMock3Component, CVATestSteps.ValueSetExternally, { getValues: () => [0, 1, 2] });
    }
});
