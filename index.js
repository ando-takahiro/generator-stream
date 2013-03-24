'use strict';

var stream = require('stream'),
    Readable = stream.Readable;

exports.create = create;

function create(options) {
  options = options || {};

  var stream = new Readable(options),
      count = options.count || 100,
      generator = options.generator || mod256,
      busy = false,
      current = 0;

  // default generator
  function mod256() {
    var buf = new Buffer(1);
    buf.writeUInt8((current - 1) % 256, 0);
    return buf;
  }

  if (generator.length === 0) {
    generator = wrapper0(generator);
  }

  function preboundGenerator() {
    generator(function(err, data) {
      busy = false;

      if (err) {
        stream.emit('error', err);
      } else {
        if (stream.push(data)) {
          if (current < count) {
            // if push() returns false, then we need to stop reading from source
            process.nextTick(fetch);
          } else {
            // finished
            stream.push(null);
          }
        }
      }
    });
  }

  function fetch() {
    if (busy || current >= count) {
      return;
    }

    busy = true;
    ++current;
    preboundGenerator();
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
