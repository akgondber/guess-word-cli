import fs from 'node:fs';
import path from 'node:path';
import * as R from 'ramda';
import converter from 'number-to-words';

const quotify = input => `'${input}'`;

const generate = words => {
	const directory = './source/words';

	const files = [];

	const results = fs.readdirSync(directory);

	for (const file of results) {
		const fileDetails = fs.lstatSync(path.resolve(directory, file));

		if (!fileDetails.isDirectory() && R.endsWith('-suite.js', file)) {
			files.push(file);
		}
	}

	const fileNamesOrds = R.map(R.replace('-suite.js', ''), files);

	const newNumber = R.length(fileNamesOrds) + 1;
	const newNumberOrd = converter.toWordsOrdinal(newNumber);
	fs.writeFileSync(
		path.join(directory, `${newNumberOrd}-suite.js`),
		`const suite = [${R.map(R.nAry(1, quotify), words).join(',')}];

export default suite;`,
	);
};

export default generate;
