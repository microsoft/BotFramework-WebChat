export default function deinterleaveArray(array, numInterleave) {
  if (numInterleave < 1) {
    throw new Error('numInterleave must be at least 1');
  }

  const numBytes = array.length / numInterleave;

  if (~~numBytes !== numBytes) {
    throw new Error('array must be divisible by numInterleave.');
  }

  const final = new Array(numInterleave).fill().map(() => new Array(numBytes));

  for (let interleaveIndex = 0; interleaveIndex < numInterleave; interleaveIndex++) {
    for (let offset = 0; offset < numBytes; offset++) {
      final[+interleaveIndex][+offset] = array[offset * numInterleave + interleaveIndex];
    }
  }

  return final;
}
