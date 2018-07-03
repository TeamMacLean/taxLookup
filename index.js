const fetchPonyfill = require('fetch-ponyfill');
const PromisePolly = require('promise-polyfill').default;
const {fetch} = fetchPonyfill({Promise: PromisePolly});

const parseString = require('xml2js').parseString;

const Tax = {
    search: function (search) {
        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?retmode=json&db=taxonomy&term=' + encodeURIComponent(search);
        return fetch(url)
            .then((response) => response.json())
            .then((json) => {
                return json.esearchresult.idlist;
            })
            .catch(err => console.error(err));
    },
    spell: function (search) {
        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/espell.fcgi?term=' + encodeURIComponent(search);
        return fetch(url)
            .then(response => response.text())
            .then(response => {
                return new Promise((good, bad) => {
                    parseString(response, function (err, result) {
                        if (err) {
                            return bad(err);
                        } else {
                            return good(result.eSpellResult.CorrectedQuery);
                        }

                    });
                })
            })
            .catch(err => console.error(err));
    }

};

if (typeof window === 'undefined') {
    module.exports = Tax;

} else {
    window.Tax = Tax;
}