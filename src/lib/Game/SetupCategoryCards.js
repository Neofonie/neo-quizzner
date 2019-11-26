import Module from '../../Module.js';
import SetupCategoryCardsTemplate from "./templates/SetupCategoryCards.html";
import SetupCategoryCardTemplate from "./templates/SetupCategoryCard.html";
import SetupCategoryButtonTemplate from "./templates/SetupCategoryButton.html";

// https://tobiasahlin.com/moving-letters/#6

export default class extends Module {
    constructor(args) {
        super();
        return new Promise(resolve => {
            this.setup = args;
            this.app = this.setup.app;

            this.cards = toDOM(SetupCategoryCardsTemplate());
            this.setup.target.append(this.cards);

            this.app.data.categories.items.map(i => {
                const card = toDOM(SetupCategoryCardTemplate({
                    scope: {
                        name: i.name
                    }
                }));
                card.button = card.querySelector('button');
                card.button.onclick = () => {
                    if (card.button.classList.contains('active')) {
                        card.button.classList.remove('active');
                        card.classList.remove('active');
                    } else {
                        card.button.classList.add('active');
                        card.classList.add('active');
                    }
                    this.checkConfirm();
                };
                card.timeout = false;
                this.cards.append(card);
                this.items.push(card);
            });

            const animation = this.app.anime
                .timeline({
                    loop: false
                })
                .add({
                    targets: '[data-scramble]',
                    translateY: [0, -150],
                    duration: 500,
                    delay: (el, i) => 50 * i
                })
                .add({
                    targets: '.category-card',
                    opacity: [0, 1],
                    scale: [1.1, 1],
                    filter: ['blur(10px)', 'blur(0px)'],
                    duration: 1000,
                    delay: (el, i) => 150 * i
                });

            this.buttons = toDOM(SetupCategoryButtonTemplate());
            this.confirmButton = this.buttons.querySelector('button[data-button="confirm"]');
            this.confirmButton.onclick = () => {
                resolve(this);
            };
            this.selectButton = this.buttons.querySelector('button[data-button="select"]');
            this.selectButton.onclick = () => {
                this.selectButton.classList.add('hidden');
                this.deselectButton.classList.remove('hidden');
                const cards = Array.prototype.slice.call(this.cards.querySelectorAll('.category-card'));
                cards.map(card => card.querySelector('button').classList.add('active'));
                this.checkConfirm();
            };
            this.deselectButton = this.buttons.querySelector('button[data-button="deselect"]');
            this.deselectButton.onclick = () => {
                this.deselectButton.classList.add('hidden');
                this.selectButton.classList.remove('hidden');
                const cards = Array.prototype.slice.call(this.cards.querySelectorAll('.category-card'));
                cards.map(card => card.querySelector('button').classList.remove('active'));
                this.checkConfirm();
            };
            this.setup.target.append(this.buttons);
            setTimeout(() => this.cards.classList.add('active'), 100);
        });
    }

    checkConfirm() {
        const cards = Array.prototype.slice.call(this.cards.querySelectorAll('.category-cards button.active'));
        this.categories = cards.map(i => i.innerHTML.trim());
        cards.length > 0 ? this.confirmButton.disabled = false : this.confirmButton.disabled = true;
    }

    away() {
        const animationA = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: '.category-card:not(.active)',
                opacity: [1, 0],
                scale: [1, 1.4],
                translateX: () => randomInt(-100, 100),
                translateY: () => randomInt(-100, 100),
                filter: ['blur(0px)', 'blur(10px)'],
                duration: 1000,
                delay: (el, i) => 150 * i,
                easing: 'easeInOutExpo'
            });

        const animationB = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                delay:1000
            })
            .add({
                targets: '.category-card.active',
                opacity: [1, 0],
                scale: [1, 3],
                filter: ['blur(0px)', 'blur(10px)'],
                translateX: () => randomInt(-100, 100),
                translateY: () => randomInt(-100, 100),
                duration: 1000,
                delay: (el, i) => 150 * i,
                easing: 'easeInOutExpo',
                changeComplete: () => {
                    this.setup.target.querySelector('.category-cards').remove();
                }
            });

        const animationC = this.app.anime
            .timeline({
                loop: false
            })
            .add({
                targets: '[data-scramble="title"] .part',
                opacity: 0,
                filter: 'blur(10px)',
                translateZ: 0,
                duration: 10,
                delay: (el, i) => 20 * i,
                easing: 'easeOutExpo',
                changeComplete: () => {
                    document.querySelector('[data-scramble="title"]').remove();
                }
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

//        return animationA.finished;
    }
}
