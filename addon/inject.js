(function () {
    'use strict';

    let check = document.querySelector('.rulerItem')
    if (check) {
        if (check.style.display === "none") {
            check.style.display = "block";
        } else {
            check.style.display = "none";
        }
        return
    }
    // quick options
    const conf = {
        colour: "rgb(206,195,195)",
        lineColour: "rgb(138,103,114)", // colour of the bottom edge of the bar
        scale: 1.05, // how many times the text's line-height should the bar's height be
        shadow: 0.1, // opacity of the bar's shadow (0 to 1)
        key: "r", // toggle key
        keyCtrl: true, // toggle key requires ctrl?
        keyAlt: true, // toggle key requires alt?
        keyShift: false, // toggle key requires shift?
        mixBlendMode: "difference",
    }

    const bar = document.createElement("div");
    bar.setAttribute('class', 'rulerItem')
    bar.setAttribute('style', 'mix-blend-mode: exclusion;')
    let visible = true;

    const styles = {
        left: 0,
        right: 0,
        height: "1em",
        backgroundColor: conf.colour,
        borderBottom: conf.lineColour ? `1px ${conf.lineColour} solid` : void 0,
        position: "fixed",
        transform: "translateY(-50%)",
        display: "none",
        pointerEvents: "none",
        transition: "120ms height",
        boxShadow: `0 1px 4px rgba(0, 0, 0, ${conf.shadow})`,
        zIndex: 9999999
    };
    Object.keys(styles).forEach(function (k) {
        bar.style[k] = styles[k]
    });

    document.body.addEventListener("mousemove", function (ev) {
        bar.style.top = ev.clientY + "px";
        if (visible) {
            const over = document.elementFromPoint(ev.clientX, ev.clientY);
            const size = window.getComputedStyle(over).getPropertyValue("line-height");
            const [m, num, unit] = (size && size.match(/([\d\.]+)([^\d]+)/)) || [];
            bar.style.height = m ? num * conf.scale + unit : "1em";
        }
    });

    document.body.appendChild(bar);
    bar.style.display = visible ? "block" : "none";

    window.addEventListener("keypress", function (ev) {
        if (
            !(ev.ctrlKey ^ conf.keyCtrl) &&
            !(ev.altKey ^ conf.keyAlt) &&
            !(ev.shiftKey ^ conf.keyShift) &&
            ev.key.toLowerCase() === conf.key.toLowerCase()
        ) {
            ev.preventDefault();
        }
    });

})();