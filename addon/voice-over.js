document.addEventListener('keydown', function(event) {
    if (event.code == 'KeyZ' && (event.ctrlKey || event.metaKey)) {
        let selection = window.getSelection();

        window.AudioContext = window.AudioContext || window.webkitAudioContext;


        console.log(selection)
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
            console.log('HERE')
            console.log(result.status)
            return result.arrayBuffer();
        };

        fetchSong().then(
            (audio) => {
                console.log('music')
                console.log(audio.byteLength)
                // вопросы к этому куску
                // const ctx = new AudioContext();
                // Audio(url)
                const blob = new Blob([audio], {type: 'audio/mp3'})
                console.log('blob')
                const url = URL.createObjectURL(blob);
                console.log(url)
                const playSound = new Audio(url);
                playSound.play().then(a => console.log('then')).catch(e => console.log(e));

            }
        ).catch(e => console.log(e));
}});