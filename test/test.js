var tax = require('../lib/taxLookup');
var assert = require('assert');

//TODO

describe('tax', function () {

  describe('.eSpell', function () {
    var error;
    var response;
    it('should not get an error', function (done) {
      var cb = function (err, res) {
        error = err;
        response = res;
        assert.equal(error, null);
        done();
      };
      tax.eSpell('wheatt', cb);
    });
    it('should get a result', function (done) {
      assert.notEqual(response, null);
      done();
    })
  });

  describe('.eSearch', function () {
    var error;
    var response;
    it('should not get an error', function (done) {
      var cb = function (err, res) {
        error = err;
        response = res;
        assert.equal(error, null);
        done();
      };
      tax.eSearch('wheat', cb);
    });
    it('should get a result', function (done) {
      assert.notEqual(response, null);
      done();
    })
  });

  describe('.eFetch', function () {
    var error;
    var response;
    it('should not get an error', function (done) {
      var cb = function (err, res) {
        error = err;
        response = res;
        assert.equal(error, null);
        done();
      };
      tax.eFetch(4565, cb);
    });
    it('should get a result', function (done) {
      assert.notEqual(response, null);
      done();
    })
  })
});



