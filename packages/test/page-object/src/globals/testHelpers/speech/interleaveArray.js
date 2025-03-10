export default function interleaveArray(...arrays) {
  const { length: numArray } = arrays;

  if (numArray === 0) {
    return [];
  } else if (numArray === 1) {
    return [...arrays[0]];
  }

  const [{ length: numItems }] = arrays;

  arrays.forEach(array => {
    if (array.length !== numItems) {
      throw new Error('All array must have same length.');
    }
  });

  const final = new Array(numArray * numItems);

  arrays.forEach((array, arrayIndex) => {
    array.forEach((item, offset) => {
      final[offset * numArray + arrayIndex] = item;
    });
  });

  return final;
}
