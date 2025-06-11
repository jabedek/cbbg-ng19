import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[appEllipsisTip]',
  providers: [MatTooltip],
})
export class EllipsisTipDirective {
  @Input() ellipsisTip: { maxChars: number; showTooltip: boolean; colorCss: string } = {
    maxChars: 7,
    showTooltip: true,
    colorCss: 'black',
  };

  element = inject(ElementRef<HTMLElement>);

  get text() {
    const htmlEl = this.element.nativeElement as HTMLElement;
    const elText = htmlEl.textContent || '';
    return elText;
  }

  @HostListener('mouseover') mouseover() {
    this.tooltip.message = this.text;
    this.tooltip.show();
  }
  @HostListener('mouseleave') mouseleave() {
    this.tooltip.hide();
  }

  constructor(private tooltip: MatTooltip) {
    const htmlEl = this.element.nativeElement as HTMLElement;

    const elText = htmlEl.textContent || htmlEl.innerText || htmlEl.innerHTML || '';
    console.log(
      this.element.nativeElement,
      this.element.nativeElement.textContent,
      this.element.nativeElement.innerText,
      this.element.nativeElement.innerHTML,
    );

    // if (elText.length > this.ellipsisTip.maxChars) {
    //   this.element.nativeElement.textContent = `${elText.substring(0, this.ellipsisTip.maxChars)}...`;
    // }
    this.element.nativeElement.style.color = this.ellipsisTip.colorCss;
  }
}
