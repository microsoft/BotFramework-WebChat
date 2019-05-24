// For auto-focus in some browsers, we synthetically insert keys into the chatbox.
// By default, we insert keys when:
// 1. evt.key.length === 1 (e.g. "1", "A", "=" keys), or
// 2. evt.key is one of the map keys below (e.g. "Add" will insert "+", "Decimal" will insert ".")
const INPUTTABLE_KEY = {
  Add: '+', // Numpad add key
  Decimal: '.', // Numpad decimal key
  Divide: '/', // Numpad divide key
  Multiply: '*', // Numpad multiply key
  Subtract: '-' // Numpad subtract key
};

export default function inputtableKey(key) {
  return key.length === 1 ? key : INPUTTABLE_KEY[key];
}
