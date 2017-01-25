module.exports = {
    "hi": function () { return document.querySelectorAll('span.format-markdown')[2].innerText.indexOf('hi') != -1; },
    "animation": function () { return document.querySelectorAll('img')[0].src == "http://i.imgur.com/wJTZIPB.gif"; },
    "carousel": function () { return document.querySelectorAll('.scroll.next').length > 0; },
    "markdown": function () { return document.querySelectorAll('h3').length > 5; },
    "signin": function () { return document.querySelectorAll('button')[0].textContent == "Signin"; }
    /* "command":   JavaScript evaluation syntax */
};
