import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as R from 'ramda';
import converter from 'number-to-words';

const isEnglishWord = value => /[a-zA-Z]/.test(value);
const isNumberChar = value => '123456789'.includes(value);

const eqLengths = (first, second) => R.eqProps('length', first, second);
const toWordsOrdinal = number => converter.toWordsOrdinal(number);
const getOpenableCount = word => (word.length < 7 ? 2 : 3);
const getOpenableNumbers = word =>
	R.compose(R.join(','), R.range)(1, R.inc(getOpenableCount(word)));
const countEmpty = R.count(R.isEmpty);
const countFilled = R.count(R.complement(R.isEmpty));
const hasFilled = word => countFilled(word) > 0;
const emptyIndex = value => R.findIndex(R.nAry(1)(R.isEmpty), value);
const getSuiteFiles = () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const directory = './words';
	const folderPath = path.join(__dirname, directory);

	const files = [];
	const results = fs.readdirSync(folderPath);

	for (const file of results) {
		const fileDetails = fs.lstatSync(path.resolve(folderPath, file));

		if (!fileDetails.isDirectory() && R.endsWith('-suite.js', file)) {
			files.push(file);
		}
	}

	return files;
};

export {
	isEnglishWord,
	isNumberChar as isNumChar,
	eqLengths,
	toWordsOrdinal,
	getOpenableCount,
	getOpenableNumbers,
	getSuiteFiles,
	countEmpty,
	hasFilled,
	emptyIndex,
};
