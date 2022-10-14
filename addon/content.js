chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'loadFont') {
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(`@import url(${message.font.link})`));
        console.log("HERE!", style, message.font.link)
        document.head.appendChild(style);
    }
    return true;
});
