var should = require('chai').should(),
    Jerry = require('../index');

describe('Testing Jerry Framework', function () {
    it('Testing Jerry', function () {
        Jerry.should.be.a.Function;
    })
    it('Testing new application', function () {
        (new Jerry).should.be.a.Object;
    })
})