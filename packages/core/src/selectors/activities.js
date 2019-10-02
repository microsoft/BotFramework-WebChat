const activities = ({ activities }) => activities;

const of = predicate => state => activities(state).filter(predicate);
const ofID = targetID => of(({ id }) => id === targetID);
const ofType = targetType => of(({ type }) => type === targetType);

export default activities;
export { of, ofID, ofType };
