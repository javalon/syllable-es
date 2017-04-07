'use strict';

var trim = require('trim');
var normalize = require('normalize-strings');

module.exports = syllables;

var vowel = '[aeiouáéíóú]';
var openVowel = '[aeoáéíóú]';

var closedVowel = '[ui]';
var yAsVowel = 'y';
var noAsVowel = '[^aeiouáéíóú]';
var triphthong = openVowel + closedVowel + closedVowel + '|' + closedVowel + closedVowel + openVowel;
var diphthong = openVowel + closedVowel + '|' + closedVowel + openVowel + '|' + closedVowel + closedVowel + '|' + vowel + yAsVowel + noAsVowel + '|' + vowel + yAsVowel + '$';

var regTri = new RegExp(triphthong, 'gi');
var regDip = new RegExp(diphthong, 'gi');
var regVowels = new RegExp(vowel, 'gi');
var regYConjunction = new RegExp('^' + yAsVowel + '$', 'gi');

function syllables(text) {
  if (!Array.isArray(text)) {
    text = text.split(/\s+/g);
  }
  text = text.map(trim).filter(Boolean).map(normalize);
  if (text.length === 0) {
    return 0;
  }
  var syllables = text.map(function (word) {
    var result = {word: word, syllable: 0};
    result.syllable = syllable(word);
    // DEBUG console.log(result);
    return result.syllable;
  });
  var totalSilabas = syllables[0];
  if (syllables.length > 1) {
    totalSilabas = syllables.reduce(function (acum, actual) {
      return acum + actual;
    });
  }
  return totalSilabas;
}

function syllable(word) {
  word = word.toLowerCase();
  var countTrip = word.split(regTri).length - 1;
  word = word.replace(regTri, '');

  var countDip = word.split(regDip).length - 1;
  word = word.replace(regDip, '');

  var countVowels = word.split(regVowels).length - 1;
  word = word.replace(regVowels, '');

  var countY = word.split(regYConjunction).length - 1;
  word = word.replace(regYConjunction, '');

  return countTrip + countDip + countVowels + countY;
}
