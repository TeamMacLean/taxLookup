const parseString = require('xml2js').parseString;
const PromisePoly = require('promise-polyfill');
const request = require('request');

Tax = {
    search: function (search) {
        return new PromisePoly((good, bad) => {
            const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?retmode=json&db=taxonomy&term=' + encodeURIComponent(search);
            request(url, function (error, response, body) {
                return good(JSON.parse(body).esearchresult.idlist);
            });
        })
    },
    spell: function (search) {
        return new PromisePoly((good, bad) => {
            const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/espell.fcgi?term=' + encodeURIComponent(search);
            request(url, function (error, response, body) {
                parseString(body, function (err, result) {
                    if (err) {
                        return bad(err);
                    } else {
                        return good(result.eSpellResult.CorrectedQuery);
                    }

                });
            });
        })
    }
};

if (typeof window === 'undefined') {
    module.exports = Tax;
} else {
    window.Tax = Tax;
}