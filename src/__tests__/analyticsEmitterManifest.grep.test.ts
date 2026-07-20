import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ANALYTICS_EMITTER_BE_REFERENCE_PATHS,
  ANALYTICS_EMITTER_MANIFEST,
  ANALYTICS_EMITTER_FE_REFERENCE_PATHS,
} from '../analyticsEmitterManifest.js';

const REPO_ROOT = join(__dirname, '..', '..', '..');

function readSource(relPath: string): string {
  const abs = join(REPO_ROOT, relPath);
  if (!existsSync(abs)) {
    throw new Error(`emitter grep: missing file ${relPath}`);
  }
  return readFileSync(abs, 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function eventPatterns(
  eventName: string,
  reference: string
): RegExp[] {
  if (eventName === 'session_completed') {
    if (reference === 'CloseAnalyticsSessionUseCase') {
      return [
        /this\.emitter\.emit\s*\(/,
        /dto\.outcome\s*===\s*'completed'[\s\S]{0,200}'session_completed'/,
      ];
    }
    if (reference === 'CustomerAnalyticsProvider') {
      return [
        /const\s+NOOP_MANAGER[\s\S]{0,1200}completeSession\s*:\s*async\s*\(/,
        /const\s+manager\s*=\s*useCustomerAnalyticsManager\s*\(/,
      ];
    }
    return [
      /completeSession\s*\(/,
      /(?:emit|track|capture|log)[A-Za-z0-9_]*\s*\([\s\S]{0,1000}?completeSession/,
    ];
  }
  if (eventName === 'session_abandoned') {
    if (reference === 'CloseAnalyticsSessionUseCase') {
      return [
        /this\.emitter\.emit\s*\(/,
        /dto\.outcome\s*===\s*'completed'[\s\S]{0,250}'session_abandoned'/,
      ];
    }
    return [
      /abandonSession\s*\(/,
      /(?:emit|track|capture|log)[A-Za-z0-9_]*\s*\([\s\S]{0,1000}?abandonSession/,
    ];
  }
  if (eventName === 'payment_started' && reference === 'CreateQRPaymentUseCase') {
    return [/mergePaymentStarted\s*\./, /mergePaymentStarted\s*\(/];
  }
  if (reference === 'PhoneFirstDonationJourney') {
    if (eventName === 'screen_viewed') {
      return [/emitDonationScreenViewed\s*\(/];
    }
    if (
      eventName === 'donation_amount_selected' ||
      eventName === 'donation_custom_amount_entered'
    ) {
      return [/emitDonationAmountSelected\s*\(/];
    }
    if (eventName === 'donation_project_selected') {
      return [/emitDonationProjectSelected\s*\(/];
    }
    if (eventName === 'payment_submitted') {
      return [/emitPaymentSubmitted\s*\(/];
    }
  }
  if (reference === 'donationAnalyticsMetadata') {
    if (eventName === 'donation_impact_opened') {
      return [/emitDonationImpactOpened\s*\(/];
    }
    if (eventName === 'donation_tax_receipt_selected') {
      return [/emitDonationTaxReceiptSelected\s*\(/];
    }
    if (eventName === 'recurring_donation_selected') {
      return [/emitRecurringDonationSelected\s*\(/];
    }
    if (eventName === 'donation_abandoned') {
      return [/emitDonationAbandoned\s*\(/];
    }
  }
  if (reference === 'shopAnalyticsMetadata' && eventName === 'retail_order_abandoned') {
    return [/emitRetailOrderAbandoned\s*\(/];
  }
  if (reference === 'PhoneFirstProductJourney' && eventName === 'payment_submitted') {
    return [/emitPaymentSubmitted\s*\(/];
  }
  if (
    reference === 'kioskDonationHandlers' &&
    (eventName === 'donation_amount_selected' || eventName === 'donation_custom_amount_entered')
  ) {
    return [
      /resolveDonationAmountAnalyticsEventName\s*\(/,
      /track\s*\([\s\S]{0,800}eventName:\s*resolveDonationAmountAnalyticsEventName\s*\(/,
    ];
  }
  if (eventName === 'identity_created' && reference === 'OnboardingSetCredentialsScreen') {
    return [
      /const\s+IDENTITY_CREATED_EVENT_NAME[\s\S]{0,120}'identity_created'/,
      /track\s*\([\s\S]{0,800}eventName:\s*IDENTITY_CREATED_EVENT_NAME/,
    ];
  }
  if (
    reference === 'emitRetailFulfillmentAnalytics' ||
    reference === 'emitRetailV7Analytics' ||
    reference === 'emitV814CommerceAnalytics'
  ) {
    return [
      new RegExp(`${reference}[\\s\\S]{0,5000}?['"]${eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`),
      new RegExp(
        `(?:const|type)\\s+[A-Za-z0-9_]*(?:EVENT|EVENTS|Event|Events)[\\s\\S]{0,2000}?['"]${eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
        'i',
      ),
    ];
  }
  const snake = eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const upperSnake = snake.toUpperCase().replace(/-/g, '_');
  return [
    new RegExp(
      `(?:emit|track|capture|log)[A-Za-z0-9_]*\\s*\\([\\s\\S]{0,1200}?\\{[\\s\\S]{0,1200}?eventName:\\s*['"]${snake}['"]`,
    ),
    new RegExp(
      `(?:emit|track|capture|log)[A-Za-z0-9_]*\\s*\\([\\s\\S]{0,1000}?['"]${snake}['"][\\s\\S]{0,1000}?\\)`,
      'i',
    ),
    new RegExp(
      `(?:emit|track|capture|log)[A-Za-z0-9_]*\\s*\\([\\s\\S]{0,1000}?ANALYTICS_[A-Z0-9_]+\\.${upperSnake}[\\s\\S]{0,1000}?\\)`,
      'i',
    ),
    new RegExp(
      `\\b[A-Za-z_$][\\w$.]*\\s*\\([\\s\\S]{0,1000}?['"]${snake}['"][\\s\\S]{0,1000}?\\)`,
      'i',
    ),
    new RegExp(
      `(?:const|type)\\s+[A-Za-z0-9_]*(?:EVENT|EVENTS|Event|Events)[\\s\\S]{0,2000}?['"]${snake}['"]`,
      'i',
    ),
  ];
}

describe('analyticsEmitterManifest grep wiring', () => {
  describe('BE path map (emit grep in up-backend)', () => {
    for (const cell of ANALYTICS_EMITTER_MANIFEST) {
      if (!cell.required || cell.layer !== 'BE') {
        continue;
      }
      it(`${cell.reference} wires ${cell.eventName}`, () => {
        const relPath = ANALYTICS_EMITTER_BE_REFERENCE_PATHS[cell.reference];
        expect(relPath).toBeDefined();
        const source = stripComments(readSource(relPath as string));
        const matched = eventPatterns(cell.eventName, cell.reference).some((re) =>
          re.test(source)
        );
        expect(matched).toBe(true);
      });
    }
  });

  for (const cell of ANALYTICS_EMITTER_MANIFEST) {
    if (!cell.required || cell.layer !== 'FE') {
      continue;
    }
    const relPath = ANALYTICS_EMITTER_FE_REFERENCE_PATHS[cell.reference];
    if (relPath === undefined) {
      throw new Error(`missing FE path map for ${cell.reference}`);
    }

    it(`${cell.reference} wires ${cell.eventName}`, () => {
      const source = stripComments(readSource(relPath));
      const matched = eventPatterns(cell.eventName, cell.reference).some((re) =>
        re.test(source)
      );
      expect(matched).toBe(true);
    });
  }
});
