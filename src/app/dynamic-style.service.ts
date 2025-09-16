import { Injectable, Inject, CSP_NONCE } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DynamicStyleService {
  private styleEl?: HTMLStyleElement;

  private static readonly STYLE_ID_PREFIX = 'dynamic-styles';
  private static _counter = 0;

  constructor(@Inject(CSP_NONCE) private nonce: string | null) { }

  /**
   * Ensures the dynamic <style> element exists and returns its CSSStyleSheet
   * @returns the CSSStyleSheet object of the dynamically created <style> element
   */
  private ensure(id?: string): CSSStyleSheet {
    if (id == undefined) {
      console.debug(`%c:ensure: id=${id}`, `background-color: violet; color: white;`, this.styleEl, id);
      id = `${DynamicStyleService.STYLE_ID_PREFIX}-${DynamicStyleService._counter}`;
      this.styleEl = undefined; // force new <style> creation
    }
    else {
      id = id.startsWith(`${DynamicStyleService.STYLE_ID_PREFIX}-`) ? id : `${DynamicStyleService.STYLE_ID_PREFIX}-${id}`;
      console.debug(`%c:ensure: id=${id}`, `background-color: black; color: white;`, this.styleEl, id);
      const el = document.getElementById(id) as HTMLStyleElement;
      this.styleEl = el || undefined
    }
    if (!this.styleEl) {
      // create style element
      this.styleEl = document.createElement('style');
      if (this.nonce) {
        this.styleEl.setAttribute('nonce', this.nonce);
      } else {
        console.warn('CSP_NONCE not provided; dynamic <style> will be blocked by strict CSP.');
      }
      // generate a unique id with 'dynamic-styles' prefix
      this.styleEl.id = `dynamic-styles-${++DynamicStyleService._counter}`;
      document.head.appendChild(this.styleEl);
    }
    return this.styleEl.sheet as CSSStyleSheet;
  }

  /**
   * Adds a single CSS rule
   * @param selector The CSS selector
   * @param declarations The CSS declarations
   */
  setRule(selector: string, declarations: string, id?: string) {
    const sheet = this.ensure(id);
    const rule = `${selector}{${declarations}}`;
    try {
      sheet.insertRule(rule, sheet.cssRules.length);
      if (this.styleEl) {
        this.styleEl.appendChild(document.createTextNode(rule));
      }
      console.debug(`%c:dynamic-style:setRule:insertRule:`, `background-color: blue; color: white;`, this.styleEl, selector, declarations);
    } catch (err) {
      // Fallback: if insertRule fails (e.g., due to CSP/CSSOM quirks or invalid CSS), append text directly
      if (this.styleEl) {
        this.styleEl.appendChild(document.createTextNode(rule));
      }
      console.debug(`%c:dynamic-style:setRule:insertRule:`, `background-color: green; color: white;`, this.styleEl, document.head);
    }
  }

  /**
   * Adds multiple CSS rules
   * @param rules A string containing multiple CSS rules
   */
  setRules(rules: string, id?: string) {
    const sheet = this.ensure(id);
    const text = rules.trim();
    // Append the whole rules string as a single text node (no parsing)
    if (this.styleEl) {
      try {
        this.styleEl.textContent = ''; // clear existing content to avoid duplicates
        this.styleEl.appendChild(document.createTextNode(text));
        console.debug(`%c:dynamic-style:setRules:appendText:`, `background-color: red; color: white;`, this.styleEl, text);
      } catch (err) {
        // fallback to textContent concat
        this.styleEl.textContent = (this.styleEl.textContent || '') + text;
        console.debug(`%c:dynamic-style:setRules:appendText:failed:`, `background-color: purple; color: white;`, this.styleEl, err);
      }
    }
  }

  /**
   * inserts nonce attribute to the style element
   * @param textContent The full text content to insert into a new <style> element
   */
  insertNonce(element: string): string {
    // Match the opening <style ...> tag
    const openTagRe = /(<style\b)([^>]*)(>)/i;
    const match = element.match(openTagRe);
    if (!match) {
      // Not a <style> element string; just return it unchanged
      return element;
    }

    const nonceAttrRe = /\bnonce\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i;
    const replaced = element.replace(openTagRe, (_m, start: string, attrs: string, end: string) => {
      if (nonceAttrRe.test(attrs)) {
        // Replace existing nonce value
        attrs = attrs.replace(nonceAttrRe, `nonce="${this.nonce}"`);
      } else {
        // Insert nonce attribute preserving existing spacing
        attrs = `${attrs} nonce="${this.nonce}"`;
      }
      return `${start}${attrs}${end}`;
    });

    return replaced;
  }
}
