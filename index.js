'use strict';

var _ = require('lodash');

var path = require('path');
var utils = require('loader-utils');
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var attributeParser = require('./lib/attribute-parser');

function resolveFlags() {
    var argsLength = arguments.length;
    for (var i = 0; i < argsLength; i++) {
        if (arguments[i] === true) {
            return true;
        } else if (arguments[i] === false) {
            return false;
        }
    }
}

function resolveModule(modulePath) {
    return require.resolve(modulePath);
}

function templateSettingsToRegex(obj, keys) {
    return _.mapValues(_.pick(obj, keys), function(value) {
        return new RegExp(value, 'g');
    });
}

function lodashTemplateLoader(content, map) {
    // Query parameters
    var params = utils.parseQuery(this.query);

    /**
     * # Configuration options
     *
     * Interpret configuration by combining query params and `lodashTemplateLoader` options
     */

    var options = this.options.lodashTemplateLoader || {};
    if (_.isFunction(options)) {
        options = options.call(this, this) || {};
    }

    if (params.pack && options[params.pack]) {
        options = options[params.pack];
    } else if (options.defaults) {
        options = options.defaults;
    }

    // Caching
    if (this.cacheable && !options.noCache) {
        this.cacheable();
    }

    // Source map
    if (!map && (this.sourceMap || params.sourceMap || options.sourceMap)) {
        var sourceMapGenerator = new SourceMapGenerator({
            file: this.resourcePath,
        });
        sourceMapGenerator.setSourceContent(this.resourcePath, content);
        sourceMapGenerator.addMapping({
            source: this.resourcePath,
            original: {line: 1, column: 0},
            generated: {line: 1, column: 0},
        });
        map = sourceMapGenerator.toString();
    }

    // Template engine
    var globalLodash = resolveFlags(params.globalLodash, options.globalLodash, false);
    var engine = params.engine || options.engine;
    var hasLodash = globalLodash || engine;

    // Include `_.escape`
    var templateEscape = resolveFlags(params.templateEscape, options.templateEscape, true);

    // Use template imports
    var imports = params.imports || options.imports;
    var importsModule = params.importsModule || options.importsModule;
    if (!imports) {
        if (importsModule) {
            imports = 'require(\'' + importsModule + '\')';
        } else if (hasLodash && engine !== 'underscore') {
            imports = '(typeof _ !== \'undefined\') ? _.templateSettings.imports : {}';
        }
    }

    // Save template settings
    var previousTemplateSettings = _.templateSettings;

    // Apply template settings
    _.templateSettings = _.defaults(
        templateSettingsToRegex(params, ['interpolate', 'escape', 'evaluate']),
        templateSettingsToRegex(options, ['interpolate', 'escape', 'evaluate']),
        _.pick(params, 'variable'),
        _.pick(options, 'variable'),
        _.templateSettings
    );

    // Apply template variable
    _.isUndefined(options.variable) || (_.templateSettings.variable = options.variable);
    _.isUndefined(params.variable) || (_.templateSettings.variable = params.variable);

    // Prepend an HTML comment with the filename in it
    var prependFilenameComment = params.prependFilenameComment || options.prependFilenameComment;
    if (prependFilenameComment) {
        var filenameRelative = path.relative(prependFilenameComment, this.resource);
        content = '<!-- ' + filenameRelative + ' -->\n' + content;
    }

    /**
     * ## Attributes
     *
     * Setting attributes allows Webpack loaders to operate on certain tag attributes to parse
     * external resources, such as URLs in image tags.
     */
    var attributes = resolveFlags(params.attributes, options.attributes, true) ? params.attributes || options.attributes || ['img:src'] : [];
    if (_.isString(attributes)) {
        attributes = attributes.replace(/\s/g, '').split(',');
    }

    var parseDynamicRoutes = resolveFlags(params.parseDynamicRoutes, options.parseDynamicRoutes, false);
    var attributesContext = attributeParser(content, function(tag, attr) {
        return attributes.indexOf(tag + ':' + attr) !== -1;
    }, 'ATTRIBUTE', params.root || options.root, parseDynamicRoutes);
    content = attributesContext.replaceMatches(content);

    /**
     * # Generate module output
     *
     * Start with the Lodash template, then transform that to the desired output, defining any
     * local variables necessary for the template, and finally exporting the module.
     */
    var templateSource = _.template(content).source;

    // Restore previous templateSettings
    _.templateSettings = previousTemplateSettings;

    // Resolve attributes
    templateSource = attributesContext.resolveAttributes(templateSource);

    // Start builting the module output
    var sourcePieces = [];

    // If we define an `engine`, assign it to `_` locally
    if (engine) {
        sourcePieces.push('var _ = require(\'' + engine + '\')');
    }

    // If we don't have `_` and want to escape text, define `_.escape`
    if (!hasLodash && templateEscape) {
        sourcePieces.push('var _ = {escape:require(\'' + resolveModule('lodash/escape') + '\')};');
    }

    // Template imports
    if (imports) {
        if (hasLodash) {
            sourcePieces.push(
                'var _imports = ' + imports + ';',
                'var _keys = _.keys;',
                'var _values = _.values'
            );
        } else {
            this.addDependency('lodash/keys');
            this.addDependency('lodash/values');
            sourcePieces.push(
                'var _imports = ' + imports + ';',
                'var _keys = require(\'' + resolveModule('lodash/keys') + '\');',
                'var _values = require(\'' + resolveModule('lodash/values') + '\');'
            );
        }
        sourcePieces.push('module.exports = Function(_keys(_imports), \'return \' + ' + templateSource + '.toString()).apply(undefined, _values(_imports));');
    } else {
        sourcePieces.push('module.exports = ' + templateSource + ';');
    }

    this.callback(null, sourcePieces.join('\n'), map);
}

module.exports = lodashTemplateLoader;
