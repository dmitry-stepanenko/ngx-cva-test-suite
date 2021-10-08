import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterControlComponent } from './counter.component';

@NgModule({
    declarations: [CounterControlComponent],
    imports: [CommonModule],
    exports: [CounterControlComponent],
})
export class CounterModule {}
