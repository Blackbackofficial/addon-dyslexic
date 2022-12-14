/**
 * variables from background
 */
const
    background = chrome.extension.getBackgroundPage(),
    addEvent = background.addEvent,
    applyFontFamily = background.applyFontFamily,
    applyFontWeight = background.applyFontWeight,
    showIndentGuides = background.showIndentGuides,
    hideIndentGuides = background.hideIndentGuides,
    fonts = background.fonts,
    /**
     * Popup DOM elements
     */
    fontsDatalist = document.querySelector('#font_family_list'),
    fontsDatalistInput = document.querySelector('#font_family'),
    weightsDatalist = document.querySelector('#fonts_weight_list'),
    weightsDatalistInput = document.querySelector('#fonts_weight'),
    IndentGuidesCheckbox = document.querySelector('#indentGuides');
    fontSelect = document.querySelector('#font_select');
    turnButton = document.querySelector('#disableButton');

    slider_font_weight = document.querySelector('#slider_font_weight');
    output_font_weight = document.querySelector('#output_font_weight');
    slider_settings_font_weight = document.querySelector('#slider_settings_font_weight');

    slider = document.querySelector('#slider');
    output = document.querySelector('#output');
    clear_btn = document.querySelector('#clear_btn');
    radiohld = document.querySelector('#pic_hider');
    radios = document.querySelectorAll('input[type=radio][name="pic"]');
    ruler = document.querySelector('#rulerGuides');
    reader = document.querySelector('#readerMode');
    voicer = document.querySelector('#voiceMode');
    bionic = document.querySelector('#bionicMode');
    IdEvents = ['gt_font_family', 'gt_font_weight', 'gt_indent_guide', 'gt_font_height',
        'gt_radio_choice', 'gt_ruler', 'gt_voicer', 'gt_reader', 'gt_bionic', 'is_work','gt_radio_button',
        'gt_last_tab_id'
    ];

let backgroundPage;
/**
 * Populate options of the select font families dropdown
 */
function fillFontsDrodown() {
    const sortedFonts = sortObject(fonts);
    for (let fontName in sortedFonts) {
        if (!Object.prototype.hasOwnProperty.call(fonts, fontName)) {
            continue;
        }

        createOption(fontName, fontName, fontsDatalist, true);
    }
}

/**
 * Populate options of the select font families dropdown
 */
function addSelectsFonts() {
    const sortedFonts = sortObject(fonts);
    for (let fontName in sortedFonts) {
        if (!Object.prototype.hasOwnProperty.call(fonts, fontName)) {
            continue;
        }

        createOption(fontName, fontName, fontSelect, true);
    }
}

function insertPreviousValues(data) {
    // font
    fontSelect.value = data.gt_font_family;

    // weight
    slider_font_weight.value = data.gt_font_weight;
    output_font_weight.value = data.gt_font_weight;
    if (data.gt_font_weight === undefined) {
        slider_font_weight.value = output_font_weight.value = 100;
    }

    // height
    slider.value = data.gt_font_height;
    output.value = data.gt_font_height;
    if (data.gt_font_height === undefined) {
        slider.value = output.value = 1;
    }

    // radioButton
    var radioButton = document.getElementById(data.gt_radio_button);
    console.log(radioButton);
    
    // radioButton.checked = true;
    radioButton.click(); //fix !!!
}

/**
 * fill weights dropdown options when selecting one of fonts in the font family dropdown
 * @param {String} family - selected font family
 */
function fillWeightsDropdown(family) {
    const link = fonts[family],
        weights = link.match(/\d{3}/g),
        weightsNames = {
            100: 'thin',
            200: 'extra light',
            300: 'light',
            400: 'regular',
            500: 'medium',
            600: 'semi-bold',
            700: 'bold',
            800: 'extra bold',
            900: 'black',
        };

    weightsDatalist.innerHTML = '';

    let i = 0;
    try {
        while (i < weights.length) {
            let weight = weights[i];
            createOption(`${weight} - ${weightsNames[weight]}`,
                weight,
                weightsDatalist, false);
            i++;
        }
    } catch (error) {
        // fonts which return null on weights.length
        let weight = 400;
        createOption(`${weight} - ${weightsNames[weight]}`, weight,
            weightsDatalist, false);
    }
}

/**
 * Updates font weights dropdown selected option
 * @param {String} oldSelectedWeight
 */
function updateSelectedWeight(oldSelectedWeight) {
    let option = weightsDatalist.querySelector(
        `option[value="${oldSelectedWeight}"]`);
    if (option === null) {
        weightsDatalist.dispatchEvent(new Event('change'));
    } else {
        option.setAttribute('selected', '');
    }
}

/**
 * Create option element for select dropdown
 */
function createOption(textContent, value, append, toAdd) {
    let option = document.createElement('option');

    option.textContent = textContent;
    option.value = value;

    if (toAdd) {
        option.classList.add(textContent.replace(" ", "_"));
    }

    append.appendChild(option);
}

function sortObject(obj) {
    return Object.keys(obj).sort().reduce((accumulator, current) => {
        accumulator[current] = obj[current];
        return accumulator;
    }, {});
}

function updateFontWeightOutput() {
    output_font_weight.value = slider_font_weight.value;
}

function updateOutput() {
    output.value = slider.value;
}

function clearSlider() {
    slider.value = 1;
    slider_font_weight.value = 400;
    output_font_weight.value = 400;
    output.innerHTML = '1';
}

function clear_style() {
    chrome.tabs.executeScript(null, {
        code: "var paras = document.getElementsByTagName('p');for (var i = 0; i < paras.length; i++) {paras[i].style.removeProperty('line-height');}"
    });
    clearSlider();

    const radioDefault = document.getElementById("2");
    radioDefault.click();

    ruler.checked = false;
    reader.checked = false;
    voicer.checked = false;
    bionic.checked = false;

    let fontSelected = 'Default';
    fontSelect.value = fontSelected;
    applyFontFamily(fontSelected, fonts[fontSelected])
    chrome.storage.sync.set({
        gt_font_family: fontSelected,
        gt_font_link: fonts[fontSelected]
    });

    chrome.storage.sync.set({
        gt_ruler: false,
        gt_reader: false,
        gt_voicer: false,
        gt_bionic: false,
        gt_font_weight: 400,
        gt_font_height: 1,
    });
    updatePage();
}

function slider_line_height() {
    chrome.tabs.executeScript(null, {
        code: "var paras = document.getElementsByTagName('p');for (var i = 0; i < paras.length; i++) {paras[i].setAttribute('style', 'line-height:" +
            slider.value + " !important');}"
    });
}

function slider_line_weight() {

    chrome.tabs.executeScript(null, {
        code: `var paras = document.getElementsByTagName('*')

        for (let i = 0; i < paras.length; i++) {
            var text = paras[i].innerHTML;
            var cEng =  /[\\p{Letter}\\p{Mark}]/u.test(text);
            if (cEng) {
                const classNames = paras[i].className.split(' ');
                for (let j = 0; j < classNames.length; j++) {
                  let cl = classNames[j];
                 if (cl.includes('helloGo')) {
                        paras[i].classList.remove(cl);
                    }
                }
                paras[i].classList.add('helloGo-`+slider_font_weight.value+`')
            }
        }`
    });

}

function changeHandler() {
    switch (this.value) {
    case "1":
        chrome.tabs.executeScript(null, {
            code: "var paras = document.getElementsByTagName('img');for (var i = 0; i < paras.length; i++)" +
                "{paras[i].classList.add('picHider');}"
        });
        break;
    case "2":
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            let activeTab = tabs[0];
            let activeTabId = activeTab.id; // or do whatever you need
            chrome.tabs.executeScript(activeTabId, {
                file: 'inject-filler-remover.js'
            });
        });
        break;
    case "3":
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            let activeTab = tabs[0];
            let activeTabId = activeTab.id; // or do whatever you need
            chrome.tabs.executeScript(activeTabId, {
                file: 'inject-filler.js'
            });
        });
        break;

    }
}

function pic_listener(radios, func) {
    Array.prototype.forEach.call(radios, function (radio) {
        radio.addEventListener('change', func);
    });
}

function updateButton(onOrOff){
    turnButton.innerHTML = onOrOff ? "Enable" : "Disable";
    turnButton.className = onOrOff ? "button button1 bn1-hover bn1" : "button button3 bn2-hover bn2";
}        

function toggleButton(){
    backgroundPage.isExtensionOn = !backgroundPage.isExtensionOn;
    updateButton(backgroundPage.isExtensionOn);
    chrome.storage.sync.set({
        is_work: backgroundPage.isExtensionOn
    });
}

function updatePage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
}

chrome.runtime.getBackgroundPage(function(bgPage) {
    backgroundPage = bgPage;
    updateButton(bgPage.isExtensionOn);
    turnButton.onclick = toggleButton;
    turnButton.style.display = "";
    document.getElementById("br1").style.display = "";
    document.getElementById("br1").style.display = "";
});