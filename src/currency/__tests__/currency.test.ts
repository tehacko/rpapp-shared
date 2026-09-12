import {

  CURRENCY_CODES,

  isCurrencyCode,

  resolveRuntimeDefaultCurrency,

  shouldShowCheckoutCurrencyPicker,

  normalizeAcceptedCurrencies,

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


