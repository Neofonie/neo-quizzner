import Module from '../../Module.js';
import SetupRoundCardsTemplate from "./templates/SetupRoundCards.html";
import SetupRoundCardTemplate from "./templates/SetupRoundCard.html";
import SetupRoundButtonTemplate from "./templates/SetupRoundButton.html";

// https://tobiasahlin.com/moving-letters/#6

export default class extends Module {
    constructor(args) {
        super();
        return new Promise(resolve => {
            this.setup = args;
            this.app = this.setup.app;

            this.cards = toDOM(SetupRoundCardsTemplate());
            this.setup.target.append(this.cards);

            this.roundsPreset = this.app.options.rounds || [12, 24, 36, 48];

            this.roundsPreset.map(i => {
                const card = toDOM(SetupRoundCardTemplate({
                    scope: {
                        name: i
                    }
                }));
                card.button = card.querySelector('button');
                card.button.onclick = () => {
                    if (card.button.classList.contains('active')) {
                        card.button.classList.remove('active');
                    } else {
                        const buttons = Array.prototype.slice.call(this.cards.querySelectorAll('.round-card .active'));
                        if (buttons.length > 0) {
                            console.log('>>>>', buttons);
                            buttons.map(b => b.classList.remove('active'));
                        }
                        card.button.classList.add('active');
                    }
                    this.checkConfirm();
                };
                this.cards.append(card);
                this.items.push(card);
            });

            const animation = this.app.anime
                .timeline({
                    loop: false
                })
                .add({
                    targets: '.round-card',
                    opacity: [0, 1],
                    scale: [1.1, 1],
                    filter: ['blur(10px)', 'blur(0px)'],
                    duration: 1000,
                    delay: (el, i) => 150 * i
                });

            this.buttons = toDOM(SetupRoundButtonTemplate());
            this.confirmButton = this.buttons.querySelector('button[data-button="confirm"]');
            this.confirmButton.onclick = () => {
                this.rounds = parseInt(this.cards.querySelector('.round-cards .active').innerHTML);
                resolve(this);
            };
            this.setup.target.append(this.buttons);
            setTimeout(() => this.cards.classList.add('active'), 100);
        });
    }

    checkConfirm() {
        const cards = Array.prototype.slice.call(this.cards.querySelectorAll('.round-cards .active'));
        this.rounds = cards.map(i => i.innerHTML.trim());
        cards.length > 0 ? this.confirmButton.disabled = false : this.confirmButton.disabled = true;
    }

    away() {
        const animationA = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: '[data-scramble="title"] .part',
                opacity: 0,
                filter: 'blur(10px)',
                translateZ: 0,
                duration: 1000,
                delay: (el, i) => 20 * i,
                easing: 'easeOutExpo',
                changeComplete: () => {
                    document.querySelector('[data-scramble="title"]').remove();
                }
            });

        const animationB = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: '.round-card',
                opacity: [1, 0],
                scale: [1, 5],
                filter: ['blur(0px)', 'blur(10px)'],
                duration: 1000,
                delay: (el, i) => 150 * i,
                easing: 'easeOutExpo',
                changeComplete: () => {
                    this.setup.target.querySelector('.round-cards').remove();
                }
            });

        const animationC = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: '.buttons',
                opacity: [1, 0],
                filter: ['blur(0px)', 'blur(10px)'],
                duration: 1000,
                delay: (el, i) => 150 * i,
                easing: 'easeOutExpo',
                changeComplete: () => {
                    this.setup.target.querySelector('.buttons').remove();
                }
            });

        return Promise.all([
            animationA.finished,
            animationB.finished,
            animationC.finished
        ]);

    }
}
