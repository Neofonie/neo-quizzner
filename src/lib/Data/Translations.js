import Module from '../../Module.js';

export default class extends Module {
    constructor(args) {
        super();
        return new Promise((resolve, reject) => {
            this.label = 'TRANSLATIONS';
            this.app = args.app;
            this.data = args.data;
            this.url = this.app.options.translationsUrl;
            this.language = this.app.options.language;

            console.log(this.label, '>>> INIT');

            this.on('ready', () => {
                console.log(this.label, '>>>', 'READY');
                resolve(this);
            });

            this.on('get', () => {
                console.log(this.label, '>>>', 'GET TRANSLATIONS');
                this.app.emit('get-translations', this);
            });
            this.on('got', () => {
                console.log(this.label, '>>>', 'GOT TRANSLATIONS', this.items.length);
                this.app.emit('got-translations', this);
            });

            // make the translate function global
            window._ = (key, language) => this._(key, language);

            this.get().then(() => {
                this.emit('ready');
            });
        });
    }

    get() {
        this.emit('get');
        return this.fetch(this.url)
            .then(csvTranslations => {
                let rows = csvTranslations.split(/\n/);
                rows.map(row => {
                    const match = row.match(new RegExp(/"([^"]+)"/gi));
                    if (match)
                        match.map(i => {
                            const temp = i.replace(/,/gi, '####');
                            row = row.replace(i, temp);
                        });
                    const split = row.split(',').map(i => i.replace(/####/gi, ',').replace(/"/gi, '').trim());
                    let translation = {
                        key: split[0]
                    };
                    ['en', 'de', 'pl', 'fr', 'es', 'ru'].map((i, index) => {
                        split[index + 1] ? translation[i] = split[index + 1] : null;
                    });
                    this.items.push(translation);
                });
                this.emit('got');
            });
    }

    fetch(url) {
        return this.data.fetch(url);
    }

    _(key, language = 'de') {
        if (!language)
            language = this.language;

        if (!key)
            return 'no key';

        const row = this.items.filter(i => i.key === key)[0];
        if(row)
            return row[language];

        return `key: ${key} not found`;
    }
}
