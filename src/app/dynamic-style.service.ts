import { Injectable, Inject, CSP_NONCE } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DynamicStyleService {
  private styleEl?: HTMLStyleElement;

  constructor(@Inject(CSP_NONCE) private nonce: string | null) { }

  private ensure(): CSSStyleSheet {
    if (!this.styleEl) {
      this.styleEl = document.createElement('style');
      if (this.nonce) {
        this.styleEl.setAttribute('nonce', this.nonce);
      } else {
        console.warn('CSP_NONCE not provided; dynamic <style> will be blocked by strict CSP.');
      }
      this.styleEl.id = 'dynamic-styles';
      document.head.appendChild(this.styleEl);
    }
    return this.styleEl.sheet as CSSStyleSheet;
  }

  setRule(selector: string, declarations: string) {
    const sheet = this.ensure();
    const rule = `${selector}{${declarations}}`;
    try {
      sheet.insertRule(rule, sheet.cssRules.length);
      if (this.styleEl) {
        this.styleEl.appendChild(document.createTextNode(rule));
      }
      console.debug(`%c:dynamic-style:setRule:insertRule:`, `background-color: blue; color: white;`, this.styleEl, document.head);
    } catch (err) {
      // Fallback: if insertRule fails (e.g., due to CSP/CSSOM quirks or invalid CSS), append text directly
      if (this.styleEl) {
        this.styleEl.appendChild(document.createTextNode(rule));
      }
      console.debug(`%c:dynamic-style:setRule:insertRule:`, `background-color: green; color: white;`, this.styleEl, document.head);
    }
  }
}
