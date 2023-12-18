/* eslint-disable n/file-extension-in-import */
import {createWithEqualityFn} from 'zustand/traditional';
import {shallow} from 'zustand/shallow';
/* eslint-enable n/file-extension-in-import */
import {shuffle} from 'fast-shuffle';
import randomItem from 'random-item';
import * as R from 'ramda';
import {eqLengths} from './utils.js';
import defaultWordsSuite from './words/index.js';

const shuffleWord = value => {
	// eslint-disable-next-line unicorn/prefer-spread
	return R.compose(R.join(''), shuffle, R.split(''))(value);
};

const setProp = R.curry((prop, value, object) =>
	R.set(R.lensProp(prop), value)(object),
);

const getExtraCharForWord = word => {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz';
	const wordLower = word.toLowerCase();
	const availableChars = R.difference([...alphabet], [...wordLower]);

	return randomItem(availableChars);
};

const diffWithDuplicates = (a, b) => {
	/* eslint-disable unicorn/no-array-reduce */
	const result = [
		...b.reduce(
			(acc, v) => acc.set(v, (acc.get(v) || 0) - 1),
			a.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map()),
		),
	].reduce(
		(acc, [v, count]) => [
			...acc,
			Array.from({length: Math.abs(count)}).fill(v),
		],
		[],
	);
	/* eslint-enable unicorn/no-array-reduce */

	return result;
};

const wordProp = R.lensProp('word');
const wordsSuiteProp = R.lensProp('wordsSuite');
const usedWordsProp = R.lensProp('usedWords');

const useWordStore = (set, get) => {
	return {
		wordsSuite: defaultWordsSuite,
		word: '',
		usedWords: [],
		setWord: word => set(R.set(wordProp, word)),
		setRandomWord: () => set(R.set(wordProp, shuffle(get().wordsSuite))),
		setWordsSuite: wordsSuite => set(R.set(wordsSuiteProp, wordsSuite)),
		clearUsedWords: () => set(R.set(usedWordsProp, [])),
		addToUsedWords: word => set(R.over(usedWordsProp, R.append(word), get())),
	};
};

const getRemained = (chars, otherChars) => {
	return diffWithDuplicates(chars, otherChars).join('');
};

const useGameStore = (set, get) => {
	return {
		currentChar: '',
		round: {
			word: '',
			usedWords: [],
			isSubmitted: false,
			isAnswerCorrect: false,
			status: 'RUNNING',
			shuffledWord: '',
			chars: [],
			isFinished: false,
			extraChar: '',
		},
		prepareRound() {
			const {wordsSuite} = get();

			if (eqLengths(get().usedWords, wordsSuite)) {
				get().clearUsedWords();
			}

			const currentRoundWord = shuffle(
				R.difference(wordsSuite, get().usedWords),
			)[0];
			const extraChar = getExtraCharForWord(currentRoundWord);
			const shuffledWord = shuffleWord(`${currentRoundWord}${extraChar}`);

			get().addToUsedWords(currentRoundWord);
			return set(
				R.over(
					R.lensProp('round'),
					R.mergeLeft({
						word: currentRoundWord,
						usedWords: [],
						isSubmitted: false,
						isAnswerCorrect: false,
						status: 'RUNNING',
						chars: [],
						shuffledWord,
						isFinished: false,
						extraChar,
					}),
				),
			);
		},
		handleAnswer: char =>
			set(state => {
				const {
					round: {word, chars},
				} = get();
				const charLower = char.toLowerCase();
				const charIncluded = getRemained([...word], chars).includes(charLower);
				let answerIsCorrect = false;
				let charOffset = 0;

				if (charIncluded) {
					if (chars.includes(charLower)) {
						let currPos = word.indexOf(charLower, charOffset);
						let occurenceCounter = R.count(R.equals(charLower), chars);

						while (currPos !== -1 && occurenceCounter > 0) {
							charOffset = currPos + 1;
							currPos = word.indexOf(charLower, charOffset);
							occurenceCounter--;
						}
					}

					answerIsCorrect =
						word.indexOf(charLower, charOffset) === chars.length;
				}

				if (answerIsCorrect) {
					return R.over(
						R.lensProp('round'),
						R.mergeLeft({
							chars: R.append(charLower, state.round.chars),
							isAnswerCorrect: true,
							status:
								chars.length === word.length - 1
									? 'FINISHED'
									: state.round.status,
						}),
						state,
					);
				}

				return R.set(R.lensPath(['round', 'isAnswerCorrect']), false, state);
			}),
		openCurrentChar() {
			const tar = 'vfv';
			console.log(`HHSJWSW ${get().round.status} - ${tar}`);
			const result = set(state =>
				setProp(R.lensPath(['round', 'status']), 'PAUSED', state),
			);
			return result;
		},
		setCurrentChar: char => set(setProp('currentChar', char)),
		setStatus: message => set(setProp('status', message)),
		setPaused: () => set(R.set(R.lensPath(['round', 'status']), 'PAUSED')),
		setRunning: () => set(R.set(R.lensPath(['round', 'status']), 'RUNNING')),
	};
};

const useAppStore = createWithEqualityFn((...parameters) => {
	return {
		...useWordStore(...parameters),
		...useGameStore(...parameters),
	};
}, shallow);

export default useAppStore;
