# Neofonie Quizzner
 
![alt text](../master/public/screenshots/neo-quizzner_01.png?raw=true "Neofonie Quizzner #1")

[![Build Status](https://travis-ci.org/Neofonie/neo-quizzner.svg?branch=master)](https://travis-ci.org/Neofonie/neo-quizzner) 

This is a simple and pure javascript quiz-machine. Written in ECMA Script 6.  
Feed the quizzner with csv web exports from google sheets. 

## Usage

#### 1. install

Node 12 needed.

```
git clone https://github.com/Neofonie/neo-quizzner.git
cd neo-quizzner
npm install
```

#### 2. start local dev server

Open the url: **[http://localhost:8000](http://localhost:8000)**

```
npm run dev
```

#### 3. make build

Create some distribution files in: `/dist` and copy it to `/docs`  

```
npm run build
```

The Difference between the `/dist` and the `/docs` folder are the different url paths in the css files.
The `/docs` folder is only for github pages.



## The CSV Data from Google Sheets
- go to google sheets (Tabellen) and create a new one
- use the first tab (is selected on the bottom of the editor) for the category and tab index.
The index has three columns: `category label`, `tab url` and a `description` 
- create a tab for a category with this columns: `question` one time at first (column 0),
`answer, is correct` (column 1 & 2) as repeated pair per answer (3 & 4, 5 & 6 ...).
- dont leave empty one `is correct` cell per row.
that means if anything is in the cell, the answer is the right one.
Or you can put the resolution in this cell.
- go to the index tab, go to -> `File (Datei)` -> export web (im Web veröffentlichen)
- chose at "Link" the name of your index tab
- chose "Embed (Einbetten)" Comma Seperated Values - CSV (kommagetrennte Werte CSV)
- check all tabs you want at "published content" (Veröffentlichte Inhalte und Einstellungen)
- check "auto publish" (Automatisch neu veröffentlichen, wenn Änderungen vorgenommen wurden)
- repeat the last five steps for any category tab
- after a category tab was created, publish the tab and enter the `tab url` in a new row in the index tab.
- the `index tab url` (and all other tab urls) looks like
  ```
  https://docs.google.com/spreadsheets/.../pub?gid=2114668796&single=true&output=csv
  ```
  
## Configure
to configure the `index tab url` for the categories index, give the url as option `categoriesUrl` at the beginning:

- ***`categoriesUrl`***  
  is the url for main csv that contains the categories with urls to their csv

- ***`translationsUrl`***  
  is the url for the translations csv
  
- ***`rounds`***  
  the round selection
  
- ***`skipSetup`***  
  use the `setup` field as preset
  
- ***`setup`***  
  a preset for categories, players and rounds. use it with the `skipSetup = true`

- ***`setup.categories`***  
  a selection as array with existing category names `['Natur', 'Frontend']`
 
- ***`setup.players`***  
  a selection as array with player names `['Mechthild', 'Walter']`
   
- ***`setup.rounds`***  
  how many rounds as int.
  
- ***`scoring`***  
  how to calculate the score

- ***`scoring.correct`***  
  points for a correct answer
  
- ***`scoring.correctMinusPerFail`***  
  this value, multiplied with the number of wrong answers from all players will be subtracted from `scoring.correct`

- ***`scoring.wrong`***  
  minus this for a wrong answer for the first wrong answer. the second wrong answered player get this twice, the third wrong answer get it three times.

- ***`debug`***  
  is always off in production.
  
 ## Configure via url get parameters
 
 add `?field=value&other=value` to the url to give different options.  
 
 For example:
 - [https://neofonie.github.io/neo-quizzner/?skipSetup=true](https://neofonie.github.io/neo-quizzner/?skipSetup=true)
 - [https://neofonie.github.io/neo-quizzner/?debug=true](https://neofonie.github.io/neo-quizzner/?debug=true)
 - [With many options:](https://neofonie.github.io/neo-quizzner/?debug=true&skipSetup=true&setup[players][]=Me,%20myself%20and%20i&setup[rounds]=6)  
 ```
 ?debug=true&skipSetup=true&setup[players][]=Me,%20myself%20and%20i&setup[rounds]=6
 ```
 useful for testing or secret instances with different category index. for example.  
 For nested options: `setup[players][]=Me&setup[players][]=You`
 
 ## index.html 
  ```
  <script type="module">
      const options = {
          categoriesUrl : 'https://docs.google.com/spreadsheets/.../pub?gid=2114668796&single=true&output=csv',
          translationsUrl : 'https://docs.google.com/spreadsheets/.../pub?gid=192674322&single=true&output=csv',
          rounds: [6, 12, 18, 24],
          skipSetup: false,
          setup: {
              players: ['Matze', 'Horst', 'Marie', 'Holger'],
              categories: ['Natur'],
              rounds: 3
          },
          scoring: {
              correct: 1000,
              correctMinusPerFail: 200,
              wrong: 500
          },
          debug: true
      };
  
      new QUIZZNER(options).then(quizzner => {
          window.QUIZZNER = quizzner;
          console.log('>>> ZACK FEDDICH. QUIZZNER READY');
      });
  </script>
  ```


## License

```
The MIT License (MIT)

Copyright (c) 2018 Neofonie GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
