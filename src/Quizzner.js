import './scss/app.scss';
import './Globals.js';
import Module from './Module.js';
import Intro from './lib/Intro/index.js';
import Game from './lib/Game/index.js';
import Data from './lib/Data/index.js';
import Sound from './lib/Sound.js';

import anime from 'animejs';

export default class extends Module {
    constructor(args) {
        super();

        return new Promise((resolve, reject) => {
            this.label = 'QUIZZNER';
            this.options = args;
            this.options.debug = this.options.debug || false;
            this.options.language = this.options.language || 'de';
            this.options.setup = this.options.setup || {
                players: ['Matze', 'Horst', 'Marie', 'Holger'],
                categories: ['Natur'],
                rounds: 12
            };

            this.getParams();
            window.quizznerOptions = this.options;  // to access it for logging

            console.log(this.label, '>>> INIT');

            this.on('ready', () => {
                resolve(this);
            });

            this.on('resize-start', () => {
                console.log(this.label, '>>> WINDOW RESIZE START');
            });

            this.on('resize-end', () => {
                console.log(this.label, '>>> WINDOW RESIZE END');
            });

            //
            this.anime = anime;

            // window resize end behavior
            this.resizeTimeout = false;
            this.resizing = false;
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeStart();
                this.resizeTimeout = setTimeout(() => {
                    this.resizeEnd();
                }, 500);
            });

            //
            new Sound()
                .then(sound => {
                    this.sound = sound;
                    return new Intro(this);
                })
                .then(intro => {
                    this.intro = intro;
                    return new Data(this);
                })
                .then(data => {
                    this.data = data;
                    return new Game(this);
                })
                .then(game => {
                    this.game = game;
                    setTimeout(() => this.removeIntro(), 2000); // @TODO
                    this.emit('ready');
                });

        });
    }

    resizeStart() {
        if (this.resizing === true)
            return;

        this.resizing = true;
        this.emit('resize-start', this);
    }

    resizeEnd() {
        this.emit('resize-end', this);
        this.resizing = false;
    }

    removeIntro() {
        if (!this.intro)
            return;

        this.intro.remove();
        delete this.intro;
    }

    /**
     * you can setup via url get parameters
     * but only strings, boolean and integer
     * will be taken
     */
    getParams() {
        let params = (new URL(document.location)).searchParams;
        Object.keys(this.options).map(field => {
            if (typeof this.options[field] === 'object')
                return;

            let value = params.get(field);

            if (!value)
                return;

            if (typeof this.options[field] === 'boolean')
                value === 'true' ? value = true : value = false;

            if (typeof this.options[field] === 'number')
                value = parseInt(value);

            this.options[field] = value;
        });
    }

}
