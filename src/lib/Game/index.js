import Module from '../../Module.js';
import Setup from './Setup.js';
import Players from './Players.js';
import Rounds from './Rounds.js';
import Highscore from './Highscore.js';

export default class extends Module {
    constructor(args) {
        super();
        return new Promise((resolve, reject) => {
            this.label = 'GAME';
            this.app = args;

            console.log(this.label, '>>> INIT');

            this.on('ready', () => {
                console.log(this.label, '>>> READY');
                resolve(this);

                this
                    .new()
                    .then(() => {
                        return this.run();
                    })
                    .then(() => {
                        console.log('>>>', this.label, 'GAME OVER');
                        this.emit('game-over');
                    });
            });

            this.on('hit', player => this.hit(player));

            this.on('new', () => {
                console.log('>>> JUST RELOAD THE PAGE ;)');
                window.location.reload();
            });

            this.emit('ready');
        });
    }

    new() {
        return wait(2000)
            .then(() => {
                if (this.app.options.skipSetup) {
                    return Promise.resolve(this.app.options.setup);
                } else {
                    return this.setup();
                }
            })
            .then(setup => {
                this.setup = setup;
                console.log('>>>', this.label, 'SETUP COMPLETE:', this.setup.players, this.setup.categories, this.setup.rounds);
                return this.text(_('game.letsgo'));
            })
            .then(() => {
                return new Players(this);
            })
            .then(players => {
                this.players = players;
                this.players.lock();
                return new Rounds(this);
            })
            .then(rounds => {
                this.rounds = rounds;
                return Promise.resolve();
            });
    }

    setup() {
        return new Setup(this);
    }

    run() {
        return this.oneRound();
    }

    oneRound(index) {
        if (!index)
            index = 0;

        if (index === this.setup.rounds) {
            return this.finish();
        }

        this.round = index;

        return this
            .ask(index)
            .then(() => { // repeat it here
                return this.oneRound(index + 1);
            });
    }

    ask(index) {
        return new Promise(resolve => {
            console.log('>>>>>> ASKING', index + 1, `(${index})`, 'OF', this.setup.rounds);
            this.players.lock(true);
            this.getRandomCategory();
            this.getRandomQuestion();
            this.players.unlockPlayers();

            this
                .text(`${_('game.round')} ${index + 1}`)
                .then(() => {
                    return this.textQuestion(); // the question !!!!!!!!!1111
                })
                .then(() => {  // the anwers !!!!
                    return this.textAnswers();
                })
                .then(() => {
                    this.players.unlock();

                    // the wrong answer
                    if (this.wrongListener)
                        this.event.removeListener('wrong', this.wrongListener);

                    this.wrongListener = number => {
                        console.log('>>> WRONG NUMBER', number, this.event);

                        if (this.players.allLocked()) {
                            this
                                .away()
                                .then(() => {
                                    return this.text(_('game.all_locked'));
                                })
                                .then(() => {
                                    resolve();
                                });
                        } else {
                            //this.text(_('game.wrong_answer'));
                        }
                    };
                    this.on('wrong', this.wrongListener);

                    // the correct answer
                    if (this.correctListener)
                        this.event.removeListener('correct', this.correctListener);

                    this.correctListener = number => {
                        console.log('>>> CORRECT NUMBER', number, this.event);
                        this
                            .away()
                            .then(() => {
                                return this.text(_('game.correct_answer'));
                            })
                            .then(() => {
                                resolve();
                            });
                    };
                    this.on('correct', this.correctListener);
                });
        });
    }

    away() {
        document.querySelector('.answers').classList.add('away');
        const animation = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                delay: 2000
            })
            .add({
                targets: `[data-scramble="title"] .part`,
                opacity: 0,
                filter: 'blur(10px)',
                translateZ: 0,
                duration: 500,
                delay: (el, i) => 50 * i,
                changeComplete: () => {
                    if (document.querySelector('[data-scramble="title"]')) {
                        document.querySelector('[data-scramble="title"]').remove();
                        document.querySelector('.answers').remove();
                    }
                }
            });

        return animation.finished;
    }

    finish() {
        return new Promise(resolve => {
            console.log('>>>>>> FINISHED', this.setup.rounds);
            // @TODO make another, fancier end animation
            this.rounds.away();
            this
                .text(`${_('game.finish')}`)
                .then(() => {
                    return this.players.away();
                })
                .then(() => {
                    return this.text(`${_('game.highscore')}`);
                })
                .then(() => {
                    return new Highscore(this);
                })
                .then(highscore => {
                    this.highscore = highscore;
                    resolve();
                });
        });
    }

    highscore() {
        const scoredPlayers = ksortObjArray(this.players.items, 'rank');
        console.log('>>>>>>>> SCORED PLAYER', scoredPlayers);
        const target = toDOM('<div class="highscore"></div>');
        const className = 'rank';
        scoredPlayers.map((player, index) => {
            const rank = createScrambleWords(player.name, className);
            const rankNumber = toDOM(`<div class="rank-number">${player.rank}</div>`);
            const rankScore = toDOM(`<div class="rank-score">${player.score}</div>`);
            rank.querySelector('.parts').prepend(rankNumber);
            rank.querySelector('.parts').append(rankScore);
            rank.setAttribute('data-index', index + 1);
            target.append(rank);
        });
        document.querySelector('body').append(target);

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
                delay: (el, i) => 250 * i
            });

        return Promise.all([
            animationA.finished
        ]);
    }

    hit(player) {
        console.log('>>> !!! <<<', player.name);
    }

    text(text, stay, className) {
        const target = createScrambleWords(text);
        document.querySelector('body').append(target);

        const readDelay = text.length * 150;
        const animation = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: `[data-scramble="title"] .part${className ? ' .' + className : ''}`,
                translateY: ["1.4em", 0],
                translateZ: 0,
                duration: 750,
                delay: (el, i) => 250 * i
            })
            .add({
                delay: readDelay
            });

        if (!stay) {
            animation.add({
                targets: `[data-scramble="title"] .part`,
                opacity: 0,
                filter: 'blur(10px)',
                translateZ: 0,
                duration: 500,
                delay: (el, i) => 50 * i,
                changeComplete: () => {
                    target.remove();
                }
            });
        }
        return animation.finished;
    }

    textQuestion() {
        const text = this.question.text;
        const className = 'question';
        const target = createScrambleWords(text, className);
        document.querySelector('body').append(target);

        const animation = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: `[data-scramble="title"]${className ? '.' + className : ''} .part`,
                translateY: ["1.4em", 0],
                translateZ: 0,
                duration: 750,
                delay: (el, i) => 250 * i
            })
            .add({
                targets: `[data-scramble]${className ? '.' + className : ''}`,
                translateY: [0, -200],
                duration: 500,
                delay: (el, i) => 50 * i
            });

        return animation.finished;
    }

    textAnswers() {
        const className = 'answer';
        const target = toDOM('<div class="answers"></div>');
        this.question.answer.map((i, index) => {
            const question = createScrambleWords(i.text, className);
            question.setAttribute('data-index', index + 1);
            target.append(question);
        });
        document.querySelector('body').append(target);

        const animationA = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: `[data-scramble="title"]${className ? '.' + className : ''}`,
                filter: ['blur(12px)', 'blur(0)'],
                duration: 250,
                delay: (el, i) => 100 * i
            })
            .add({
                targets: `[data-scramble="title"]${className ? '.' + className : ''} .part`,
                translateY: ["1.4em", 0],
                translateZ: 0,
                duration: 750,
                delay: (el, i) => 250 * i
            });

        return Promise.all([
            animationA.finished
        ]);
    }

    getRandomCategory() {
        const rand = randomInt(0, this.setup.categories.length - 1);
        const categoryName = this.setup.categories.filter((i, index) => index === rand)[0];
        this.category = this.app.data.categories.items.filter(i => i.name === categoryName)[0];
        console.log('>>> GET RANDOM CATEGORY', rand, this.setup.categories.length, this.category);
    }

    getRandomQuestion() {
        const rand = randomInt(0, this.category.questions.length - 1);
        this.question = this.category.questions.filter((i, index) => index === rand)[0];
        console.log('>>> GET RANDOM QUESTION', rand, this.category.questions.length, this.question);
    }

    get round() {
        return this._round;
    }

    set round(value) {
        this._round = value;
        this.rounds.setRound();
    }
}
