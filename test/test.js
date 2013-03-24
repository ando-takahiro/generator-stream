'use strict';

/* global describe, beforeEach, afterEach, it */

var createGeneratorStream = require('../').create,
    Writable = require('stream').Writable,
    expect = require('chai').expect;

describe('createGeneratorStream', function() {
  var COUNT = 100;

  function defaultExpected(pos) {
    return pos % 256;
  }

  function check(generator, done) {
    var cur = 0;

    generator = generator || function() {
      var buffer = new Buffer(1);
      buffer.writeUInt8(cur++ % 256);
      return buffer;
    };

    var stream = createGeneratorStream(generator),
        checker = new Writable(),
        offset = 0;

    checker._write = function(chunk, encoding, callback) {
      expect(offset).to.be.lessThan(COUNT);
      for (var i = 0; i < chunk.length; ++i) {
        expect(chunk.readUInt8(i)).to.equal((offset + i) % 256);
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

  it('takes async generator', function(done) {
    var count = 0;

    check(function(done) {
      if (count < COUNT) {
        var buf = new Buffer(1);
        buf.writeUInt8(count++ % 256, 0);
        process.nextTick(done.bind(null, null, buf));
      } else {
        done(null, null);
      }
    }, done);
  });

  it('sync "generator" just retuns buffer and return null when finished', function(done) {
    var count = 0;

    check(function() { // no need 'done' argument
      if (count < COUNT) {
        var buf = new Buffer(1);
        buf.writeUInt8(count++ % 256, 0);
        return buf;
      } else {
        return null;
      }
    }, done);
  });
});

describe('README', function() {
  it('example works', function(done) {
    var createGeneratorStream = require('../').create,
        count = 0,
        generator = createGeneratorStream(function() {
          // return buffer. and then return null when finished.
          return count < 3 ? new Buffer('hello world:' + (count++)) : null;
        }),
        fs = require('fs'),
        out = fs.createWriteStream('out.txt');

    generator.setEncoding('utf8');
    generator.pipe(out);

    out.on('close', function() {
      expect(fs.readFileSync('out.txt', 'utf8')).to.equal('hello world:0hello world:1hello world:2');
      done();
    });
  });
});

// vim: ts=2:sw=2:sts=2:expandtab:
