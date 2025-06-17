import createRawReducer from './private/createRawReducer';

const sendBoxValue = createRawReducer<string>('sendBoxValue', '');

export default sendBoxValue;
