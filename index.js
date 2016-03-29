'use strict';

const fs   = require ('fs');
const path = require ('path');
const watt = require ('watt');


function download (ftp, urlObj, outputFile, callback, callbackProgress) {
  let progress = 0;

  const file = fs.createWriteStream (outputFile);

  watt (function * (next) {
    const total  = yield ftp.size (urlObj.pathname, next);
    const stream = yield ftp.get (urlObj.pathname, next);

    yield new Promise ((resolve, reject) => {
      stream
        .once ('close', function () {
          ftp.end ();
        })
        .on ('data', function (data) {
          if (!callbackProgress) {
            return;
          }

          progress += data.length;
          callbackProgress (progress, total);
        })
        .on ('error', reject)
        .pipe (file)
        .on ('finish', function () {
          /* HACK: see xHttp. */
          const fd = fs.openSync (outputFile, 'r');
          fs.closeSync (fd);
          resolve ();
        });
    });
  }) (callback);
}

exports.get = function (urlObj, outputFile, callback, callbackProgress) {
  const xFs = require ('xcraft-core-fs');
  const Ftp = require ('ftp');

  xFs.mkdir (path.dirname (outputFile));

  const ftp = new Ftp ();

  ftp.on ('ready', () => {
    download (ftp, urlObj, outputFile, callback, callbackProgress);
  });

  ftp.connect ({
    host: urlObj.hostname
  });
};
