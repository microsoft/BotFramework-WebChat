const getDiffIndex = (shorter, longer, currentIndex) => {
  let i = 0;
  let j = 0;
  let result = '';
  let index;
  const noDiff = -1;
  let endDiff = -1;

  if (typeof shorter !== 'string' || typeof longer !== 'string') {
    throw new Error(`botframework-webchat: getDiffIndex parameters must both be of type "string"`);
  }

  if (shorter.length > longer.length) {
    throw new Error(
      `botframework-webchat: getDiffIndex first parameter "shorter" must have a length less than or equal to "longer"`
    );
  }

  if (typeof currentIndex !== 'number') {
    throw new Error(`botframework-webchat: getDiffIndex third parameter "currentIndex" must be a number`);
  }

  while (j < longer.length) {
    if (shorter[i] !== longer[j] || i === shorter.length) {
      index = index === undefined ? i : index;
      endDiff = shorter.indexOf(longer.substring(j), i);

      if (endDiff !== noDiff) {
        return (endDiff -= 1);
      }
      result += longer[j];
    } else {
      i++;
    }
    j++;
  }

  if (shorter.length === longer.length && endDiff === noDiff) {
    return currentIndex;
  }

  const diffIndex = index + result.trim().length;
  if (diffIndex > shorter.length) {
    return shorter.length;
  }
  return diffIndex;
};

export default getDiffIndex;
