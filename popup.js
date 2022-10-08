const fonts = {
    'Fira': 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap',
    'OpenDyslexic': '/fonts/OpenDyslexic-Regular.otf',
};

const selectors = {
    code: '.blob-code-inner',
    intentGuides: '[data-rgh-whitespace="space"]',
};

let central = document.getElementById("central");

central.addEventListener("click", async () => {
    // получаем доступ к активной вкладке
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // выполняем скрипт
    chrome.scripting.executeScript({
        // скрипт будет выполняться во вкладке, которую нашли на предыдущем этапе
        target: { tabId: tab.id },
        // вызываем функцию, в которой меняется шрифт
        function: changeFont,
    });
});

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
            var weight = weights[4];
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
 * Create option element for select dropdown
 */
function createOption(textContent, value, append) {
    var option = document.createElement('option');

    option.textContent = textContent;
    option.value = value;

    append.appendChild(option);
}

function changeFont() {
    console.log('HERE');
    fillWeightsDropdown("OpenDyslexic");
}
