const parseString = require('xml2js').parseString;
const axios = require('axios');
const Promise = require('es6-promise').Promise;

Tax = {
    search: function (search) {

        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?retmode=json&db=taxonomy&term=' + encodeURIComponent(search);

        return axios.get(url)
            .then(function (response) {
                // console.log(response.data);
                return response.data.esearchresult.idlist;
            })
    },
    spell: function (search) {
        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/espell.fcgi?term=' + encodeURIComponent(search);

        return axios.get(url)
            .then(function (response) {
                // console.log(response);


                return new Promise((good, bad) => {
                    parseString(response.data, function (err, result) {
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