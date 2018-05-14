require('es6-promise').polyfill();
require('isomorphic-fetch');

const parseString = require('xml2js').parseString;

class Tax {
    static search(search) {
        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=taxonomy&term=' + search + '&retmode=json';

        return fetch(url)
            .then((response) => response.json())
            .then((json) => {
                return json.esearchresult.idlist;
            });
    };

    static spell(search) {
        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/espell.fcgi?term=' + search + '&db=taxonomy';
        return fetch(url)
            .then(response => response.text())
            .then(response => {
                parseString(response, function (err, result) {
                    return result.eSpellResult.CorrectedQuery;
                });
            })
    };
}

module.exports = Tax;
