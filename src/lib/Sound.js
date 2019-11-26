import Module from '../Module.js';

export default class extends Module {
    constructor(args) {
        super();
        return new Promise((resolve, reject) => {
            this.label = 'SOUND';
            this.app = args;
            console.log(this.label, '>>> INIT');

            this.sounds = [
                {
                    name: 'plip',
                    file: 'plip_01.mp3'
                },
                {
                    name: 'zosch',
                    file: 'text_01.mp3'
                },
            ];

            this.on('ready', () => {
                console.log(this.label, '>>> READY');
                resolve(this);
            });

            this.loadAll().then(() => {
                this.emit('ready');
            });

        });
    }

    loadAll(index) {
        if (!index)
            index = 0;

        const sound = this.sounds[index];
        if (!sound)
            return Promise.resolve();

        return this.load(sound).then(audio => {
            this.items.push(audio);
            return this.loadAll(index + 1);
        });
    }

    load(sound) {
        return new Promise((resolve, reject) => {
            console.log('>>>', this.label, 'LOADING', sound.name);
            const audio = document.createElement('AUDIO');
            audio.name = sound.name;
            audio.oncanplay = () => {
                console.log('>>>', this.label, 'LOADED', sound.name);
                resolve(audio);
            };
            audio.onerror = () => {
                console.log('>>>', this.label, 'FILE NOT FOUND', sound.name);
                reject();
            };
            audio.src = `sounds/${sound.file}`;
            audio.load();
        });
    }

    play(name) {
        const audio = this.items.filter(i => i.name === name)[0];
        if (!audio)
            return;

        if (audio.stop)
            audio.stop();

        audio.currentTime = 0;
        audio.play();
    }


}
