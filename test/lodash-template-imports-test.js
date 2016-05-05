var _ = require('lodash');
var templateSettingsImports = _.templateSettings.imports;
_.templateSettings.imports = {
    test: 'they only live to get radical',
};
module.exports = function cleanUp() {
    delete require.cache[require.resolve('lodash')];
};
