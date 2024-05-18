/* eslint-disable n/file-extension-in-import */
import {createWithEqualityFn} from 'zustand/traditional';
import {shallow} from 'zustand/shallow';
/* eslint-enable n/file-extension-in-import */
import {shuffle} from 'fast-shuffle';
import randomItem from 'random-item';
import * as R from 'ramda';
import {emptyIndex, eqLengths, getOpenableCount} from './utils.js';
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

const updateSeveral = (indexes, values, source) => {
	let result = R.clone(source);

	R.addIndex(R.forEach)((element, i) => {
		result = R.update(element, values[i], result);
	}, indexes);

	return result;
};

const useGameStore = (set, get) => {
	return {
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
						currentChar: '',
						chars: R.repeat('', currentRoundWord.length),
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
				const currIndex = chars.indexOf('');
				const answerIsCorrect = word[currIndex] === charLower;

				if (answerIsCorrect) {
					return R.over(
						R.lensProp('round'),
						R.mergeLeft({
							chars: R.update(
								emptyIndex(state.round.chars),
								charLower,
								state.round.chars,
							),
							isAnswerCorrect: true,
							status:
								R.reject(R.isEmpty, chars).length === word.length - 1
									? 'FINISHED'
									: state.round.status,
						}),
						state,
					);
				}

				return R.set(R.lensPath(['round', 'isAnswerCorrect']), false, state);
			}),
		openCurrentChar(count) {
			return set(state => {
				const {
					round: {word},
				} = get();
				if (count === 0 || count > getOpenableCount(word)) {
					return state;
				}

				const wordIndexes = R.range(0, word.length);
				const randIndexes = [];
				const takenIndexes = [];
				while (randIndexes.length < count) {
					const randomIndex = R.compose(
						R.head,
						shuffle,
					)(R.without(takenIndexes, wordIndexes));
					randIndexes.push(randomIndex);
					takenIndexes.push(randomIndex);
				}

				return R.over(
					R.lensProp('round'),
					R.mergeLeft({
						chars: updateSeveral(
							randIndexes,
							R.map(i => word[i], randIndexes),
							state.round.chars,
						), // R.update(R.head(randIndexes), R.nth(R.head(randIndexes), word), state.round.chars)// R.last(randIndexes),// insert(randIndexes[0], R.nth(randIndexes[0], word), state.round.chars),
					}),
					state,
				);
			});
		},
		setCurrentChar: char =>
			set(R.set(R.lensPath(['round', 'currentChar']), char)),
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
