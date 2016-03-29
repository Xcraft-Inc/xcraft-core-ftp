'use strict';

const fs   = require ('fs');
const path = require ('path');


exports.get = function (urlObj, outputFile, callback, callbackProgress) {
  const xFs    = require ('xcraft-core-fs');
  const Client = require ('ftp');

  xFs.mkdir (path.dirname (outputFile));

  var progress = 0;

  const file = fs.createWriteStream (outputFile);
  const c    = new Client();

  c.on ('ready', () => {
    c.size (urlObj.pathname, (err, total) => {
      if (err) {
        callback (err);
        return;
      }

      c.get (urlObj.pathname, (err, stream) => {
        if (err) {
          callback (err);
          return;
        }

        stream
          .once ('close', function () {
            c.end ();
          })
          .on ('data', function (data) {
            if (!callbackProgress) {
              return;
            }

            progress += data.length;
            callbackProgress (progress, total);
          })
          .on ('error', callback)
          .pipe (file)
          .on ('finish', function () {
            /* HACK: see xHttp. */
            const fd = fs.openSync (outputFile, 'r');
            fs.closeSync (fd);

            callback ();
          });
      });
    });
  });

  c.connect ({
    host: urlObj.hostname
  });
};
