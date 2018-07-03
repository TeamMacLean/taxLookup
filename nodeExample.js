const Tax = require('./dist/index');
console.log(Tax);

Tax.search('nicotiana benthamiana')
    .then(results => {
        console.log(results);
    });

Tax.spell('nicotiana benthamia')
    .then(results => {
        console.log(results);
    });