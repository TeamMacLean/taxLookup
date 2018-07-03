const Promise = require('es6-promise').Promise;
import fetchPonyfill from 'fetch-ponyfill';

const {fetch} = fetchPonyfill({Promise: Promise});

const parseString = require('xml2js').parseString;

const Tax = {
    search: function (search) {
        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?retmode=json&db=taxonomy&term=' + encodeURIComponent(search);
        return fetch(url)
            .then((response) => response.json())
            .then((json) => {
                return json.esearchresult.idlist;
            });
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
    }

};

if (typeof window === 'undefined') {
   module.exports = Tax;

} else {
    window.Tax = Tax;
}