import { bootstrapApplication } from '@angular/platform-browser';
import { CSP_NONCE } from '@angular/core';
import { AppComponent } from './app/app.component';

function readNonce(): string | null {
  const meta = document.querySelector('meta[name="csp-nonce"]') as HTMLMetaElement | null;
  return meta?.content ?? null;
}

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: CSP_NONCE,
      useFactory: () => {
        const nonce = readNonce();
        if (!nonce) {
          console.warn('CSP nonce not found in <meta name="csp-nonce">; check your server injection.');
        }
        return nonce;
      },
    },
  ],
}).catch(err => console.error(err));
