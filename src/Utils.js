/**
 * Wants a valid html string
 * Returns a valid DOM Element Tree
 *
 * @param string
 * @returns {ChildNode}
 */
window.toDOM = string => new DOMParser().parseFromString(string, "text/html").documentElement.querySelector('body').firstChild;

/**
 * Wait for n milliseconds
 * Returns a promise
 *
 * @param ms
 * @returns {Promise<any>}
 */
window.wait = ms => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};

/**
 * Wrap a text, letter by letter, in a usable markup for scrambling
 * Wants a text
 * Returns a DOM element (tree)
 *
 * @param text
 * @returns {ChildNode}
 */
window.createScramble = text => {
    const element = toDOM(`<div data-scramble="title" class="scramble scramble-letters"></div>`);
    element.innerHTML = (`<span class="text-wrapper"><span class="parts">${text}</span></span>`);
    const textWrapper = element.querySelector('.parts');
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='part'>$&</span>");
    return element;
};

/**
 * Wrap a text, word by word, in a usable markup for scrambling
 * Wants a text
 * Returns a DOM element (tree)
 *
 * @param text
 * @returns {ChildNode}
 */
window.createScrambleWords = (text, className) => {
    const words = text.split(/ /g);
    const element = toDOM(`<div data-scramble="title" class="scramble scramble-words${className ? ' ' + className : ''}"><span class="text-wrapper"><span class="parts"></span></span></div>`);
    words.map(i => {
        element.querySelector('.parts').append(toDOM(`<span class="part-wrapper"><span class="part">${i}</span></span>`));
    });
    return element;
};

/**
 * Wrap a text, word by word, in a usable markup for scrambling
 * Wants a text
 * Returns a DOM element (tree)
 *
 * @param text
 * @returns {ChildNode}
 */
window.createScrambleWordsQuestion = text => {
    const words = text.split(/ /g);
    const element = toDOM(`<div data-scramble="title" class="scramble scramble-words question"><span class="text-wrapper"><span class="parts"></span></span></div>`);
    words.map(i => {
        element.querySelector('.parts').append(toDOM(`<span class="part-wrapper"><span class="part">${i}</span></span>`));
    });
    return element;
};


window.randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

window.ksortObjArray = (array, key) => {
    const compare = (a, b) => {
        let comparison = 0;
        if (a[key] > b[key]) {
            comparison = 1;
        } else if (a[key] < b[key]) {
            comparison = -1;
        }
        return comparison;
    };
    return array.sort(compare);
};
