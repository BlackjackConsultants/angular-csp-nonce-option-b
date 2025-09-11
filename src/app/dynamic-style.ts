import { Injectable, Inject, CSP_NONCE } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DynamicStyleService {
  private styleEl?: HTMLStyleElement;

  constructor(@Inject(CSP_NONCE) private nonce: string | null) {}

  private ensure(): CSSStyleSheet {
    if (!this.styleEl) {
      this.styleEl = document.createElement('style');
      if (this.nonce) {
        this.styleEl.setAttribute('nonce', this.nonce);
      } else {
        console.warn('CSP_NONCE not provided; dynamic <style> will be blocked by strict CSP.');
      }
      this.styleEl.id = 'dynamic-styles';
      console.debug(`%c:dynamic-style:ensure:`, `background-color: blue; color: white;`, this.styleEl, document.head);
      document.head.appendChild(this.styleEl);
    }
    return this.styleEl.sheet as CSSStyleSheet;
    }

  setRule(selector: string, declarations: string) {
    const sheet = this.ensure();
    sheet.insertRule(`${selector}{${declarations}}`, sheet.cssRules.length);
  }
}
