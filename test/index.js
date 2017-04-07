'use strict';

var Stream = require('stream').PassThrough;
var test = require('tape');
var execa = require('execa');
var syllable = require('../src/');
var pack = require('../package.json');
var fixtures = require('./fixture.json');

test('api', function (t) {
  var result = syllable('silabas');

  t.equal(syllable('SILABAS'), result, 'should be case insensitive (1)');
  t.equal(syllable('SiLAbas'), result, 'should be case insensitive (2)');

  t.equal(syllable(''), 0, 'should return `0` when empty');

  t.equal(syllable('silabas'), 3, 'should work (1)');
  t.equal(syllable('hola'), 2, 'should work (2)');
  t.equal(syllable('mmmm'), 0, 'should work (3)');
  t.equal(syllable('que'), 1, 'should work (4)');

  t.equal(syllable('vino'), 2, 'should support multiple word-parts (1)');
  t.equal(syllable('botella'), 3, 'should support multiple word-parts (2)');
  t.equal(syllable('botella-vino'), 5, 'should support multiple word-parts (3)');
  t.equal(syllable('botella de vino'), 6, 'should support multiple word-parts (4)');

  t.equal(syllable('pingüino'), syllable('pinguino'), 'should support non-ascii characters (1)');
  t.equal(syllable('ñoño'), syllable('nono'), 'should support non-ascii characters (2)');

  t.end();
});

test('cli', function (t) {
  var stream;

  t.plan(10);

  execa('./src/cli.js', ['syllables-es']).then(function (result) {
    t.equal(result.stdout, '3', 'Should accept an argument');
  }, t.ifErr);

  execa('./src/cli.js', ['syllables-es', 'unicorns']).then(function (result) {
    t.equal(result.stdout, '6', 'Should accept arguments');
  }, t.ifErr);

  execa('./src/cli.js', ['syllables-es unicorns']).then(function (result) {
    t.equal(result.stdout, '6', 'Should accept values');
  }, t.ifErr);

  execa('./src/cli.js', ['  ']).then(function () {}, function (err) {
    t.equal(err.code, 1, 'should exit with `1` without input');
    t.ok(
      /\s*Usage: syllable-es \[options] <words...>/.test(err.stderr),
      'Should emit the help message'
    );
  });

  ['-h', '--help'].forEach(function (flag) {
    execa('./src/cli.js', [flag]).then(function (result) {
      t.ok(
        /\s*Usage: syllable-es \[options] <words...>/.test(result.stdout),
        'Should accept `' + flag + '`'
      );
    }, t.ifErr);
  });

  ['-v', '--version'].forEach(function (flag) {
    execa('./src/cli.js', [flag]).then(function (result) {
      t.equal(
        result.stdout,
        pack.version,
        'Should accept `' + flag + '`'
      );
    }, t.ifErr);
  });

  stream = new Stream();

  execa('./src/cli.js', {input: stream}).then(function (result) {
    t.equal(result.stdout, '9', 'Should accept stdin');
  }, t.ifErr);

  setImmediate(function () {
    stream.write('hola');

    setImmediate(function () {
      stream.write('mundo ');

      setImmediate(function () {
        stream.end('contar silabas');
      });
    });
  });
});

/* Fixtures.
 *
 * The unit tests include in- and output values provided by the original,
 * and ancestor source code.
 *
 * The only test provided by the original code:
 *   http://search.cpan.org/~gregfast/Lingua-EN-Syllable-0.251/
 *   Syllable.pm
 *
 * The test provided by Text-Statistics:
 *   https://github.com/DaveChild/Text-Statistics
 *
 * This library focusses on the required Text-Statistics tests (the
 * library provides both optional and required tests). */
test('fixtures', function (t) {
  var key;

  for (key in fixtures) {
    t.equal(syllable(key), fixtures[key], key);
  }

  t.end();
});
