This module would be covvenient when you write test for your original stream.  You don't need a file to provide a big data for your test.

How to use
===

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

Generator function 
===

You can use following function types.

function() {return Buffer;} 
---

- synchronous generator
- just return Buffer
- return null when finished

function(done) {done(error, Buffer);} 
---

- asynchronous generator
- call done(error, buffer) when ready buffer.  You will call done(null, buffer) in usual cases
- call done(null, null) when finished

Run tests
===

    npm install -d
    npm test
