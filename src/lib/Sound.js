import Module from '../Module.js';

/**
 * Index of all Sound Events
 *
 * load-category
 * loaded-category
 * loaded-categories-out
 * scramble-text-in
 * scramble-text-out
 * setup-players-in
 * setup-focus-player
 * setup-button-next
 * setup-button-all
 * setup-button-none
 * setup-rounds-in
 * setup-rounds-out
 * setup-focus-round
 * setup-blur-round
 * get-ready
 * round-number
 * players-in
 * player-in
 * player-buzzed
 * player-buzzed-timeout
 * player-chose-correct
 * player-chose-wrong
 * question-in
 * question-out
 * question-word-in
 * answer-in
 * answer-out
 * answers-in
 * answers-out
 * answer-word-in
 * all-players-wrong
 */
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
                }, {
                    name: 'blop',
                    file: 'plip_02.mp3'
                }, {
                    name: 'zirp',
                    file: 'plip_03.mp3'
                }, {
                    name: 'zarp',
                    file: 'plip_04.mp3'
                }, {
                    name: 'zosch',
                    file: 'text_01.mp3'
                }, {
                    name: 'wrong',
                    file: 'wrong.mp3'
                }, {
                    name: 'correct',
                    file: 'correct.mp3'
                }, {
                    name: 'buzzed',
                    file: 'buzzed.mp3'
                }, {
                    name: 'skip',
                    file: 'all_players_wrong.mp3'
                }, {
                    name: 'music-question',
                    file: 'music_question.mp3',
                    loop: true
                },
            ];

            this.events = [
                {
                    name: 'loaded-category',
                    sound: 'zirp'
                }, {
                    name: 'load-category',
                    sound: 'blop'
                }, {
                    name: 'loaded-categories-out',
                    sound: 'zosch'
                }, {
                    name: 'scramble-text-in',
                    sound: 'zosch'
                }, {
                    name: 'get-ready',
                    sound: 'zosch'
                }, {
                    name: 'question-word-in',
                    sound: 'zirp'
                }, {
                    name: 'answer-word-in',
                    sound: 'zarp'
                }, {
                    name: 'player-chose-correct',
                    sound: 'correct'
                }, {
                    name: 'player-chose-wrong',
                    sound: 'wrong'
                }, {
                    name: 'player-buzzed',
                    sound: 'buzzed'
                }, {
                    name: 'all-players-wrong',
                    sound: 'skip'
                }, {
                    name: 'play-music-question',
                    sound: 'music-question'
                }
            ];

            // register all sound events here
            this.events.map(event => {
                this.on(event.name, () => this.play(event.sound));
            });

            this.on('stop-music-question', () => {
                this.stop('music-question');
            });

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
        }).catch(() => {
            return this.loadAll(index + 1);
        });
    }

    load(sound) {
        return new Promise((resolve, reject) => {
            console.log('>>>', this.label, 'LOADING', sound.name);
            const audio = document.createElement('AUDIO');
            audio.name = sound.name;

            if (sound.loop)
                audio.loop = sound.loop;

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

        if (audio.pause)
            audio.pause();

        audio.currentTime = 0;
        audio.play();
    }

    stop(name) {
        const audio = this.items.filter(i => i.name === name)[0];
        if (!audio)
            return;

        audio.pause();
        audio.currentTime = 0;
    }


}
