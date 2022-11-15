(function () {
    'use strict';
    const paras = document.getElementsByTagName('img');


    for (let i = 0; i < paras.length; i++) {
        const classNames = paras[i].className.split(' ');
        for (let j = 0; j < classNames.length; j++) {
            let cl = classNames[j];
            if (cl.toString() === 'picHider') {
                paras[i].classList.remove(cl);
            }
            if (cl.includes('picFiller')) {
                paras[i].classList.remove(cl);
            }
        }
    }

    const btn = document.getElementById('picScrollerEvent');
    btn.click();


}())