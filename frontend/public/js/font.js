'use strict';

function changeFont() {
    let selectBox = document.getElementById("custom-select");
    let selectedValue = selectBox.options[selectBox.selectedIndex].value;

    let font
    if (selectedValue == 1) {
        font = "Courier, serif";
        document.getElementById("main").style.fontFamily = "Courier, sans-serif";
    } else if (selectedValue == 2) {
        font = "PT Mono, serif";
        document.getElementById("main").style.fontFamily = "PT Mono, sans-serif";
    } else if (selectedValue == 3) {
        font = "Atma, serif";
        document.getElementById("main").style.fontFamily = "Atma, sans-serif";
    } else if (selectedValue = 4) {
        font = "OpenDyslexic";
        document.getElementById("main").style.fontFamily = "OpenDyslexic, sans-serif";
    } else if (selectedValue = 5) {
        font = "SylexiadSansThin";
        document.getElementById("main").style.fontFamily = "SylexiadSansThin, sans-serif";
    }
    var elems = document.getElementsByTagName("*");
    let i;
    for(i = 0; i < elems.length; i++) {
        console.log(elems[i].style.fontFamily)
        elems[i].style.fontFamily = font;
    }
    console.log(selectedValue);
}