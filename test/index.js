var should = require('chai').should(),
    jerry = require('../index'),
    config = jerry.config,
    start = jerry.start;

describe('Testing jerry', function () {
    it('Testing config', function () {
        config.should.equal(undefined);
    })
})