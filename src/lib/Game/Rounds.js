import Module from '../../Module.js';
import RoundsTemplate from './templates/Rounds.html';

export default class extends Module {
    constructor(args) {
        super();
        return new Promise((resolve, reject) => {
            this.label = 'ROUNDS';
            this.game = args;
            this.app = this.game.app;

            console.log(this.label, '>>> INIT');

            this.on('ready', () => {
                console.log(this.label, '>>> READY');
                resolve(this);
            });

            this.target = toDOM(RoundsTemplate());
            document.querySelector('body').append(this.target);

            this.actualElement = this.target.querySelector('.game-rounds-actual');
            this.maxElement = this.target.querySelector('.game-rounds-max');
            this.maxElement.innerHTML = parseInt(this.game.setup.rounds);

            const animationA = this.app.anime
                .timeline({
                    loop: false
                })
                .add({
                    targets: '.game-rounds',
                    translateX: [-300, 0],
                    filter: ['blur(10px)', 'blur(0px)'],
                    duration: 1000,
                    delay: (el, i) => 150 * i,
                    easing: 'easeInOutExpo'
                });

            this.game.on('buzzer', () => this.buzzOn());


            this.emit('ready');
        });
    }

    away(){
        const animationA = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: '.game-rounds',
                translateX: [0, -300],
                filter: ['blur(0px)', 'blur(10px)'],
                duration: 1000,
                delay: (el, i) => 150 * i,
                easing: 'easeInOutExpo'
            });
    }

    setRound() {
        this.actualElement.innerHTML = this.game.round + 1;
    }

    buzzOn(){
        this.buzzed = true;
    }

    buzzOff(){
        this.buzzed = false;
    }

    set buzzed(val) {
        this._buzzed = val;
        if (this.target)
            this.buzzed ? this.target.classList.add('buzzed') : this.target.classList.remove('buzzed');
    }

    get buzzed() {
        return this._buzzed;
    }


}
