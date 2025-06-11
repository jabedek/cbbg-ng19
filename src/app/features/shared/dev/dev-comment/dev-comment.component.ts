import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dev-comment',
  imports: [],
  template: ``,
  styleUrl: './dev-comment.component.scss',
})
export class DevCommentComponent {
  @Input() text = '';
}
