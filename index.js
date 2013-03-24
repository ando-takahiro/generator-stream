'use strict';

var stream = require('stream'),
    Readable = stream.Readable;

exports.create = create;

function create(generator) {
  var stream = new Readable(),
      ready = true;

  if (generator.length === 0) {
    generator = wrapper0(generator);
  }

  function preboundGenerator() {
    ready = false;
    generator(function(err, data) {
      ready = true;

      if (err) {
        stream.emit('error', err);
      } else {
        if (data) {
          if (stream.push(data)) {
            // if push() returns false, then we need to stop reading from source
            process.nextTick(fetch);
          }
        } else {
          // finished
          ready = false;
          stream.push(null);
        }
      }
    });
  }

  function fetch() {
    if (ready) {
      preboundGenerator();
    }
  }

  // _read will be called when the stream wants to pull more data in
  // the advisory size argument is ignored in this case.
  stream._read = function(n) {
    fetch();
  };

  return stream;
}


// wrapper for sync generator
function wrapper0(generator) {
  return function(done) {
    try {
      done(null, generator());
    } catch(e) {
      done(e);
    }
  };
}

// vim: ts=2:sw=2:sts=2:expandtab:
