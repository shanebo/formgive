import { capitalize, humanize, slugize } from 'utili';


function makeId(name){
  return `${name}-${Math.random().toString(36).substring(2, 10)}`;
}


function defaultModify(key, val) {
  let slugged = slugize(key);

  if (!slugged.startsWith('is-')) {
    slugged = '-' + slugged;
  }

  return val === true
    ? slugged
    : val
      ? `-${val}`
      : '';
}


function hasKeys(obj) {
  for (const key in obj) {
    return true; // Early return on first key found
  }
  return false;
}


export {
  makeId,
  capitalize,
  humanize,
  slugize,
  defaultModify,
  hasKeys
};
