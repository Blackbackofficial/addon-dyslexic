'use strict';

function changeFont() {
    let selectBox = document.getElementById("custom-select");
    let selectedValue = selectBox.options[selectBox.selectedIndex].value;

    let font
    if (selectedValue == 1) {
        font = "Open Sans, serif";
        document.getElementById("main").style.fontFamily = "Open Sans, sans-serif";
    } else if (selectedValue == 2) {
        font = "Courier, serif";
        document.getElementById("main").style.fontFamily = "Courier, sans-serif";
    }
    var elems = document.getElementsByTagName("*");
    let i;
    for(i = 0; i < elems.length; i++) {
        console.log(elems[i].style.fontFamily)
        elems[i].style.fontFamily = font;
    }
    console.log(selectedValue);
}