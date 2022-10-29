(function() {
    'use strict';
    let selection = window.getSelection();

    window.AudioContext = window.AudioContext || window.webkitAudioContext;


    alert(selection)
    const fetchSong = async () => {
        const response = await fetch(`https://voice.mcs.mail.ru/tts?text=${selection}&encoder=mp3`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer *'
            },
            redirect: "follow",
            credentials: 'include',
        });
        let result = await response;
        alert('HERE')
        alert(result.status)
        return result.arrayBuffer();
    };

    fetchSong().then(
        (audio) => {
            alert('music')
            alert(audio.byteLength)
            // вопросы к этому куску
            // const ctx = new AudioContext();
            // Audio(url)
            const blob = new Blob([audio], { type: 'audio/mp3' })
            alert('blob')
            const url = URL.createObjectURL(blob);
            alert(url)
            const playSound = new Audio(url);
            playSound.play().then(a => alert('then')).catch(e => alert(e));

        }
    ).catch(e => alert(e))

}());