import {
  CURRENCY_CODES,
  PLATFORM_DEFAULT_CURRENCY,
  isCurrencyCode,
  resolveRuntimeDefaultCurrency,
  resolveHealPreferredDefault,
  shouldShowCheckoutCurrencyPicker,
  normalizeAcceptedCurrencies,
  ensureAcceptedCurrenciesForCheckout,
  resolveCatalogUnitPriceMajor,
} from '../index.js';



describe('currency registry', () => {

  it('exports CZK and EUR', () => {

    expect(CURRENCY_CODES).toEqual(['CZK', 'EUR']);

  });



  it('validates currency codes', () => {

    expect(isCurrencyCode('CZK')).toBe(true);

    expect(isCurrencyCode('EUR')).toBe(true);

    expect(isCurrencyCode('USD')).toBe(false);

  });



  it('resolves runtime default preferring CZK', () => {
    expect(resolveRuntimeDefaultCurrency(['EUR', 'CZK'])).toBe('CZK');
    expect(resolveRuntimeDefaultCurrency(['EUR'])).toBe('EUR');
    expect(resolveRuntimeDefaultCurrency([])).toBeNull();
  });

  it('PLATFORM_DEFAULT_CURRENCY is CZK', () => {
    expect(PLATFORM_DEFAULT_CURRENCY).toBe('CZK');
  });

  it('ensureAcceptedCurrenciesForCheckout keeps non-empty SP accepted list', () => {
    expect(ensureAcceptedCurrenciesForCheckout(['eur', 'CZK'])).toEqual(['EUR', 'CZK']);
    expect(ensureAcceptedCurrenciesForCheckout(['EUR'], 'CZK')).toEqual(['EUR']);
  });

  it('ensureAcceptedCurrenciesForCheckout falls back to preferredDefault when empty', () => {
    expect(ensureAcceptedCurrenciesForCheckout([], 'eur')).toEqual(['EUR']);
    expect(ensureAcceptedCurrenciesForCheckout(null, ' EUR ')).toEqual(['EUR']);
    expect(ensureAcceptedCurrenciesForCheckout(undefined, 'CZK')).toEqual(['CZK']);
  });

  it('ensureAcceptedCurrenciesForCheckout falls back to CZK when empty and no valid preferred', () => {
    expect(ensureAcceptedCurrenciesForCheckout([])).toEqual(['CZK']);
    expect(ensureAcceptedCurrenciesForCheckout(null)).toEqual(['CZK']);
    expect(ensureAcceptedCurrenciesForCheckout(undefined, null)).toEqual(['CZK']);
    expect(ensureAcceptedCurrenciesForCheckout([], 'USD')).toEqual(['CZK']);
    expect(ensureAcceptedCurrenciesForCheckout([], '  ')).toEqual(['CZK']);
  });

  it('resolveRuntimeDefaultCurrency([]) stays null (admin fail-closed)', () => {
    expect(resolveRuntimeDefaultCurrency([])).toBeNull();
    expect(ensureAcceptedCurrenciesForCheckout([])).toEqual(['CZK']);
  });

  it('resolveHealPreferredDefault: EUR-only allow + default EUR → EUR', () => {
    expect(
      resolveHealPreferredDefault({
        defaultCurrency: 'EUR',
        allowedCurrencies: ['EUR'],
      }),
    ).toBe('EUR');
  });

  it('resolveHealPreferredDefault: empty allow + default EUR → EUR', () => {
    expect(
      resolveHealPreferredDefault({
        defaultCurrency: 'EUR',
        allowedCurrencies: [],
      }),
    ).toBe('EUR');
  });

  it('resolveHealPreferredDefault: empty everything → CZK', () => {
    expect(resolveHealPreferredDefault({})).toBe('CZK');
    expect(
      resolveHealPreferredDefault({
        defaultCurrency: null,
        allowedCurrencies: null,
      }),
    ).toBe('CZK');
  });

  it('resolveHealPreferredDefault: default USD falls through to allow/CZK', () => {
    expect(
      resolveHealPreferredDefault({
        defaultCurrency: 'USD',
        allowedCurrencies: ['EUR'],
      }),
    ).toBe('EUR');
    expect(
      resolveHealPreferredDefault({
        defaultCurrency: 'USD',
        allowedCurrencies: [],
      }),
    ).toBe('CZK');
    expect(
      resolveHealPreferredDefault({
        defaultCurrency: 'USD',
      }),
    ).toBe('CZK');
  });

  it('shouldShowCheckoutCurrencyPicker requires MULTI and ≥2 codes', () => {

    expect(shouldShowCheckoutCurrencyPicker('MULTI', ['CZK', 'EUR'])).toBe(true);

    expect(shouldShowCheckoutCurrencyPicker('MULTI', ['CZK'])).toBe(false);

    expect(shouldShowCheckoutCurrencyPicker('SINGLE', ['CZK', 'EUR'])).toBe(false);

  });



  it('normalizeAcceptedCurrencies dedupes and filters', () => {

    expect(normalizeAcceptedCurrencies(['eur', 'CZK', 'EUR', 'USD'])).toEqual([

      'EUR',

      'CZK',

    ]);

  });



  it('resolveCatalogUnitPriceMajor prefers matching ProductPrice row', () => {

    expect(

      resolveCatalogUnitPriceMajor(

        {

          price: 100,

          prices: [

            { currency: 'CZK', amountMajor: 100 },

            { currency: 'EUR', amountMajor: 4 },

          ],

        },

        'EUR',

      ),

    ).toBe(4);

  });

  it('resolveCatalogUnitPriceMajor never returns CZK-shaped Product.price for EUR', () => {
    expect(resolveCatalogUnitPriceMajor({ price: 100 }, 'EUR')).toBe(0);
    expect(
      resolveCatalogUnitPriceMajor(
        {
          price: 100,
          prices: [{ currency: 'CZK', amountMajor: 100 }],
        },
        'EUR',
      ),
    ).toBe(0);
  });

  it('resolveCatalogUnitPriceMajor allows legacy Product.price for CZK without prices[]', () => {
    expect(resolveCatalogUnitPriceMajor({ price: 100 }, 'CZK')).toBe(100);
  });

});


