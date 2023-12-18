#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import * as R from 'ramda';
import {shuffle} from 'fast-shuffle';
import App from './app.js';
import {toWordsOrdinal, getSuiteFiles} from './utils.js';

const cli = meow(
	`
		Usage
		  $ guess-word-cli

		Examples
		  $ guess-word-cli
	`,
	{
		importMeta: import.meta,
		flags: {
			round: {
				type: 'string',
				shortFlag: 'r',
			},
			nth: {
				type: 'number',
				shortFlag: 'n',
			},
		},
	},
);

const {round, nth} = cli.flags;
let wordsSuite = [];

if (R.any(R.isNotNil)([round, nth])) {
	try {
		const ordinalRound = R.when(R.isNil, R.always(toWordsOrdinal(nth)))(round);
		const {default: items} = await import(`./words/${ordinalRound}-suite.js`);
		wordsSuite = items;
	} catch (error) {
		if (!error.message.includes('Cannot find module')) {
			throw error;
		}
	}
} else {
	const suiteFiles = getSuiteFiles();

	if (suiteFiles.length > 0) {
		const randomSuiteFile = R.head(shuffle(suiteFiles));
		const {default: items} = await import(`./words/${randomSuiteFile}`);

		wordsSuite = items;
	}
}

if (R.isEmpty(wordsSuite)) {
	render(<App />);
} else {
	render(<App wordsSuite={wordsSuite} />);
}
