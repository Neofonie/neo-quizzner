import Module from '../../Module.js';
import HighscoreTemplate from './templates/Highscore.html';
import HighscoreButtons from './templates/HighscoreButton.html';

export default class extends Module {
    constructor(args) {
        super();
        return new Promise((resolve, reject) => {
            this.label = 'HIGHSCORE';
            this.game = args;
            this.app = this.game.app;

            console.log(this.label, '>>> INIT');

            this.on('ready', () => {
                console.log(this.label, '>>> READY');
                resolve(this);
            });

            this.target = toDOM(HighscoreTemplate());

            const scoredPlayers = ksortObjArray(this.game.players.items, 'rank');
            const className = 'rank';
            scoredPlayers.map((player, index) => {
                const rank = createScrambleWords(player.name, className);
                const rankNumber = toDOM(`<div class="rank-number">${player.rank}</div>`);
                const rankScore = toDOM(`<div class="rank-score">${player.score}</div>`);
                rank.querySelector('.parts').prepend(rankNumber);
                rank.querySelector('.parts').append(rankScore);
                rank.setAttribute('data-index', index + 1);
                this.target.append(rank);
            });
            document.querySelector('body').append(this.target);

            const animationA = this.app.anime
                .timeline({
                    loop: false
                })
                .add({
                    targets: `[data-scramble="title"]${className ? '.' + className : ''} .rank-number`,
                    filter: ['blur(12px)', 'blur(0)'],
                    opacity: [0, 1],
                    translateZ: [300, 0],
                    duration: 250,
                    delay: (el, i) => 100 * i
                })
                .add({
                    targets: `[data-scramble="title"]${className ? '.' + className : ''} .rank-score`,
                    filter: ['blur(12px)', 'blur(0)'],
                    opacity: [0, 1],
                    translateZ: [300, 0],
                    duration: 250,
                    delay: (el, i) => 100 * i
                })
                .add({
                    targets: `[data-scramble="title"]${className ? '.' + className : ''} .part`,
                    translateY: ["1.4em", 0],
                    translateZ: 0,
                    duration: 750,
                    delay: (el, i) => 250 * i,
                    changeComplete: () => {
                        this.emit('ready');
                    }
                });

            this.buttons = toDOM(HighscoreButtons());
            this.confirmButton = this.buttons.querySelector('button[data-button="confirm"]');
            this.confirmButton.onclick = () => {
                console.log('>>>>>>>>>> NEW GAME');
                this.game.emit('new');
            };
            this.target.append(this.buttons);

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

}
