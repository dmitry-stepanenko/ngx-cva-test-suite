import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewChild,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    ChangeDetectorRef,
    Output,
    EventEmitter,
    forwardRef,
    OnChanges,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    Observable,
    EMPTY,
    Subscription,
    fromEvent,
    merge,
    combineLatest,
    OperatorFunction,
} from 'rxjs';
import { switchMap, distinctUntilChanged, takeUntil, finalize, map, filter, delay } from 'rxjs/operators';

const DEFAULT_STEP_SIZE = 0.5;
const DEFAULT_MAX_VALUE = 10;

const STAR_RATING_CONTROL_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => StarRatingComponent),
    multi: true,
};

@Component({
    selector: 'lib-star-rating',
    templateUrl: './star-rating.component.html',
    styleUrls: ['./star-rating.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [STAR_RATING_CONTROL_ACCESSOR],
})
export class StarRatingComponent implements ControlValueAccessor, AfterViewInit, OnDestroy, OnChanges {
    @Output() valueChanged = new EventEmitter<number>();
    /** value that should be displayed */
    @Input() set value(value: number) {
        this.setControlValue(value, false);
    }
    get value() {
        return this.starControl.value;
    }
    /**
     * Maximum possible value.
     *
     * E.g. if you have rating 9.7 / 10, should pass 9.7 as a `value` and 10 as a `maxValue`
     */
    @Input() maxValue = DEFAULT_MAX_VALUE;
    @Input() readonly = false;

    /**
     * If set to `false`, component will not be interactive.
     * It won't apply any "disabled" styling, you just can't choose anything
     */
    @Input() set interactive(isInteractive: boolean) {
        this.isInteractive$.next(isInteractive);
    }
    readonly isInteractive$ = new BehaviorSubject(true);
    /**
     * Extends interactive option.
     * If set to `true`, component will not be interactive and will implement disabled styles (if provided)
     */
    @Input() set disabled(isDisabled: boolean) {
        this.setDisabledState(isDisabled);
    }
    get disabled(): boolean {
        return this.starControl.disabled;
    }

    private disabledStateChanged$ = new BehaviorSubject(false);

    /**
     * The values at which the rating will snap within one star.
     *
     * Can be 0.1, 0.5 and 1, where 1 - whole star, 0.1 - star's tenth part.
     * Defaults to `0.5`
     */
    @Input() set stepSize(value: number) {
        if (!isNaN(parseFloat(value as any)) && [0.1, 0.5, 1].includes(parseFloat(value as any))) {
            this._stepSize = value;
        }
    }
    get stepSize(): number {
        return this._stepSize;
    }
    private _stepSize = DEFAULT_STEP_SIZE;
    /** temporary value, that is used when hovering icons in select mode  */
    set visualPercent(value: number | null) {
        this._visualPercent = value;
        this.cdr.detectChanges();
    }
    get visualPercent(): number | null {
        return this._visualPercent;
    }
    private _visualPercent: number | null;

    get fillPercent(): number {
        if (this.visualPercent || this.visualPercent === 0) {
            return this.visualPercent;
        }
        return roundWithTenth(Math.min((this.value / this.maxValue) * 100, 100)) || 0;
    }

    /** title that will be displayed when hovering icons */
    get title(): string {
        return `${roundWithTenth((this.fillPercent / 100) * this.maxValue)}/${this.maxValue}`;
    }

    onChange: Function;
    onTouched: Function;

    @ViewChild('ratingContainer') ratingContainer: ElementRef<HTMLDivElement>;
    readonly starControl = new FormControl();
    private readonly afterViewInit$ = new Subject<void>();
    private readonly subscriptions = new Subscription();

    constructor(private cdr: ChangeDetectorRef) {
        this.subscriptions.add(
            this.starControl.valueChanges.pipe(filter(() => !this.disabled)).subscribe((v) => {
                this.valueChanged.emit(v);
                if (this.onChange) {
                    this.onChange(v);
                    this.onTouched();
                }
            })
        );
        // doubled startWith is needed since we are using pairwise
        this.subscriptions.add(
            this.afterViewInit$
                .pipe(
                    switchMap(() => combineLatest([this.isInteractive$, this.disabledStateChanged$])),
                    map(([interactive, disabled]) => interactive && !disabled),
                    distinctUntilChanged(),
                    switchMap((isInteractive) => {
                        if (isInteractive) {
                            return this.getInteractionPercent();
                        }
                        return EMPTY;
                    })
                )
                .subscribe((percent) => this.setControlValue(roundWithTenth((this.maxValue * percent) / 100)))
        );
    }

    ngAfterViewInit() {
        this.afterViewInit$.next();
        this.afterViewInit$.complete();
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    ngOnChanges() {
        if (this.readonly) {
            this.interactive = false;
        }
    }

    registerOnChange(fn: Function) {
        this.onChange = fn;
    }
    registerOnTouched(fn: Function) {
        this.onTouched = fn;
    }

    writeValue(value: number) {
        this.setControlValue(value, false);
    }

    setDisabledState(isDisabled: boolean) {
        isDisabled ? this.starControl.disable({ emitEvent: false }) : this.starControl.enable({ emitEvent: false });
        this.disabledStateChanged$.next(this.starControl.disabled);
        this.cdr.detectChanges();
    }

    getInteractionPercent(): Observable<number> {
        const enter$ = fromEvent<PointerEvent>(this.ratingContainer.nativeElement, 'pointerenter');
        const move$ = fromEvent<PointerEvent>(this.ratingContainer.nativeElement, 'pointermove');
        const out$ = fromEvent<PointerEvent>(this.ratingContainer.nativeElement, 'pointerleave');
        const cancel$ = fromEvent<PointerEvent>(this.ratingContainer.nativeElement, 'pointercancel');
        const click$ = fromEvent<PointerEvent>(this.ratingContainer.nativeElement, 'click');
        return merge(
            click$.pipe(this.mapToPercent()), // getting percent from click event. it will be used as selected value
            enter$.pipe(
                delay(10), // is needed to have click event to emit earlier
                switchMap(() =>
                    move$.pipe(
                        this.mapToPercent(), // setting visual percent
                        switchMap(() => EMPTY), // should not emit anything
                        takeUntil(merge(out$, cancel$, click$)),
                        finalize(() => (this.visualPercent = null))
                    )
                )
            )
        );
    }

    /**
     * extracts visual percent in view from the provided event.
     * assigns it to visualPercent and returns it
     */
    private mapToPercent(): OperatorFunction<PointerEvent, number> {
        const rect = this.ratingContainer.nativeElement.getBoundingClientRect();
        return (src$) =>
            src$.pipe(
                map((event) => {
                    const xPos = event.clientX - rect.left; // x position within the element.
                    const percent = roundWithTenth((xPos / rect.width) * 100);
                    const percentWithShift = this.getPercentWithStepShift(percent);
                    this.visualPercent = percentWithShift;
                    return percentWithShift;
                })
            );
    }

    /** calculates percent, that should be displayed when selecting value. depends on the step size */
    getPercentWithStepShift(percent: number) {
        const starCount = 5; // currently using 5 stars, so this should not be dynamic
        const step = (100 / starCount) * this.stepSize;
        return Math.min(Math.ceil((percent || 1) / step) * step, 100);
    }

    private setControlValue(value: number, emitEvent = true) {
        this.starControl.setValue(Math.min(!value || value < 0 ? 0 : value, this.maxValue), { emitEvent });
        this.cdr.detectChanges();
    }
}

function roundWithTenth(num: number): number {
    return Math.round(num * 10) / 10;
}
