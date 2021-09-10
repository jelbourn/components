/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
} from '@angular/core';
import {CanDisable, mixinDisabled, ThemePalette} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';


let nextId = 0;

// Boilerplate for applying mixins to MatBadge.
/** @docs-private */
const _MatBadgeBase = mixinDisabled(class {});

/** Allowed position options for matBadgePosition */
export type MatBadgePosition =
    'above after' | 'above before' | 'below before' | 'below after' |
    'before' | 'after' | 'above' | 'below';

/** Allowed size options for matBadgeSize */
export type MatBadgeSize = 'small' | 'medium' | 'large';

/** Directive to display a text badge. */
@Directive({
  selector: '[matBadge]',
  inputs: ['disabled: matBadgeDisabled'],
  host: {
    'class': 'mat-badge',
    '[attr.aria-describedby]': 'description || content || null',
    '[class.mat-badge-overlap]': 'overlap',
    '[class.mat-badge-above]': 'isAbove()',
    '[class.mat-badge-below]': '!isAbove()',
    '[class.mat-badge-before]': '!isAfter()',
    '[class.mat-badge-after]': 'isAfter()',
    '[class.mat-badge-small]': 'size === "small"',
    '[class.mat-badge-medium]': 'size === "medium"',
    '[class.mat-badge-large]': 'size === "large"',
    '[class.mat-badge-hidden]': 'hidden || !_hasContent',
    '[class.mat-badge-disabled]': 'disabled',
  },
})
export class MatBadge extends _MatBadgeBase implements OnDestroy, OnChanges, CanDisable {
  /** Whether the badge has any content. */
  _hasContent = false;

  /** The color of the badge. Can be `primary`, `accent`, or `warn`. */
  @Input('matBadgeColor')
  get color(): ThemePalette { return this._color; }
  set color(value: ThemePalette) {
    this._setColor(value);
    this._color = value;
  }
  private _color: ThemePalette = 'primary';

  /** Whether the badge should overlap its contents or not */
  @Input('matBadgeOverlap')
  get overlap(): boolean { return this._overlap; }
  set overlap(val: boolean) {
    this._overlap = coerceBooleanProperty(val);
  }
  private _overlap: boolean = true;

  /**
   * Position the badge should reside.
   * Accepts any combination of 'above'|'below' and 'before'|'after'
   */
  @Input('matBadgePosition') position: MatBadgePosition = 'above after';

  /** The content for the badge */
  @Input('matBadge') content: string | number | undefined | null;

  /** Message used to describe the decorated element via aria-describedby */
  @Input('matBadgeDescription')
  get description(): string { return this._description; }
  set description(newDescription: string) {
    this._description = newDescription;
  }
  private _description: string;

  /** Size of the badge. Can be 'small', 'medium', or 'large'. */
  @Input('matBadgeSize') size: MatBadgeSize = 'medium';

  /** Whether the badge is hidden. */
  @Input('matBadgeHidden')
  get hidden(): boolean { return this._hidden; }
  set hidden(val: boolean) {
    this._hidden = coerceBooleanProperty(val);
  }
  private _hidden: boolean;

  /** Unique id for the badge */
  _id: number = nextId++;

  /** Visible badge element. */
  private _badgeElement: HTMLElement = this._createBadgeElement();

  constructor(
      private _ngZone: NgZone,
      private _elementRef: ElementRef<HTMLElement>,
      @Optional() @Inject(ANIMATION_MODULE_TYPE) private _animationMode?: string) {
      super();

      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const nativeElement = _elementRef.nativeElement;
        if (nativeElement.nodeType !== nativeElement.ELEMENT_NODE) {
          throw Error('matBadge must be attached to an element node.');
        }
      }
    }

  /** Whether the badge is above the host or not */
  isAbove(): boolean {
    return this.position.indexOf('below') === -1;
  }

  /** Whether the badge is after the host or not */
  isAfter(): boolean {
    return this.position.indexOf('before') === -1;
  }

  ngOnChanges(changes: SimpleChanges) {
    const contentChange = changes['content'];
    if (contentChange) {
      this._badgeElement.textContent = contentChange.currentValue;
      this._hasContent = !!`${contentChange.currentValue ?? ''}`.trim();
    }
  }

  ngOnDestroy() {
    this._badgeElement.remove();
  }

  /** Creates the badge element */
  private _createBadgeElement(): HTMLElement {
    const badgeElement = document.createElement('span');
    const activeClass = 'mat-badge-active';
    const contentClass = 'mat-badge-content';

    // Clear any existing badges which may have persisted from a server-side render.
    this._clearExistingBadges(contentClass);
    badgeElement.setAttribute('id', `mat-badge-content-${this._id}`);

    // The badge is aria-hidden because we don't want it to appear in the page's navigation
    // flow. Instead, we use the badge to describe the decorated element with aria-describedby.
    badgeElement.setAttribute('aria-hidden', 'true');
    badgeElement.classList.add(contentClass);

    // While `this.content` can be a number or null, setting these directly to
    // textContent automatically coerces the value to the string we want.
    badgeElement.textContent = this.content as string;

    if (this._animationMode === 'NoopAnimations') {
      badgeElement.classList.add('_mat-animation-noopable');
    }

    this._elementRef.nativeElement.appendChild(badgeElement);

    // animate in after insertion
    if (typeof requestAnimationFrame === 'function' && this._animationMode !== 'NoopAnimations') {
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          badgeElement.classList.add(activeClass);
        });
      });
    } else {
      badgeElement.classList.add(activeClass);
    }

    return badgeElement;
  }

  /** Adds css theme class given the color to the component host */
  private _setColor(colorPalette: ThemePalette) {
    const classList = this._elementRef.nativeElement.classList;
    classList.remove(`mat-badge-${this._color}`);
    if (colorPalette) {
      classList.add(`mat-badge-${colorPalette}`);
    }
  }

  /** Clears any existing badges that might be left over from server-side rendering. */
  private _clearExistingBadges(cssClass: string) {
    const element = this._elementRef.nativeElement;
    let childCount = element.children.length;

    // Use a reverse while, because we'll be removing elements from the list as we're iterating.
    while (childCount--) {
      const currentChild = element.children[childCount];

      if (currentChild.classList.contains(cssClass)) {
        element.removeChild(currentChild);
      }
    }
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_hidden: BooleanInput;
  static ngAcceptInputType_overlap: BooleanInput;
}
