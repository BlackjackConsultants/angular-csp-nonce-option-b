import { Component, OnInit, inject } from '@angular/core';
import { DynamicStyleService } from './dynamic-style.service';
import { ContactComponent } from './contact/contact.component'; // <-- adjust path if needed

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ContactComponent],
  template: `
    <main class="shell">
      <h1>Angular CSP Nonce — Option B</h1>
      <p class="badge">If this badge is styled, the nonce worked.</p>
      <p class="from-service1">This box is styled by a nonce-tagged &lt;style&gt; created at runtime.</p>
      <app-contact></app-contact>
    </main>
  `,
  styles: [`
    .shell { padding: 24px; font: 14px/1.4 system-ui, Arial, sans-serif; }
    .badge { display:inline-block; padding:8px 12px; border-radius:8px; color:#fff; background:#1976d2; }
  `]
})
export class AppComponent implements OnInit {
  private dyn = inject(DynamicStyleService);

  ngOnInit(): void {
    // Demonstrate adding your own runtime <style> that carries the same nonce
    this.dyn.setRule('.from-service1', 'margin-top:12px; padding:10px; border-radius:8px; background-color:orange;color:black;', true);
    this.dyn.setRules('.from-service2:hover { background-color:yellow; color:black; } .badge:hover { background-color:#004ba0; }', true);
    this.dyn.setRules('.from-service3:hover { background-color:lightgreen; color:black; } .badge:hover { background-color:white; }', false);
    this.dyn.setRules('.from-service4:hover { background-color:black; color:white; } .badge:hover { background-color:white; }', false);
  }
}
