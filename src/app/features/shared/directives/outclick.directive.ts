import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { fromEvent, tap, takeUntil, Subject } from 'rxjs';

@Directive({
  selector: '[appOutclick]',
})
export class OutclickDirective implements OnDestroy {
  __destroy = new Subject<void>();
  @Input() outclickActive = true;
  @Output() closeOutclick = new EventEmitter<void>();

  fromEvent$ = fromEvent(document, 'mousedown', { capture: true }).pipe(
    tap((event) => {
      if (this.el) {
        const target = event.target as HTMLElement;
        const classes = target.classList;

        const inThisElement = this.el.nativeElement.contains(target);
        const inBurgerMenuElement =
          classes.contains('burger__line') || classes.contains('burger') || classes.contains('burger-menu-content');

        if (inThisElement || inBurgerMenuElement) {
          return;
        } else {
          if (this.outclickActive) {
            this.closeOutclick.emit();
          }
        }
      }
    }),
  );

  constructor(public el: ElementRef) {
    this.fromEvent$.pipe(takeUntil(this.__destroy)).subscribe();
  }

  ngOnDestroy(): void {
    this.__destroy.next();
    this.__destroy.complete();
  }
}
