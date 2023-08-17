import * as R from 'ramda';

const isEnglishWord = value => !/[^a-zA-Z]/.test(value);

const eqLengths = (first, second) => R.eqProps('length', first, second);

export {isEnglishWord, eqLengths};
