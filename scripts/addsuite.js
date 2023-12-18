import {intro, outro, text} from '@clack/prompts';
import * as R from 'ramda';
import converter from 'number-to-words';
import generate from './gensuite.js';

console.log('Build new words suite. Type `__` to stop a loop.');

intro(`Generate new words suite`);
const array = [];

let i = 0;

// eslint-disable-next-line no-constant-condition
while (true) {
	const newNumberOrd = converter.toWordsOrdinal(++i);
	// eslint-disable-next-line no-await-in-loop
	const word = await text({
		message: `${newNumberOrd} word:`,
		placeholder: '',
		initialValue: '',
		validate(value) {
			if (array.includes(value)) {
				return 'the word is already present';
			}
		},
	});

	if (R.isNil(word) || word === '__') {
		break;
	}

	if (word.toString() !== 'Symbol(clack:cancel)') array.push(word);
}

generate(array);

outro(`New suite have been generated! ${array.join(',')}`);
