export default function removeInline(array, ...items) {
  items.forEach(item => {
    let index;

    while (~(index = array.indexOf(item))) {
      array.splice(index, 1);
    }
  });
}
