var path = require('path');

module.exports = {
    target:  'node',
    context: __dirname,
    output:  {
        path: path.join(__dirname, '..', 'build'),
        filename: '[name].js',
    },
    module: {
        loaders: [{
            test: /(\.raw\.html|\.txt)$/,
            loader: 'raw',
        }, {
            test: /(\.jpg|\.gif|\.png)$/,
            loader: 'file?context=test/templates&name=[path][name].[ext]?[hash]',
        }, {
            test: /(\.tpl|\.html)$/,
            loader: path.join(__dirname, '../'),
        }],
    },
    lodashTemplateLoader: function() {
        return {
            defaults: {},
            noCache: {
                noCache: true,
            },
            enableGlobalLodash: {
                globalLodash: true,
            },
            engineLodash: {
                engine: 'lodash',
            },
            engineUnderscore: {
                engine: 'underscore',
            },
            disableTemplateEscape: {
                templateEscape: false,
            },
            imports: {
                imports: JSON.stringify({
                    test: 'they only live to get radical',
                }),
            },
            importsModule: {
                importsModule: path.join(__dirname, 'custom-imports'),
            },
            templateSettings: {
                interpolate: '\\{\\[(.+?)\\]\\}',
                escape: '\\{\\{(.+?)\\}\\}',
                evaluate: '\\{%([\\s\\S]+?)%\\}',
            },
            variableData: {
                variable: 'data',
            },
            prependFilenameComment: {
                prependFilenameComment: __dirname,
            },
            customAttributes: {
                attributes: ['div:data-img-src'],
            },
            attributesRoot: {
                root: '.',
            },
            attributesParseDynamicRoutes: {
                root: '/assets/img',
                parseDynamicRoutes: true,
            },
        };
    },
};
