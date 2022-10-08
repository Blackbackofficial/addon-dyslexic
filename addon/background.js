var /**
     * Supported fonts
     */
    fonts = {
        'PT Mono': 'https://fonts.googleapis.com/css2?family=PT+Mono&display=swap',
        'OpenDyslexic': 'https://github.com/Blackbackofficial/addon-dyslexic/blob/vr009/init/fonts/OpenDyslexic-Bold.otf?raw=true',
        'OpenDyslexic2': 'http://localhost:8100/OpenDyslexic.css', 'Atma':'https://fonts.googleapis.com/css2?family=Atma:wght@300;400;500;600;700&display=swap',
    },
    selectors = {
        code: '*',
        intentGuides: '[data-rgh-whitespace="space"]',
    };

// add a listener to tabs.onUpdated event
chrome.tabs.onUpdated.addListener(function (tabId, info) {
    // if the tab is completely loaded
    if (info.status === 'complete') {
        chrome.storage.sync.get(['gt_font_family', 'gt_font_weight', 'gt_font_link', 'gt_indent_guides'], function (data) {
            if (Object.keys(data).length > 0) {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'loadFont',
                        font: {
                            font: data.gt_font_family,
                            link: data.gt_font_link,
                        },
                    });
                });

                applyFontFamily(data.gt_font_family);
                applyFontWeight(data.gt_font_weight);
                data.gt_indent_guides ? showIndentGuides() : hideIndentGuides();
            }
        });

        // Intercept the load font message from the popup script
        // and resend the same request to the content script
        chrome.runtime.onMessage.addListener(function (request) {
            if (request.type === 'loadFont') {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, request);
                });
            }
        });
    }
});

/**
 * Apply the giving css styles to Github code container
 * @param {String} styles
 * @returns true
 */
function applyStyles(selector, styles) {
    const css = stylesToCss(styles);
    chrome.tabs.insertCSS({
        code: `${selector} {${css}}`,
    });
}

/**
 * Converts the giving css styles object into a regular CSS string
 * @param {Object} styles
 * @returns {String}
 */
function stylesToCss(styles) {
    var css = '';
    for (let property in styles) {
        const value = styles[property];
        if (!Object.prototype.hasOwnProperty.call(styles, property) || !value) {
            continue;
        }
        css += `${property}: ${value} !important;`;
    }

    return css;
}

/**
 * Applies the giving font family to the html github code container
 * @param {String} family
 */
function applyFontFamily(family) {
    applyStyles(selectors.code, { 'font-family': family });
    chrome.extension.sendMessage({
        type: 'loadFont',
        font: {
            font: family,
            link: fonts[family],
        },
    });
}

/**
 * Applies the provided weight to the html github code container
 * @param {String} weight
 */
function applyFontWeight(weight) {
    applyStyles(selectors.code, { 'font-weight': weight });
}

function hideIndentGuides() {
    applyStyles(selectors.intentGuides, { visibility: 'hidden' });
}

function showIndentGuides() {
    applyStyles(selectors.intentGuides, { visibility: 'visible' });
}

/**
 * Just a shortcut for the native target.addEventListener
 * @param {DOMElement} ele
 * @param {String} event
 * @param {function} handler
 */
function addEvent(ele, event, handler) {
    ele.addEventListener(event, handler.bind(this), false);
}
