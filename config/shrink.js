const
    fs = require('fs-extra'),
    ConfigClass = require('./config.js'),
    spawn = require('child_process').spawn,
    Crypto = require('crypto');

module.exports = class extends ConfigClass {
    constructor() {
        super();

        this.salt = 'erdbeerkuchen';
        this.hash = Crypto.createHash('md5').update(this.salt).digest("hex");

        this.config = {
            mode: 'production',
            target: 'web',
            entry: {
                app: './src/app.js',
            },

            output: {
                filename: './js/[name].js',
                path: `${this.appPath}/dist/shrinked/`,
            },

            resolve: {
                extensions: ['.js', '.css', 'woff2'],
            },

            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: ["@babel/preset-env"]
                            }
                        }
                    },
                    {
                        test: /\.html?$/,
                        loader: "template-literals-loader"
                    },
                    {
                        test: /\.scss$/,
                        use: [
                            'style-loader',
                            {
                                loader: 'file-loader',
                                options: {
                                    name: '[name].css',
                                    outputPath: '../../dist/shrinked/css/'
                                }
                            },
                            'extract-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    sourceMap: false,
                                },
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sourceMap: false,
                                },
                            },
                        ],
                    },
                    {
                        test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                        use: 'base64-inline-loader'
                    }
                ],
            },

            plugins: [
                {
                    apply: (compiler) => {
                        compiler.hooks.afterEmit.tap('Complete', (compilation) => {
                            console.log('>>> HOOKED');

                            fs.copySync(`${this.appPath}/public/`, `${this.appPath}/dist/shrinked`);
                            fs.copySync(`${this.appPath}/dist/shrinked`, `${this.appPath}/docs`);

                            sedReplace('/css', '/neo-quizzner/css', `${this.appPath}/docs/css/app.css`);
                            sedReplace('/images', '/neo-quizzner/images', `${this.appPath}/docs/css/app.css`);
                            sedReplace('?hash', `?${this.hash}`, `${this.appPath}/docs/index.html`);
                            sedReplace('debug: true', 'debug: false', `${this.appPath}/docs/index.html`);

                            let html = fs.readFileSync(`${this.appPath}/public/shrinked.html`).toString();
                            const script = fs.readFileSync(`${this.appPath}/docs/js/app.js`).toString();
                            //sedReplace('<%SCRIPT%>', script, `${this.appPath}/docs/shrinked.html`);

                            const style = fs.readFileSync(`${this.appPath}/docs/css/app.css`).toString();
                            //sedReplace('<%STYLE%>', style, `${this.appPath}/docs/shrinked.html`);
                            html = html.replace(/<%SCRIPT%>/, script).replace(/<%STYLE%>/, style);
                            fs.writeFileSync(`${this.appPath}/docs/shrinked.html`, html);

                        });
                    }
                }
            ]
        };
        return this.mergeConfig();
    };
};

const sedReplace = (replaceFrom, replaceTo, replaceFile) => {
    const replaceCommand = `s#${replaceFrom}#${replaceTo}#g`;
    const spawnOptions = [
        '-i',
        replaceCommand,
        replaceFile
    ];
    setTimeout(() => {
        const proc = spawn('sed', spawnOptions);
        proc.on('error', (err) => {
            console.error('>>> ERROR', err);
        });
        proc.stdout.on('data', (data) => {
            console.log(data.toString());
        });
        proc.stderr.on('data', (data) => {
            console.log(data.toString());
        });
    }, 2000);
};
