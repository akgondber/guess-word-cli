import React from 'react';
import test from 'ava';
import {render} from 'ink-testing-library';
import App from './source/app.js';

const ansiRegexp = /\u001B[^m]*?m/g; // eslint-disable-line no-control-regex

test('renders shuffled word section', t => {
	const {lastFrame} = render(<App />);

	t.regex(lastFrame().replaceAll(ansiRegexp, ''), /SHUFFLED WORD/);
});

test('renders source word section', t => {
	const {lastFrame} = render(<App />);

	t.regex(lastFrame().replaceAll(ansiRegexp, ''), /SOURCE WORD/);
});
