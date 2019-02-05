const parseString = require('xml2js').parseString;
const axios = require('axios');
Tax = {
    search: function (search, api_key) {
        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?retmode=json&db=taxonomy&term=' + encodeURIComponent(search)+api_key?'&api_key='+api_key:'';

        return axios.get(url)
            .then(function (response) {
                // console.log(response.data);
                return response.data.esearchresult.idlist;
            })
    },
    spell: function (search) {
        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/espell.fcgi?term=' + encodeURIComponent(search)+api_key?'&api_key='+api_key:'';

        return axios.get(url)
            .then(function (response) {
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

module.exports = Tax;
