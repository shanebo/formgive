const fs = require('fs');
// const dbContents = fs.readFileSync(`${__base}/db.json`, 'utf8');
// const save = () => fs.writeFileSync(`${__base}/db.json`, JSON.stringify(db, null, 2), 'utf8');


// console.log(Object.keys(db.tasks).length);

const cntrs = require('./cntrs');

const obj = {};

Object
  .keys(cntrs)
  .sort()
  .forEach(key => {
    obj[key] = cntrs[key];
  });
  // .sort((a,b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0))
  // .map(([label, value]) => ({
  //   label,
  //   value
  // }));

// const foo = Object
//   .entries(cntrs)
//   .sort((a,b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0))
//   .map(([label, value]) => ({
//     label,
//     value
//   }));

console.log(obj);



const foo = Object
  .entries(obj)
  .map(([label, value]) => ({
    label,
    value
  }));

console.log(foo);

fs.writeFileSync(`${__dirname}/cnt.json`, JSON.stringify(foo, null, 2), 'utf8');


// Object.keys(db.tasks).forEach(id => {
//   if (db.tasks[id].note) {
//     db.tasks[id].note = cleanNoteMarkup(db.tasks[id].note);
//   }
// });

// save();
