import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as R from 'ramda';
import converter from 'number-to-words';

const isEnglishWord = value => /[a-zA-Z]/.test(value);

const eqLengths = (first, second) => R.eqProps('length', first, second);
const toWordsOrdinal = number => converter.toWordsOrdinal(number);
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

export {isEnglishWord, eqLengths, toWordsOrdinal, getSuiteFiles};
