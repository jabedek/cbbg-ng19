import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-see-data',
  imports: [CommonModule],
  template: `
    <div class="see-data-wrapper" [style.left.px]="0">
      <button (click)="hidden = !hidden">{{ _instance + 1 }}# Toggle {{ title }}</button>
      <pre [ngStyle]="{ position }" [ngClass]="{ hidden }">{{ data | json }}</pre>
    </div>
  `,
  styleUrl: './see-data.component.scss',
})
export class SeeDataComponent implements OnInit, OnDestroy {
  static instances = 0;

  _instance = 0;

  get horizontalTranslation() {
    const paddingPx = 10;
    const widthPx = 450;
    return (widthPx + paddingPx) * this._instance;
  }
  hidden = true;
  @Input({ required: true }) title = '';
  @Input() set data(data: any) {
    const sortedKeys = Object.keys(data).sort();
    this._data = sortedKeys.reduce((acc, newVal) => Object.assign({}, acc, { [newVal]: data[newVal] }), {});
    this.dataOnSet();
  }
  get data(): any {
    return this._data;
  }
  private _data: any = undefined;
  private dataOnSet(args?: any) {
    return;
  }

  @Input() set attachToLayout(attachToLayout: boolean) {
    this._attachToLayout = attachToLayout;
    this.attachToLayoutOnSet(attachToLayout);
  }
  get attachToLayout(): boolean {
    return this._attachToLayout;
  }
  private _attachToLayout = false;
  private attachToLayoutOnSet(attachToLayout: boolean) {
    if (attachToLayout) {
      this.attach();
    }
    return;
  }

  @Input() position = 'relative';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    if (this.attachToLayout) {
      this.attach();
    }

    this._instance = SeeDataComponent.instances;

    if (this._instance === 0) {
      this.hidden = false;
    }
    SeeDataComponent.instances++;
  }

  ngOnDestroy(): void {
    SeeDataComponent.instances--;
  }

  ngOnInit(): void {
    const el = this.el.nativeElement;
    this.renderer.setStyle(this.el.nativeElement, 'left', `${this.horizontalTranslation}px`);
  }

  attach() {
    // const layout = this.document.querySelector('app-see-datas');
    // if (layout) {
    //   this.renderer.appendChild(layout, this.el.nativeElement);
    // }
  }
}
