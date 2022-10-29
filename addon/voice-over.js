(function() {
    'use strict';
    let selection = window.getSelection();

    window.AudioContext = window.AudioContext || window.webkitAudioContext;


    const fetchSong = async () => {
        var request = new Request({
            url: `https://voice.mcs.mail.ru/tts?text=${selection}&encoder=mp3`,
            headers: {
                'Authorization': '2gUfrzWSUSwwoizbQpTh4zhuFQsBn4jeYgNHeS1SoPBDj2Ti4'
            },
            redirect: "follow",
            credentials: 'include',
        });

        const xhr = await fetch(request.url, {
            headers: {
                'Authorization': '2gUfrzWSUSwwoizbQpTh4zhuFQsBn4jeYgNHeS1SoPBDj2Ti4'
            },
        });
        alert(xhr.status)
        return xhr.arrayBuffer();
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