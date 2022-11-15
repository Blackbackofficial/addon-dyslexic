// popup document content loaded
addEvent(document, 'DOMContentLoaded', function () {
    initEvents();
    addSelectsFonts();
    // fillFontsDrodown();
    updateUIFromStorage();
    input_listener(slider_font_weight, updateFontWeightOutput);
    input_listener(slider_font_weight, slider_line_weight);
    input_listener(slider, slider_line_height);
    input_listener(slider, updateOutput);
    click_listener(clear_btn, clear_style);
    pic_listener(radios, changeHandler);
    init_clicker_listener(ruler, initRuler);
    // init_clicker_listener(ruler, changeRuler);
    init_clicker_listener(reader, initReader);
    init_clicker_listener(voicer, initVoicer);
    init_clicker_listener(bionic, initBionic);
});

function init_clicker_listener(identifier, func) {
    identifier.addEventListener('change', function () {
        func();
    });
}

function initRuler() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        let activeTab = tabs[0];
        let activeTabId = activeTab.id; // or do whatever you need
        chrome.storage.sync.set({
            gt_last_tab_id: activeTabId,
        })

        chrome.tabs.executeScript(activeTabId, {
            file: 'inject.js'
        });
    });
}

function click_listener(identifier, func) {
    identifier.addEventListener('click', function () {
        func();
    });
}

function input_listener(identifier, func) {
    identifier.addEventListener('change', function () {
        func();
    });
    identifier.addEventListener('paste', function () {
        func();
    });
    identifier.addEventListener('input', function () {
        func();
    });
}

function initReader() {
    if (reader.checked) {
        chrome.tabs.executeScript({
            file: 'inject-index.js'
        });
        chrome.tabs.insertCSS({
            file: 'inject-css.css'
        });
        chrome.tabs.executeScript({
            file: 'inject-reader.js'
        });
    }
}

function initVoicer() {
    if (voicer.checked) {
        // to save a state
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            let activeTab = tabs[0];
            let activeTabId = activeTab.id; // or do whatever you need
            chrome.tabs.executeScript(activeTabId, {
                file: 'voice-over.js'
            });
        })
    } else  {
        // to save a state
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            let activeTab = tabs[0];
            let activeTabId = activeTab.id; // or do whatever you need
            chrome.tabs.executeScript(activeTabId, {
                file: 'voice-over-remover.js'
            });
        })
    }
}

function initBionic() {
    //if (bionic.checked) {
        // to save a state
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            let activeTab = tabs[0];
            let activeTabId = activeTab.id; // or do whatever you need
            chrome.tabs.executeScript(activeTabId, {
                file: 'inject-bionic.js'
            });
        })
   // }
}

/**
 * Get font settings from storage and initialize the select dropdowns
 */
function updateUIFromStorage() {
    chrome.storage.sync.get(IdEvents, function (data) {
        if (Object.keys(data).length > 0) {
            if (data.gt_radio_button === undefined) {
                data.gt_radio_button = 2;
            }

            const isLocalFont = Object.keys(fonts).indexOf(data.gt_font_family) === -1;
            // make the restored font family & weight selected
            fontsDatalistInput.value = data.gt_font_family;
            weightsDatalistInput.value = data.gt_font_weight;
            // update indentation guides checkbox

            ruler.checked = data.gt_ruler;
            reader.checked = data.gt_reader;
            voicer.checked = data.gt_voicer;

            IndentGuidesCheckbox.checked = !data.gt_indent_guide;
            insertPreviousValues(data);
            if (!isLocalFont) {
                // fill the weights dropdown
                fillWeightsDropdown(fontsDatalistInput.value);
            }

            initRuler();

            applyFontFamily(data.gt_font_family);
            applyFontWeight(data.gt_font_weight);
        }
    });
}

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
    addEvent(weightsDatalistInput, 'input', function () {
        let selectedWeight = weightsDatalistInput.value;
        applyFontWeight(selectedWeight);
        chrome.storage.sync.set({
            gt_font_weight: selectedWeight
        });
    });
    addEvent(slider_font_weight, 'change', function () {
        let selectedWeight = slider_font_weight.value;
        applyFontWeight(selectedWeight);
        chrome.storage.sync.set({
            gt_font_weight: selectedWeight
        });
    });
    addEvent(radiohld, 'change', function () {
        for (const radioButton of radios) {
            if (radioButton.checked) {
                chrome.storage.sync.set({
                    gt_radio_button: radioButton.value
                });
                break;
            }
        }
    });
    addEvent(slider, 'change', function () {
        let selectedHeight = slider.value;
        chrome.storage.sync.set({
            gt_font_height: selectedHeight
        });
    });
    addEvent(radiohld, 'change', function () {
        let radioChoice = radiohld.value;
        chrome.storage.sync.set({
            gt_radio_choice: radioChoice
        });
    });
    addEvent(ruler, 'change', function (event) {
        let checked = event.target.checked;
        chrome.storage.sync.set({
            gt_ruler: checked
        });
    });
    addEvent(voicer, 'change', function (event) {
        let checked = event.target.checked;
        chrome.storage.sync.set({
            gt_voicer: checked
        });
    });
    addEvent(reader, 'change', function (event) {
        let checked = event.target.checked;
        chrome.storage.sync.set({
            gt_reader: checked
        });
    });
    addEvent(IndentGuidesCheckbox, 'change', function (event) {
        let checked = event.target.checked;
        checked ? hideIndentGuides() : showIndentGuides();
        chrome.storage.sync.set({
            gt_indent_guide: !checked
        });
    });
    addEvent(IndentGuidesCheckbox, 'change', function (event) {
        let checked = event.target.checked;
        checked ? hideIndentGuides() : showIndentGuides();
        chrome.storage.sync.set({
            gt_indent_guide: !checked
        });
    });
}