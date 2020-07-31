export default function sleep(durationInMS = 1000) {
  return new Promise(resolve => setTimeout(resolve, durationInMS));
}

export function timeout(durationInMS, message = 'timeout') {
  return sleep(durationInMS).then(() => {
    throw new Error(message);
  });
}
