var paras = document.getElementsByTagName('*')

for (let i = 0; i < paras.length; i++) {
        const classNames = paras[i].className.split(' ');
        for (let j = 0; j < classNames.length; j++) {
            let cl = classNames[j];
            if (cl.includes('helloGo')) {
                paras[i].classList.remove(cl);
                }
    }
}