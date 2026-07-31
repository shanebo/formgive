/*
  Recipes — named formgive sugar for common field shapes.

  A recipe is responsible for:
  - Choosing the schema primitive (string / number / boolean / object / …)
  - Any validation, format, or phrase baked into that control
  - Default .field({ component, type, …attrs }) when those differ from enrich
    defaults, plus attrs (autocomplete, prefix, step, nested children, …)

  Recipes do not own kit rendering (Fields / Select / Choice do that) and do
  not invent a parallel prop vocabulary — they set the same component / type /
  attrs that callers would write by hand.

  Name collisions with core factories:
  - Core `date` / `float` stay as schema primitives.
  - Input+date sugar is `dateInput`; number float sugar is `decimal`.
*/


import countries from './countries.js';
import { humanize, toCurrency, formatDate } from './utils.js';


function registerRecipes(formgive) {
  const { string, number, object, define } = formgive;

  define('text', () => string()
    .field({
      autocapitalize: null,
      autocomplete: null,
      autocorrect: null,
      spellcheck: null,
      xAutocompletetype: null
    }));


  define('name', () => string()
    .field({
      autocapitalize: 'on',
      autocomplete: 'name',
      autocorrect: 'off',
      spellcheck: 'off',
      xAutocompletetype: 'name-full'
    }));


  define('email', () => string()
    .field({
      type: 'email',
      autocapitalize: 'off',
      autocomplete: 'email',
      autocorrect: 'off',
      spellcheck: 'off',
      xAutocompletetype: 'email'
    }));


  define('phone', () => string()
    .field({
      type: 'tel',
      autocapitalize: 'off',
      autocomplete: 'phone',
      autocorrect: 'off',
      spellcheck: 'off',
      xAutocompletetype: 'phone'
    }));


  define('ccnumber', () => string()
    .field({
      type: 'tel',
      autocapitalize: 'off',
      autocomplete: 'ccnumber',
      autocorrect: 'off',
      spellcheck: 'off',
      xAutocompletetype: 'ccnumber'
    }));


  define('currency', () => number()
    .field({
      prefix: '$',
      format: toCurrency,
      step: '.01',
      autocapitalize: 'off',
      autocomplete: 'off',
      autocorrect: 'off',
      spellcheck: 'off'
    }));


  define('url', () => string()
    .field({
      type: 'url',
      pattern: 'https://.*'
    }));


  define('int', () => number()
    .integer()
    .field({
      step: '1',
      min: '1'
    }));


  define('password', () => string()
    .field({
      type: 'password',
      autocapitalize: 'off',
      autocomplete: 'current-password',
      autocorrect: 'off',
      spellcheck: 'off'
    }));


  define('decimal', () => number()
    .field({
      step: '.01',
      min: '.01'
    }));


  define('textarea', () => string()
    .field({
      component: 'Textarea',
      autocomplete: 'off',
      autocorrect: 'off',
      autocapitalize: 'off',
      spellcheck: 'false'
    }));


  define('dateInput', () => string()
    .field({
      type: 'date',
      format: (d) => formatDate(d, 'M/D/YYYY')
    }));


  define('dateRange', (options = []) => object({
    key: string()
      .options(options)
      .field({ label: 'Date range' }),
    start: string()
      .field({ type: 'date' }),
    end: string()
      .field({ type: 'date' })
  })
    .field({
      component: 'Range',
      format: (val) => {
        if (val?.key) return humanize(val.key);
        return [
          val?.start ? formatDate(val.start, 'M/D/YYYY') : 'Anytime past',
          val?.end ? formatDate(val.end, 'M/D/YYYY') : 'Today'
        ].join('—');
      }
    }));


  define('currencyRange', () => object({
    min: number()
      .field({
        prefix: '$',
        format: toCurrency,
        step: '.01'
      }),
    max: number()
      .field({
        prefix: '$',
        format: toCurrency,
        step: '.01'
      })
  })
    .field({
      component: 'Fieldset',
      format: (val) => {
        const hasMin = Object.hasOwn(val || {}, 'min');
        const hasMax = Object.hasOwn(val || {}, 'max');
        if (hasMin && hasMax) return `${toCurrency(val.min)}–${toCurrency(val.max)}`;
        if (hasMin) return `${toCurrency(val.min)}–Above`;
        if (hasMax) return `$0–${toCurrency(val.max)}`;
        return undefined;
      },
      phrase: (val) => String(val).toLowerCase()
    }));


  define('address', (options = countries) => object({
    street: string()
      .required()
      .field({
        label: 'Address',
        autocomplete: 'address-line1',
        xAutocompletetype: 'address-line1'
      }),
    streetExtended: string()
      .field({
        label: 'Address line 2',
        autocomplete: 'address-line2',
        xAutocompletetype: 'address-line2'
      }),
    locality: string()
      .required()
      .field({
        label: 'City',
        autocomplete: 'address-level2',
        xAutocompletetype: 'address-level2'
      }),
    region: string()
      .required()
      .field({
        label: 'State / Province',
        autocomplete: 'address-level1',
        xAutocompletetype: 'address-level1'
      }),
    postalCode: string()
      .required()
      .field({
        pattern: '[a-zA-Z\\d\\s\\-]+',
        autocomplete: 'postal-code',
        xAutocompletetype: 'postal-code'
      }),
    countryCode: string()
      .options(options)
      .required()
      .field({
        label: 'Country',
        autocomplete: 'country-name',
        xAutocompletetype: 'country-name',
        itemOptions: { type: 'option' }
      })
  })
    .field({
      component: 'Fieldset',
      format: (val) => val
    }));


  define('location', (options = countries) => object({
    locality: string()
      .field({
        label: 'City',
        autocomplete: 'address-level2',
        xAutocompletetype: 'address-level2'
      }),
    region: string()
      .field({
        label: 'State / Province',
        autocomplete: 'address-level1',
        xAutocompletetype: 'address-level1'
      }),
    postalCode: string()
      .field({
        autocomplete: 'postal-code',
        xAutocompletetype: 'postal-code'
      }),
    countryCode: string()
      .options(options)
      .field({
        label: 'Country',
        autocomplete: 'country-name',
        xAutocompletetype: 'country-name',
        itemOptions: { type: 'option' }
      })
  })
    .field({
      component: 'Fieldset',
      format: (val) => {
        if (!val) return val;
        const { locality, region, postalCode, countryCode } = val;
        const country = options.find((c) => c.value === countryCode);
        return [locality, region, postalCode, country?.label]
          .filter(Boolean)
          .join(', ');
      }
    }));


  define('multioption', (options = []) => string()
    .options(options)
    .field({
      component: 'Comby',
      type: 'multioption',
      search: false,
      remote: false,
      single: false
    }));


  define('tags', () => string()
    .field({
      component: 'Comby',
      type: 'tags',
      mode: 'tags',
      search: true,
      single: false,
      remote: false
    }));


  define('association', () => string()
    .field({
      component: 'Comby',
      type: 'association',
      mode: 'search',
      remote: true,
      search: false,
      single: true
    }));


  define('associations', () => string()
    .field({
      component: 'Comby',
      type: 'associations',
      mode: 'search',
      remote: true,
      search: false,
      single: false
    }));
}


export {
  registerRecipes
};
