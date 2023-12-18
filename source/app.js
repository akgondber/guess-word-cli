import React, {useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import Color from 'ink-color-pipe';
import Gradient from 'ink-gradient';
import logSymbols from 'log-symbols';
import {nanoid} from 'nanoid';
import open from 'open';
import * as R from 'ramda';
import useAppStore from './store.js';
import {isEnglishWord} from './utils.js';

export default function App({wordsSuite}) {
	const prepareRound = useAppStore(state => state.prepareRound);
	const round = useAppStore(R.prop('round'));
	const setDif = useAppStore(R.prop('setDif'));
	const setPaused = useAppStore(R.prop('setPaused'));
	const setRunning = useAppStore(R.prop('setRunning'));
	const currentChar = useAppStore(R.prop('currentChar'));
	const setCurrentChar = useAppStore(R.prop('setCurrentChar'));
	const handleAnswer = useAppStore(R.prop('handleAnswer'));
	const setWordsSuite = useAppStore(R.prop('setWordsSuite'));

	const isRunning = () => round.status === 'RUNNING';
	const isPaused = () => round.status === 'PAUSED';
	const isFinished = () => round.status === 'FINISHED';
	const isInitalized = () => round.status === 'INIT';

	const {
		word: roundWord,
		chars,
		extraChar,
		isAnswerCorrect,
		shuffledWord,
	} = round;

	useEffect(() => {
		if (R.isNotNil(wordsSuite) && !R.isEmpty(wordsSuite)) {
			setWordsSuite(wordsSuite);
		}

		prepareRound();
	}, [prepareRound, wordsSuite, setWordsSuite]);

	useInput(async (input, key) => {
		if (isPaused()) {
			if (input === 'n') {
				prepareRound();
			} else if (input === 'c') {
				setRunning();
			}
		} else if (isRunning()) {
			if (key.ctrl && input === 'p') {
				setPaused();
				setCurrentChar('');
			} else if (key.ctrl && input === 'r') {
				prepareRound();
			} else if (key.ctrl && input === 's') {
				setDif();
			} else if (isEnglishWord(input)) {
				setCurrentChar(input);
				handleAnswer(input);
			}
		} else if (isFinished()) {
			if (input === 'n') {
				prepareRound();
			} else if (input === 'o') {
				await open(
					`https://dictionary.cambridge.org/dictionary/english/${roundWord}`,
				);
			}
		}
	});

	function GradientText({name = 'rainbow', text}) {
		return (
			<Gradient name={name}>
				<Text>{text}</Text>
			</Gradient>
		);
	}

	function GameName() {
		return (
			<Box paddingBottom={1}>
				<GradientText name="cristal" text="GUESS-WORD" />
			</Box>
		);
	}

	function HelpBlock() {
		return (
			<Box>
				<Box flexDirection="column">
					<Text>Press</Text>
					<Box>
						<Text>
							<Text bold>n</Text>
							<Text>{' - to start a new round'}</Text>
						</Text>
					</Box>
					{isFinished() && (
						<Text>
							<Text bold>o</Text>
							<Text>
								{' - to open the definition of the curent word in the browser'}
							</Text>
						</Text>
					)}
				</Box>
			</Box>
		);
	}

	if (isInitalized()) {
		return (
			<Box flexDirection="column" alignItems="center">
				<GameName />
				<Box flexDirection="column">
					<Box justifyContent="center">
						<Text>Initialized.</Text>
					</Box>
				</Box>
			</Box>
		);
	}

	return isPaused() ? (
		<Box flexDirection="column" alignItems="center">
			<GameName />
			<Box flexDirection="column" justifyContent="center">
				<Text>Paused.</Text>
				<Text>
					Press <Text bold>c</Text> to continue
				</Text>
			</Box>
		</Box>
	) : (
		<Box flexDirection="column" alignItems="center">
			<GameName />
			<Box flexDirection="column">
				<Box alignItems="center" marginBottom={1}>
					<Text color="cyan">
						Try to find out a source word which characters was shuffled and
						moreover an extra character was added to bring some complexity.
					</Text>
				</Box>
			</Box>
			<Box alignItems="center">
				<Box flexDirection="column" alignItems="center">
					<Box>
						<GradientText
							text={`SHUFFLED WORD${isFinished() ? '' : ' + EXTRA CHAR'}`}
							name="fruit"
						/>
					</Box>
					<Box>
						{(isFinished()
							? R.without([extraChar], [...shuffledWord])
							: [...shuffledWord]
						).map(char => (
							<Box key={nanoid(10)} paddingX={1} borderStyle="single">
								<Text>
									<Color
										styles={`yellow${
											isFinished() && R.equals(char, extraChar) ? '.bgRed' : ''
										}`}
									>
										{char.toUpperCase()}
									</Color>
								</Text>
							</Box>
						))}
					</Box>
				</Box>
				{isFinished() && (
					<Box flexDirection="column" marginLeft={2} alignItems="center">
						<Box>
							<GradientText name="retro" text="EXTRA CHAR" />
						</Box>
						<Box marginX={4} paddingX={1} borderStyle="single">
							<Text>{extraChar.toUpperCase()}</Text>
						</Box>
					</Box>
				)}
			</Box>
			<Box flexDirection="column" alignItems="center">
				<Box paddingLeft={1} marginRight={2} marginTop={1}>
					<GradientText text="SOURCE WORD" />
				</Box>
				<Box>
					{!R.isEmpty(shuffledWord) &&
						R.times(
							i => (
								<Box
									key={`${roundWord[i]}-${i}`}
									paddingX={1}
									borderStyle="single"
									borderColor={
										i < chars.length
											? 'green'
											: i === chars.length
											? 'yellow'
											: ''
									}
								>
									<Text>
										{R.either(R.isEmpty, chars => i >= chars.length)(chars)
											? '?'
											: chars[i].toUpperCase()}
									</Text>
								</Box>
							),
							shuffledWord.length - 1,
						)}
				</Box>
			</Box>
			{isFinished() ? (
				<HelpBlock />
			) : (
				<Box>
					<Text>
						<Color styles="cyan.italic">Current char: </Color>
						{currentChar}{' '}
						{!R.isEmpty(currentChar) &&
							(isAnswerCorrect ? logSymbols.success : logSymbols.error)}
					</Text>
				</Box>
			)}
		</Box>
	);
}
