(function () {
    'use strict';

    function checkBolderedText() {
        let spans = document.getElementsByClassName('custom-bolder');
        for (let i = 0; i < spans.length; i++) {
            spans[i].removeAttribute('style');
        }
    }
    checkBolderedText();
})();