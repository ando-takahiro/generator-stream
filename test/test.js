'use strict';

/* global describe, beforeEach, afterEach, it */

var createGeneratorStream = require('../').create,
    Writable = require('stream').Writable,
    expect = require('chai').expect;

describe('createGeneratorStream', function() {
  function defaultExpected(pos) {
    return pos % 256;
  }

  function check(options, done) {
    var stream = createGeneratorStream(options);

    // put default {} after createGeneratorStream to check whether it works even if options is undefined or not.
    options = options || {};
    var COUNT = options.count || 100,
        checker = new Writable(),
        expected = options.expected || defaultExpected,
        offset = 0;

    checker._write = function(chunk, encoding, callback) {
      expect(offset).to.be.lessThan(COUNT);
      for (var i = 0; i < chunk.length; ++i) {
        expect(chunk.readUInt8(i)).to.equal(expected(offset + i));
      }
      offset += chunk.length;
      if (offset >= COUNT) {
        expect(offset).to.equal(COUNT);
        done();
      }
      callback();
    };

    stream.pipe(checker);
  }

  it('generates random [0...99] stream default', function(done) {
    check(undefined, done);
  });

  it('repeats to call generator following "count" in the option', function(done) {
    check({count: 1024}, done);
  });

  it('takes user defined generator from "generator" in the option', function(done) {
    var count = 0;

    check({
      generator: function(done) {
        var buf = new Buffer(1);
        buf.writeUInt8((++count) % 256, 0);
        process.nextTick(done.bind(null, null, buf));
      },
      expected: function(pos) {
        return (pos + 1) % 256;
      }
    }, done);
  });

  it('sync "generator" just retuns buffer', function(done) {
    var count = 0;

    check({
      generator: function() { // no need 'done' argument
        var buf = new Buffer(1);
        buf.writeUInt8((++count) % 256, 0);
        return buf;
      },
      expected: function(pos) {
        return (pos + 1) % 256;
      }
    }, done);
  });
});

describe('README', function() {
  it('example works', function(done) {
    var createGeneratorStream = require('../').create,
        count = 0,
        generator = createGeneratorStream({
          count: 3, // you can set repeat count(default: 100)
          generator: function() {
            return new Buffer('hello world:' + (++count));
          }
        }),
        fs = require('fs'),
        out = fs.createWriteStream('out.txt');

    generator.setEncoding('utf8');
    generator.pipe(out);

    out.on('close', function() {
      expect(require('fs').readFileSync('out.txt', 'utf8')).to.equal('hello world:1hello world:2hello world:3');
      done();
    });
  });
});

// vim: ts=2:sw=2:sts=2:expandtab:
