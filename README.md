This module would be comvenient when you write test for your original stream.  You don't need a file to provide a big data for your test.

How to use
===

    var createGeneratorStream = require('generator-stream').create,
        count = 0,
        generator = createGeneratorStream({
          count: 3, // you can set repeat count(default: 100)
          // This is a function providing data for stream
          generator: function() {
            return new Buffer('hello world:' + (++count));
          }
        }),
        fs = require('fs'),
        out = fs.createWriteStream('out.txt');

    generator.setEncoding('utf8');
    generator.pipe(out);

Generator function 
===

You can use following function types.

function() {return new Buffer();} 
---

- synchronous generator
- just return Buffer

function(done) {done(error, new Buffer());} 
---

- asynchronous generator
- call done(error, Buffer) when ready.  You will call done(null, buffer) in usual cases

Run tests
===

    npm install -d
    npm test
