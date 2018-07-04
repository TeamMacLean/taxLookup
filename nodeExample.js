const Tax = require('./index');

console.log('tax',Tax);

Tax.search('nicotiana benthamiana')
    .then(results => {
        console.log(results);
    })
    .catch(err => console.error(err));

Tax.spell('nicotiana benthamia')
    .then(results => {
        console.log(results);
    })
    .catch(err => console.error(err));