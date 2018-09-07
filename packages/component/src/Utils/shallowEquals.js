export default function (x, y) {
  const xKeys = Object.keys(x);
  const yKeys = Object.keys(y);

  return (
    xKeys.length === yKeys.length
    && xKeys.every(key => yKeys.includes(key) && x[key] === y[key])
  );
}
