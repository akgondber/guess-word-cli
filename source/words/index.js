import firstSuite from './first-suite.js';
import secondSuite from './second-suite.js';
import thirdSuite from './third-suite.js';

const suites = [firstSuite, secondSuite];
const allSuites = [...firstSuite, ...secondSuite, ...thirdSuite];

export {suites};
export default allSuites;
