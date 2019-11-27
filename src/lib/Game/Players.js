import Module from '../../Module.js';
import Player from './Player.js';
import PlayersTemplate from './templates/Players/index.html';

export default class extends Module {
    constructor(args) {
        super();
        return new Promise((resolve, reject) => {
            this.label = 'PLAYERS';
            this.game = args;
            this.app = this.game.app;
            this.sound = this.app.sound;
            this.locked = false;
            this.locked_ms = 3000;
            this.fails = 0;

            console.log(this.label, '>>> INIT');

            this.on('ready', () => {
                console.log(this.label, '>>> READY');
                resolve(this);
            });

            this.target = toDOM(PlayersTemplate());
            document.querySelector('body').append(this.target);

            this.game.setup.players.map((player, index) => {
                this.items.push(new Player({
                    players: this,
                    name: player,
                    index: index
                }));
            });

            const animation = this.app.anime
                .timeline({
                    loop: false
                })
                .add({
                    targets: '.game-players .game-player',
                    translateY: [200, 0],
                    duration: 500,
                    delay: (el, i) => 200 * i,
                    easing: 'easeOutExpo',
                    changeComplete: () => {
                        this.emit('ready');
                    }
                });

            document.body.addEventListener('keydown', e => this.buzzer(e));
            document.body.addEventListener('keydown', e => this.number(e));

        });
    }

    away() {
        const animation = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: '.game-players .game-player',
                translateY: [0, 250],
                duration: 500,
                delay: (el, i) => 200 * i,
                easing: 'easeInOutExpo',
                changeComplete: () => {
                    this.emit('ready');
                }
            });

        return Promise.all([
            animation.finished
        ]);
    }

    buzzer(e) {
        if (this.locked === false) {
            this.player = this.items.filter(i => i.key === e.key)[0];
            if (!this.player)
                return;

            this.player.buzzer();
        }
    }

    number(e) {
        if (Number.isInteger(e.key * 1)) {
            console.log('>> NUMBER', e.key);
            this.player = this.items.filter(i => i.active)[0];
            if (!this.player)
                return;

            this.player.answer(e.key);
        }
    }

    lock(stay) {
        if (this.locked === true)
            return;

        this.locked = true;

        if (stay === true)
            return;

        this.timeout ? clearTimeout(this.timeout) : null;
        this.timeout = setTimeout(() => {
            this.unlock();
        }, this.locked_ms);
    }

    unlock() {
        this.locked = false;
        this.items.map(player => player.blur());
        this.game.rounds.buzzOff();
        this.sound.emit('stop-music-question');
    }

    unlockPlayers() {
        this.items.map(player => player.unlock());
        this.fails = 0;
    }

    fail() {
        this.fails = this.fails + 1;
    }

    rank() {
        const scoredPlayers = ksortObjArray(this.items, 'score').reverse();
        let latestScore = false;
        let rank = 0;
        scoredPlayers.map((player, index) => {
            player.score !== latestScore ? rank = rank + 1 : null;
            player.rank = rank;
            latestScore = player.score;
        });
        console.log(this.items.map(i => {
            return {name: i.name, score: i.score, rank: i.rank}
        }));
    }

    allLocked() {
        return this.items.filter(i => i.locked).length === this.items.length;
    }
}
