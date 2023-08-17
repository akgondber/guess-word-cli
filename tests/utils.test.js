import test from 'ava';
import * as utils from '../source/utils.js';

test('isEnglishWord', t => {
	t.true(utils.isEnglishWord('bar'));
	t.false(utils.isEnglishWord('93'));
});

test('eqLengths', t => {
	t.true(utils.eqLengths(['foo1', 'bar1'], ['foo2', 'bar2']));
	t.false(utils.eqLengths(['foo1', 'and', 'additional', 'foo1_1'], ['foo1']));
});
