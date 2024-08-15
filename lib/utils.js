function makeId(name){
  return `${name}-${Math.random().toString(36).substring(2, 10)}`;
}


// function humanize(str) {
//   // Check if the string is in enum style (all uppercase)
//   if (str === str.toUpperCase()) {
//     str = str.toLowerCase();
//   }

//   return str
//     .replace(/([A-Z])|[_-]/g, ' $1')
//     .trim()
//     .replace(/\s+/g, ' ')
//     .toLowerCase()
//     .replace(/^./, (c) => c.toUpperCase());
// }


function humanize(str) {
  return str
    .replace(/\s+|[_-]+/g, ' ')               // Replace extraneous whitespace, underscores, and hyphens with a single space
    .replace(/(?!^)(_id|Id|_ids|Ids)$/g, '')  // Remove Id, _id, Ids, and _ids at the end of the string, but not at the start of the string
    .replace(/([a-z])([A-Z])/g, '$1 $2')      // Insert spaces between non-successive capital letters
    .trim()                                   // Trim leading/trailing spaces
    .toLowerCase()                            // Convert to lowercase
    .replace(/^./, (c) => c.toUpperCase());
}



function slugize(str) {
  return humanize(str)
    .replace(/\s+/g, '-')
    .toLowerCase();
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


module.exports = {
  makeId,
  humanize,
  slugize,
  defaultModify
};
