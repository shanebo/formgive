exports.typeOf = (item) => ({}).toString.call(item).slice(8, -1).toLowerCase();

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// https://gist.github.com/SonyaMoisset/572e0b48f1c3e4145076c4b6886971ec#file-title-case-a-sentence-with-map-wc-js
const titleCase = (str) => str.toLowerCase().split(' ')
  .map(word => word.replace(word[0], word[0].toUpperCase())).join(' ');

exports.titleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/-/gi, ' ')
    .split(' ')
    .map(word => word.replace(word[0], (word[0] || '').toUpperCase()))
    .join(' ');
}

const camelCase = (str) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');

const sentenceCase = (str) => capitalize(str.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1'));

const pascalCase = (str) => capitalize(camelCase(str));


exports.sentenceCase = sentenceCase;
exports.pascalCase = pascalCase;
exports.capitalize = capitalize;
exports.camelCase = camelCase;
exports.titleCase = titleCase;


exports.toCurrency = val => val.toLocaleString('en', { style: 'currency', currency: 'USD' });
