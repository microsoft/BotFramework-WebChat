"use strict";

function improvise(original, additional) {
  return (...args) => {
    original(...args);
    additional(...args);
  };
}

console.log = improvise(console.log.bind(console), (...args) => {
  const pre = document.getElementById("console");
  const entry = document.createElement("div");
  const indicator = document.createElement("div");
  const group = document.createElement("div");

  indicator.innerText = ">";

  entry.append(indicator);
  entry.append(group);

  args.forEach(arg => {
    const element = document.createElement("div");
    const code = document.createElement("pre");

    code.innerText =
      typeof arg === "string" ? arg : JSON.stringify(arg, null, 2);
    element.append(code);

    group.append(element);
  });

  pre.append(entry);
});
