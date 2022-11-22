var paras = document.getElementsByTagName('*')

for (let i = 0; i < paras.length; i++) {
    var text = paras[i].innerHTML;
    var cEng =  /[\p{Letter}\p{Mark}]/u.test(text);
    if (cEng) {
        paras[i].classList.add('helloGo')
    }
}