import Module from '../../Module.js';
import Category from './Category.js';

export default class extends Module {
    constructor(args) {
        super();
        return new Promise((resolve, reject) => {
            this.label = 'CATEGORIES';
            console.log(this.label, '>>> INIT');
            this.app = args.app;
            this.data = args.data;

            this.url = this.app.options.categoriesUrl;

            this.on('ready', () => {
                console.log(this.label, '>>>', 'GOT ALL CATEGORIES AND QUESTIONS', this.items);
                this.app.emit('got-questions', this);
                resolve(this);
            });

            this.on('get', () => {
                console.log(this.label, '>>>', 'GET CATEGORIES');
                this.app.emit('get-categories', this);
            });
            this.on('got', () => {
                console.log(this.label, '>>>', 'GOT CATEGORIES', this.items.map(i => i.name));
                this.app.emit('got-categories', this);
            });

            this.get().then(() => {
                return this.getAllQuestions();
            }).then(() => {
                this.emit('ready');
            });
        });
    }

    get() {
        this.emit('get');
        return this.fetch(this.url)
            .then(csvCategories => {
                let rows = csvCategories.split(/\n/);

                rows.map(row => {
                    const match = row.match(new RegExp(/"([^"]+)"/gi));
                    if (match)
                        match.map(i => {
                            const temp = i.replace(/,/gi, '####');
                            row = row.replace(i, temp);
                        });
                    const split = row.split(',').map(i => i.replace(/####/gi, ',').replace(/"/gi, ''));

                    this.items.push(new Category({
                        app: this.app,
                        data: this.data,
                        options: {
                            name: split[0],
                            url: split[1]
                        }
                    }));
                });
                this.emit('got');
            });
    }

    getAllQuestions(index) {
        if (!index)
            index = 0;

        const category = this.items[index];
        if (!category)
            return Promise.resolve();

        return category.getQuestions().then(() => {
            return this.getAllQuestions(index + 1);
        });
    }

    fetch(url) {
        return this.data.fetch(url);
    }
}
