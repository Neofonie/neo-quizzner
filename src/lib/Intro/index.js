import Module from '../../Module.js';
import IntroTemplate from './templates/Intro.html';
import CategoryTemplate from './templates/Category.html';

export default class extends Module {
    constructor(args) {
        super();
        return new Promise((resolve, reject) => {
            this.label = 'INTRO';
            this.app = args;
            console.log(this.label, '>>> INIT');

            this.on('ready', () => {
                console.log(this.label, '>>> READY');
                resolve(this);
            });

            this.app.on('get-categories', (() => {
                console.log('>>>> FROM INTRO - GETTING ALL QUESTIONS');
                this.categories.classList.add('loading');
            }));
            this.app.on('got-categories', (categories => {
                console.log('>>>> FROM INTRO - ALL CATEGORIES LOADED');
                this.drawCategories(categories);
            }));

            this.app.on('got-questions', (categories => {
                console.log('>>>> FROM INTRO - ALL QUESTIONS LOADED');
                this.categories.classList.remove('loading');
                this.categories.classList.add('loaded');
            }));

            this.app.on('get-category-questions', (category => {
                console.log('>>>> FROM INTRO - GETTING ONE CATEGORY QUESTIONS', category.name);
                this.categories.querySelector(`[data-category="${category.name}"]`).classList.add('loading');
            }));
            this.app.on('got-category-questions', (category => {
                console.log('>>>> FROM INTRO - ONE CATEGORY QUESTIONS LOADED', category.name);
                const target = this.categories.querySelector(`[data-category="${category.name}"]`);
                target.classList.remove('loading');
                target.classList.add('loaded');
                target.innerHTML += `(${category.questions.length})`;
                this.app.sound.play('plip');
            }));

            this.target = toDOM(IntroTemplate({
                scope: {
                    pageTitle: 'quizzner'
                }
            }));
            document.querySelector('body').append(this.target);
            this.categories = this.target.querySelector('#loading-categories');

            this.emit('ready');
        });
    }

    drawCategories(categories) {
        categories.items.map(category => {
            const element = toDOM(CategoryTemplate({
                scope: {
                    name: category.name
                }
            }));
            this.categories.append(element);
        });
    }

    remove() {
        this.target.remove();
    }
}
