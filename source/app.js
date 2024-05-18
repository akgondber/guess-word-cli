import React, {useEffect} from 'react';
import {Text, Box, useInput, useApp, Newline} from 'ink';
import Color from 'ink-color-pipe';
import Gradient from 'ink-gradient';
import logSymbols from 'log-symbols';
import {nanoid} from 'nanoid';
import open from 'open';
import * as R from 'ramda';
import useAppStore from './store.js';
import {
	emptyIndex,
	getOpenableNumbers,
	hasFilled,
	isEnglishWord,
	isNumChar,
} from './utils.js';

export default function App({wordsSuite}) {
	const {exit} = useApp();
	const prepareRound = useAppStore(state => state.prepareRound);
	const round = useAppStore(R.prop('round'));
	const setDif = useAppStore(R.prop('setDif'));
	const setPaused = useAppStore(R.prop('setPaused'));
	const setRunning = useAppStore(R.prop('setRunning'));
	const setCurrentChar = useAppStore(R.prop('setCurrentChar'));
	const handleAnswer = useAppStore(R.prop('handleAnswer'));
	const setWordsSuite = useAppStore(R.prop('setWordsSuite'));
	const openCurrentChar = useAppStore(R.prop('openCurrentChar'));

	const isRunning = () => round.status === 'RUNNING';
	const isPaused = () => round.status === 'PAUSED';
	const isFinished = () => round.status === 'FINISHED';
	const isInitalized = () => round.status === 'INIT';

	const {
		word: roundWord,
		chars,
		currentChar,
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
			} else if (isNumChar(input) && !hasFilled(chars)) {
				openCurrentChar(Number(input));
			} else if (isEnglishWord(input)) {
				setCurrentChar(input);
				handleAnswer(input);
			}
		} else if (isFinished()) {
			switch (input) {
				case 'n': {
					prepareRound();

					break;
				}

				case 'o': {
					await open(
						`https://dictionary.cambridge.org/dictionary/english/${roundWord}`,
					);

					break;
				}

				case 'q': {
					exit();

					break;
				}
				// No default
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
						<Box flexDirection="column">
							<Text>
								<Text bold>o</Text>
								<Text>
									{
										' - to open the definition of the curent word in the browser'
									}
								</Text>
							</Text>
							<Text>
								<Text bold>q</Text>
								<Text>{' - to quit'}</Text>
							</Text>
						</Box>
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
										R.complement(R.isEmpty)(chars[i])
											? 'green'
											: i === emptyIndex(chars)
											? 'yellow'
											: ''
									}
								>
									<Text>
										{R.either(R.all(R.isEmpty), chars => chars[i] === '')(chars)
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
			{isRunning() && !hasFilled(chars) && (
				<Text>
					<Newline />
					<Text>Type </Text>
					<Text bold>n</Text> (n = {getOpenableNumbers(roundWord)}) -{' '}
					<Text>to open n random chars when there is no any opened chars</Text>
				</Text>
			)}
		</Box>
	);
}
