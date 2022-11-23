var
    /**
     * Supported fonts
     */
    fonts = {
        'PT Mono': 'https://fonts.googleapis.com/css2?family=PT+Mono&display=swap',
        'Atma': 'https://fonts.googleapis.com/css2?family=Atma:wght@300;400;500;600;700&display=swap',
        'OpenDyslexic': 'chrome-extension://nlglaolkmemefakgfhngpnhljanellie/fonts/OpenDyslexic.css',
        'SylexiadSansThin': 'chrome-extension://nlglaolkmemefakgfhngpnhljanellie/fonts/SylexiadSansThin.css',
        'SylexiadSerifThin': 'chrome-extension://nlglaolkmemefakgfhngpnhljanellie/fonts/SylexiadSerifThin.css',
        'Default': ''
    },
    selectors = {
        code: '*',
        intentGuides: '[data-rgh-whitespace="space"]',
    };

// add a listener to tabs.onUpdated event
chrome.tabs.onUpdated.addListener(function (tabId, info) {
    // if the tab is completely loaded
    if (info.status === 'complete') {
        //chrome.tabs.insertCSS(tabId, {code: ".img:not(:hover) {opacity: 0 !important;}"});
        chrome.storage.sync.get(['gt_font_family', 'gt_font_weight', 'gt_font_link', 'gt_indent_guides', 'is_work'], function (data) {
            console.log("Start")
            if (Object.keys(data).length > 0) {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'loadFont',
                        font: {
                            font: data.gt_font_family,
                            link: data.gt_font_link,
                        },
                    });
                });

                applyFontFamily(data.gt_font_family, fonts[data.gt_font_family]);
                applyFontWeight(data.gt_font_weight);
                data.gt_indent_guides ? showIndentGuides() : hideIndentGuides();
            }
        });

        // Intercept the load font message from the popup script
        // and resend the same request to the content script
        chrome.runtime.onMessage.addListener(function (request) {
            console.log("Start2")
            if (request.type === 'loadFont') {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, request);
                });
            }
        });
    }
});

/**
 * Apply the giving css styles to Github code container
 * @param selector
 * @param {String} styles
 * @returns true
 */
function applyStyles(selector, styles) {
    console.log("Apply")
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
        css += `${property}: ${value};`;
    }

    return css;
}

/**
 * Applies the giving font family to the html
 * @param {String} family
 */
function applyFontFamily(family, link) {
    applyStyles(selectors.code, {
        'font-family': family,
        'src': link,
    });
}

/**
 * Applies the provided weight to the html github code container
 * @param {String} weight
 */
function applyFontWeight(weight) {
    applyStyles(selectors.code, {
        'font-weight': weight
    });
}

function hideIndentGuides() {
    applyStyles(selectors.intentGuides, {
        visibility: 'hidden'
    });
}

function showIndentGuides() {
    applyStyles(selectors.intentGuides, {
        visibility: 'visible'
    });
}

/**
 * Just a shortcut for the native target.addEventListener
 * @param {String} ele
 * @param {String} event
 * @param {function} handler
 */
function addEvent(ele, event, handler) {
    ele.addEventListener(event, handler.bind(this), false);
}

var isExtensionOn = true;