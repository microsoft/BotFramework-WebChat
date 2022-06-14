export function getMinutesBetweenTimestamps(t1: number, t2: number) {
	const milisDelta = Math.abs(t2 - t1)
	return milisDelta / 1000 / 60
}
