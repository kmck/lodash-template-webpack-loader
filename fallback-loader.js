/* This loader returns the filename if no loader takes care of the file */
'use strict';

var loaderUtils = require('loader-utils');

function fallbackLoader(content) {
    if (this.cacheable) {
        this.cacheable();
    }

    var query = this.query instanceof Object ? this.query : loaderUtils.parseQuery(this.query);

    var allLoadersButThisOne = this.loaders.filter(function(loader) {
        return loader.module !== fallbackLoader;
    });

    // This loader shouldn't kick in if there is any other loader
    if (allLoadersButThisOne.length > 0) {
        return content;
    }

    return 'module.exports = ' + JSON.stringify(query.url);
}

module.exports = fallbackLoader;
