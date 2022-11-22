(function () {
    'use strict';

    // конфиг
    var minTextLength = 10;
    var minWordLength = 4;
    var boldRatio = 0.5;

    //тут красится текст
    function insertTextBefore(text, node, bold) {
        if (bold) {
            var span = document.createElement("span");
            //css стили?
            span.style.fontWeight = "bolder";
            span.setAttribute('style', 'bolder !important');
            span.appendChild(document.createTextNode(text));

            node.parentNode.insertBefore(span, node);
        }
        else {
            node.parentNode.insertBefore(document.createTextNode(text), node);
        }
    }

    //обработка
    function processNode(node) {

        var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                return (
                    node.parentNode.nodeName !== 'SCRIPT' &&
                    node.parentNode.nodeName !== 'NOSCRIPT' &&
                    node.parentNode.nodeName !== 'STYLE' &&
                    node.nodeValue.length >= minTextLength) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });

        //НЕ УБИРАТЬ
        var node;
        // обход дерева
        while (node = walker.nextNode()) {
            var text = node.nodeValue;
            var wStart = -1, wLen = 0, eng = null;

            for (var i = 0; i <= text.length; i++) {
                // отбираем буквы
                var cEng = i < text.length ? /[\p{Letter}\p{Mark}]/u.test(text[i]) : false;

                if (i == text.length || eng !== cEng) {

                    if (eng && wLen >= minWordLength) {
                        var word = text.substring(wStart, wStart + wLen);
                        var numBold = Math.ceil(word.length * boldRatio);
                        var bt = word.substring(0, numBold), nt = word.substring(numBold);
                        insertTextBefore(bt, node, true);
                        insertTextBefore(nt, node, false);
                    } else if (wLen > 0) {
                        var word = text.substring(wStart, wStart + wLen);
                        insertTextBefore(word, node, false);
                    }
                    wStart = i;
                    wLen = 1;
                    eng = cEng;
                } else {
                    wLen++;
                }
            }

            //зануляем элемент
            node.nodeValue = "";
        }
    }


    processNode(document.getRootNode());

})();