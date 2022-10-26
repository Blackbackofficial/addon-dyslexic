const /**
     * variables from background
     */
    background = chrome.extension.getBackgroundPage(),
    addEvent = background.addEvent,
    applyStyles = background.applyStyles,
    selectors = background.selectors,
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
    fontSelect = document.querySelector('#font_select')
    //picSelect = document.querySelector('#pic-hider')

    slider_font_weight = document.querySelector('#slider_font_weight');
    output_font_weight = document.querySelector('#output_font_weight');

    slider = document.querySelector('#slider');
    output = document.querySelector('#output');
    clear_btn = document.querySelector('#clear_btn');
    radiohld = document.querySelector('#pic_hider');
    radios = document.querySelectorAll('input[type=radio][name="pic"]');
    ruler = document.querySelector('#rulerGuides');



// popup document content loaded
addEvent(document, 'DOMContentLoaded', function () {
    initEvents();
    addSelectsFonts();
    fillFontsDrodown();
    updateUIFromStorage();

    input_listener(slider_font_weight, updateFontWeightOutput);
    input_listener(slider_font_weight, slider_line_weight);

    input_listener(slider, slider_line_height);
    input_listener(slider, updateOutput);
    click_listener(clear_btn, clear_style);
    pic_listener(radios, changeHandler);
    init_clicker_listener(ruler, initRuler);
    init_clicker_listener(ruler, changeRuler);
});



/**
 * Binding the necessary events to popup DOM elements
 */
function initEvents() {

    addEvent(fontsDatalistInput, 'input', function () {
        const oldSelectedWeight = weightsDatalistInput.value,
            fontSelected = fontsDatalistInput.value,
            isLocalFont = Object.keys(fonts).indexOf(fontSelected) === -1;

        applyFontFamily(fontSelected);

        chrome.storage.sync.set({
            gt_font_family: fontSelected,
            gt_font_link: fonts[fontSelected]
        });

        if (!isLocalFont) {
            fillWeightsDropdown(fontsDatalistInput.value);
            updateSelectedWeight(oldSelectedWeight);
        }
    });

    document.getElementById("font_select").addEventListener('change', (event) => {
        const oldSelectedWeight = weightsDatalistInput.value,
            fontSelected = event.target.value,
            isLocalFont = Object.keys(fonts).indexOf(fontSelected) === -1;
        applyFontFamily(fontSelected);
        chrome.storage.sync.set({
            gt_font_family: fontSelected,
            gt_font_link: fonts[fontSelected]
        });

        if (!isLocalFont) {
            fillWeightsDropdown(fontsDatalistInput.value);
            updateSelectedWeight(oldSelectedWeight);
        }
    });

    // addEvent(weightsDatalistInput, 'input', function () {
    //     var selectedWeight = weightsDatalistInput.value;
    //     applyFontWeight(selectedWeight);
    //     chrome.storage.sync.set({ gt_font_weight: selectedWeight });
    // });

    addEvent(slider_font_weight, 'change', function (event) {
        console.log("HEREEEEEE", slider_font_weight.value)
        var selectedWeight = slider_font_weight.value;
        applyFontWeight(selectedWeight);
        chrome.storage.sync.set({ gt_font_weight: selectedWeight });
    });

    addEvent(IndentGuidesCheckbox, 'change', function (event) {
        var checked = event.target.checked;
        checked ? hideIndentGuides() : showIndentGuides();
        chrome.storage.sync.set({ gt_indent_guide: !checked });
    });

    addEvent(IndentGuidesCheckbox, 'change', function (event) {
        var checked = event.target.checked;
        checked ? hideIndentGuides() : showIndentGuides();
        chrome.storage.sync.set({ gt_indent_guide: !checked });
    });
}

/**
 * Populate options of the select font families dropdown
 */
function fillFontsDrodown() {
    const sortedFonts = sortObject(fonts);
    for (var fontName in sortedFonts) {
        if (!Object.prototype.hasOwnProperty.call(fonts, fontName)) {
            continue;
        }

        createOption(fontName, fontName, fontsDatalist);
    }
}

/**
 * Populate options of the select font families dropdown
 */
function addSelectsFonts() {
    const sortedFonts = sortObject(fonts);
    for (var fontName in sortedFonts) {
        if (!Object.prototype.hasOwnProperty.call(fonts, fontName)) {
            continue;
        }

        createOption(fontName, fontName, fontSelect);
    }
}

/**
 * Get font settings from storage and initialize the select dropdowns
 */
function updateUIFromStorage() {
    chrome.storage.sync.get(['gt_font_family', 'gt_font_weight', 'gt_indent_guide'], function (data) {
        if (Object.keys(data).length > 0) {
            const isLocalFont = Object.keys(fonts).indexOf(data.gt_font_family) === -1;

            // make the restored font family & weight selected
            fontsDatalistInput.value = data.gt_font_family;
            weightsDatalistInput.value = data.gt_font_weight;

            // update indentation guides checkbox
            IndentGuidesCheckbox.checked = !data.gt_indent_guide;

            if (!isLocalFont) {
                // fill the weights dropdown
                fillWeightsDropdown(fontsDatalistInput.value);
            }
        }
    });
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

    var i = 0;
    try {
        while (i < weights.length) {
            var weight = weights[i];
            createOption(`${weight} - ${weightsNames[weight]}`, weight, weightsDatalist);
            i++;
        }
    } catch (error) {
        // fonts which return null on weights.length
        var weight = 400;
        createOption(`${weight} - ${weightsNames[weight]}`, weight, weightsDatalist);
    }
}

/**
 * Updates font weights dropdown selected option
 * @param {String} oldSelectedWeight
 */
function updateSelectedWeight(oldSelectedWeight) {
    var option = weightsDatalist.querySelector(`option[value="${oldSelectedWeight}"]`);
    if (option === null) {
        /**
         * The first option was selected and the old font weight isn't supported by
         * the new selected font family, so we trigger the weights dropdown change
         * event to apply the first selected font weight.
         */
        weightsDatalist.dispatchEvent(new Event('change'));
    } else {
        option.setAttribute('selected', '');
    }
}

/**
 * Create option element for select dropdown
 */
function createOption(textContent, value, append) {
    var option = document.createElement('option');

    option.textContent = textContent;
    option.value = value;

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
    output.innerHTML = '1';
}

function clearLineHeightInput () {
    line_height_input.value = '';
}


function clear_style() {
    chrome.tabs.executeScript(null,
        {code:"var paras = document.getElementsByTagName('p');for (var i = 0; i < paras.length; i++) {paras[i].style.removeProperty('line-height');}"}
    );
    clearSlider();
    clearLineHeightInput();
}

function slider_line_height () {
    console.log(slider.value)
    chrome.tabs.executeScript(null,
        {code:"var paras = document.getElementsByTagName('p');for (var i = 0; i < paras.length; i++) {paras[i].setAttribute('style', 'line-height:" + slider.value + " !important');}"}
    );
    clearLineHeightInput();
}

function slider_line_weight () {
    console.log(slider_font_weight.value)
    chrome.tabs.executeScript(null,
        {code:"var paras = document.getElementsByTagName('p');for (var i = 0; i < paras.length; i++) {paras[i].setAttribute('style', 'line-weight:" + slider_font_weight.value + " !important');}"}
    );
}

function slider_line_height_input () {
    console.log(line_height_input.value)
    chrome.tabs.executeScript(null,
        {code:"var paras = document.getElementsByTagName('p');for (var i = 0; i < paras.length; i++) {paras[i].setAttribute('style', 'line-height:" + line_height_input.value + " !important');}"}
    );
    clearSlider();
}

function input_listener(identifier, func) {
    identifier.addEventListener('change', function() {
        func();
    });

    identifier.addEventListener('paste', function() {
        func();
    });

    identifier.addEventListener('input', function() {
        func();
    });
}

function click_listener(identifier, func) {
    identifier.addEventListener('click', function() {
        func();
    });
}


function changeHandler() {
    switch (this.value){
        case "1":
            chrome.tabs.executeScript(null,
                {code:"var paras = document.getElementsByTagName('img');for (var i = 0; i < paras.length; i++)" +
                        "{paras[i].classList.add('picHider');}"}
            );
            break
        case "2":
            chrome.tabs.executeScript(null,
                {code:"var paras = document.getElementsByTagName('img');for (var i = 0; i < paras.length; i++) " +
                        "{paras[i].classList.remove('picHider');paras[i].classList.remove('picFiller');}"}
            );
            break
        case "3":
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                var activeTab = tabs[0];
                var activeTabId = activeTab.id; // or do whatever you need
                chrome.tabs.executeScript(activeTabId, {
                    file: 'inject-filler.js'
                });
            });
            break

    }
   //alert(this.value)
}


function pic_listener(radios, func) {

    Array.prototype.forEach.call(radios, function(radio) {
        radio.addEventListener('change', func);
    });
}


function init_clicker_listener(identifier, func) {
    identifier.addEventListener('change', function() {
        func();
    });
}

function changeRuler(){
    chrome.tabs.executeScript(null,
        {code:"var paras =  document.querySelector('#rulerItem');"}
    );
};

function initRuler(){
    if (ruler.checked) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            var activeTab = tabs[0];
            var activeTabId = activeTab.id; // or do whatever you need
            chrome.tabs.executeScript(activeTabId, {
                file: 'inject.js'
            });
        });
    }

}