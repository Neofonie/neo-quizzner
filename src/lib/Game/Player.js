import Module from '../../Module.js';
import PlayerTemplate from './templates/Players/Player.html';
import {CountUp} from 'countup.js';

export default class extends Module {
    constructor(args) {
        super();
        this.label = 'PLAYER';
        this.players = args.players;
        this.sound = this.players.app.sound;
        this.name = args.name;
        this.index = args.index;
        this.app = this.players.app;
        this.keys = ['q', 'c', 'm', 'p'];
        this.key = this.keys[this.index];
        this.timeout = false;
        this.locked_ms = 3000;
        this.event_delay = 3000;
        this.score = 0;

        this.scoring = this.app.options.scoring || {
            correct: 1000,
            correctMinusPerFail: 200,
            wrong: 500
        };

        console.log(this.label, '>>> INIT', this.name);

        this.on('ready', () => {
            console.log(this.label, '>>> READY');
        });

        this.target = toDOM(PlayerTemplate({
            scope: {
                name: this.name,
                key: this.key,
            }
        }));
        this.players.target.append(this.target);
        this.scoreElement = this.target.querySelector('.game-player-score');

        this.emit('ready');
    }

    buzzer() {
        console.log('>>>', this.label, 'BUZZER', this.name);
        if (this.locked)
            return;

        this.active = true;
        this.players.lock();
        this.players.game.emit('buzzer', this);
        this.sound.emit('player-buzzed');
        this.sound.emit('play-music-question');
    }

    blur() {
        this.active = false;
    }

    answer(number) {
        if (this.number)
            return;

        if (number > this.players.game.question.answer.length)
            return;

        if (!this.number)
            this.number = number;

        setTimeout(() => {
            this.number = false;
        }, this.event_delay);

        const answer = document.querySelectorAll(`.answers .answer`)[number - 1];
        answer.classList.add('active');

        if (this.players.game.question.answer[this.number - 1].correct === true) {
            this.score = this.score + (this.scoring.correct - (this.players.fails * this.scoring.correctMinusPerFail));
            this.sound.emit('player-chose-correct');
            setTimeout(() => this.players.game.emit('correct', number), this.event_delay);
        } else {
            answer.classList.add('wrong');
            this.sound.emit('player-chose-wrong');
            this.lock();
            this.score = this.score - this.players.fails * this.scoring.wrong;
            setTimeout(() => {
                answer.classList.remove('active', 'wrong');
                this.players.game.emit('wrong', number);
            }, 2000);
        }
        this.sound.emit('stop-music-question');
        console.log('>>>', this.label, this.name, 'ANSWERS:', number, this.players.game.question);
    }

    lock() {
        this.locked = true;
        this.players.fail();
    }

    unlock() {
        this.locked = false;
    }

    set active(val) {
        this._active = val;
        this.number = false;
        this.active ? this.target.classList.add('active') : this.target.classList.remove('active');
    }

    get active() {
        return this._active;
    }

    set locked(val) {
        this._locked = val;
        this.locked ? this.target.classList.add('locked') : this.target.classList.remove('locked');
    }

    get locked() {
        return this._locked;
    }

    get score() {
        return this._score;
    }

    set score(val) {
        this._score = val;
        //this.scoreElement ? this.scoreElement.innerHTML = this.score : null;
        if (this.scoreElement) {
            this.scoreCountUp = new CountUp(this.scoreElement, this.score, {
                separator: '.'
            });
            this.players.rank();
            this.scoreCountUp.start();
        }
    }


}
