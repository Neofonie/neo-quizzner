import Module from '../../Module.js';
import Categories from './Categories.js';
import Translations from './Translations.js';

export default class extends Module {
    constructor(args) {
        super();

        return new Promise((resolve, reject) => {
            this.label = 'DATASOURCE';
            console.log(this.label, '>>> INIT');
            this.app = args;

            this.on('ready', () => {
                console.log(this.label, '>>>', 'READY');
                resolve(this);
            });

            new Translations({
                app: this.app,
                data: this
            }).then(translations => {
                this.translations = translations;
                return new Categories({
                    app: this.app,
                    data: this
                });
            }).then(categories => {
                this.categories = categories;
                this.emit('ready');
            });
        });
    }

    fetch(url) {
        const requestOptions = {
            method: 'GET'
        };
        return fetch(url, requestOptions)
            .then(response => {
                if (!response.ok)
                    return Promise.reject(response.statusText);

                return response.text();
            })
            .then(csv => {
                if (csv) {
                    return csv;
                }
            });
    }

}
