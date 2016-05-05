var assert = require('chai').assert;
var fs = require('fs');

// Note: This file gets webpacked, so `fileToLoad` must be root-relative!
function loadFile(fileToLoad) {
    return fs.readFileSync(fileToLoad).toString();
}

describe('lodash-template-webpack-loader', function() {

    afterEach(function() {
        delete require.cache[require.resolve('lodash')];
        delete require.cache[require.resolve('underscore')];
    });

    it('loads a basic static text template', function() {
        var template = require('./templates/static.html');
        assert.equal(template(), loadFile('test/output/static.txt'));
    });

    it('loads a basic template with an unescaped string', function() {
        var template = require('./templates/unescaped.html');
        assert.equal(template({test: 'She & Him'}), loadFile('test/output/unescaped.txt'));
    });

    it('loads a basic template with an escaped variable', function() {
        var template = require('./templates/escaped.html');
        assert.equal(template({test: 'She & Him'}), loadFile('test/output/escaped.txt'));
    });

    describe('options', function() {
        describe('globalLodash', function() {
            beforeEach(function() {
                global._ = require('lodash');
            });

            afterEach(function() {
                delete global._;
                delete require.cache[require.resolve('lodash')];
            });

            it('can be enabled via params', function() {
                var template = require('!!../?globalLodash!./templates/lodash.html');
                assert.equal(template(), loadFile('test/output/lodash.txt'));
            });

            it('can be enabled via options', function() {
                var template = require('!!../?pack=enableGlobalLodash!./templates/lodash.html');
                assert.equal(template(), loadFile('test/output/lodash.txt'));
            });

            it('cannot use lodash functions by default', function() {
                var template = require('./templates/lodash.html');
                assert.throws(function() {
                    template();
                });
            });
        });

        describe('engine', function() {
            it('can be enabled via params', function() {
                var template = require('!!../?engine=lodash!./templates/lodash.html');
                assert.equal(template(), loadFile('test/output/lodash.txt'));
            });

            it('can be enabled via options', function() {
                var template = require('!!../?pack=engineLodash!./templates/lodash.html');
                assert.equal(template(), loadFile('test/output/lodash.txt'));
            });

            it('works with underscore', function() {
                var template = require('!!../?pack=engineUnderscore!./templates/lodash.html');
                assert.equal(template(), loadFile('test/output/lodash.txt'));
            });
        });

        describe('templateEscape', function() {
            it('can be disabled via params', function() {
                var template = require('!!../?templateEscape=false!./templates/escaped.html');
                assert.throws(function() {
                    template({test: 'She & Him'});
                });
            });

            it('can be disabled via options', function() {
                var template = require('!!../?pack=disableTemplateEscape!./templates/escaped.html');
                assert.throws(function() {
                    template({test: 'She & Him'});
                });
            });

            it('still escapes when the engine is specified', function() {
                var template = require('!!../?templateEscape=false&engine=lodash!./templates/escaped.html');
                assert.equal(template({test: 'She & Him'}), loadFile('test/output/escaped.txt'));
            });

            it('still escapes when global _ is enabled', function() {
                global._ = require('lodash');
                var template = require('!!../?templateEscape=false&globalLodash!./templates/escaped.html');
                assert.equal(template({test: 'She & Him'}), loadFile('test/output/escaped.txt'));
                delete global._;
            });
        });

        describe('interpolate', function() {
            it('can be set via params', function() {
                var template = require('!!../?interpolate=%5C%7B%5C%5B(.%2B%3F)%5C%5D%5C%7D!./templates/interpolate.html');
                assert.equal(template({
                    test: '<b>bold!</b>',
                }), loadFile('test/output/interpolate.txt'));
            });

            it('can be set via options', function() {
                var template = require('!!../?pack=templateSettings!./templates/interpolate.html');
                assert.equal(template({
                    test: '<b>bold!</b>',
                }), loadFile('test/output/interpolate.txt'));
            });
        });

        describe('escape', function() {
            it('can be set via params', function() {
                var template = require('!!../?escape=%5C%7B%5C%7B(.%2B%3F)%5C%7D%5C%7D!./templates/escape.html');
                assert.equal(template({
                    test: '<b>bold!</b>',
                }), loadFile('test/output/escape.txt'));
            });

            it('can be set via options', function() {
                var template = require('!!../?pack=templateSettings!./templates/escape.html');
                assert.equal(template({
                    test: '<b>bold!</b>',
                }), loadFile('test/output/escape.txt'));
            });
        });

        describe('evaluate', function() {
            it('can be set via params', function() {
                var template = require('!!../?evaluate=%5C%7B%25(%5B%5Cs%5CS%5D%2B%3F)%25%5C%7D!./templates/evaluate.html');
                assert.equal(template(), loadFile('test/output/evaluate.txt'));
            });

            it('can be set via options', function() {
                var template = require('!!../?pack=templateSettings!./templates/evaluate.html');
                assert.equal(template(), loadFile('test/output/evaluate.txt'));
            });
        });

        describe('variable', function() {
            it('can be set via params', function() {
                var template = require('!!../?variable=data!./templates/variable.html');
                assert.equal(template({
                    title: 'Tumblers > Pumpers',
                    body: '<i>Great job!</i>',
                }), loadFile('test/output/variable.txt'));
            });

            it('can be set via options', function() {
                var template = require('!!../?pack=variableData!./templates/variable.html');
                assert.equal(template({
                    title: 'Tumblers > Pumpers',
                    body: '<i>Great job!</i>',
                }), loadFile('test/output/variable.txt'));
            });
        });

        describe('imports', function() {
            it('can be set via params', function() {
                var template = require('!!../?imports=%7B%22test%22%3A%22they%20only%20live%20to%20get%20radical%22%7D!./templates/template-imports.html');
                assert.equal(template(), loadFile('test/output/template-imports.txt'));
            });

            it('can be set via options', function() {
                var template = require('!!../?pack=imports!./templates/template-imports.html');
                assert.equal(template(), loadFile('test/output/template-imports.txt'));
            });

            it('defaults to _.templateSettings.imports when the engine is specified', function() {
                var cleanUpTemplateImports = require('./lodash-template-imports-test');
                var template = require('!!../?engine=lodash!./templates/template-imports.html');
                assert.equal(template(), loadFile('test/output/template-imports.txt'));
                delete require.cache[require.resolve('./lodash-template-imports-test')];
                delete require.cache[require.resolve('!!../?engine=lodash!./templates/template-imports.html')];

                cleanUpTemplateImports();
                assert.throws(function() {
                    var template = require('!!../?engine=lodash!./templates/template-imports.html');
                    assert.equal(template(), loadFile('test/output/template-imports.txt'));
                });
            });

            it('defaults to _.templateSettings.imports when global _ is enabled', function() {
                global._ = require('lodash');
                global._.templateSettings.imports = {
                    test: 'they only live to get radical',
                };
                var template = require('!!../?globalLodash!./templates/template-imports.html');
                assert.equal(template(), loadFile('test/output/template-imports.txt'));
                delete global._;
            });
        });

        describe('importsModule', function() {
            it('can be set via params', function() {
                var template = require('!!../?importsModule=..%2F/custom-imports!./templates/template-imports-module.html');
                assert.equal(template(), loadFile('test/output/template-imports-module.txt'));
            });

            it('can be set via options', function() {
                var template = require('!!../?pack=importsModule!./templates/template-imports-module.html');
                assert.equal(template(), loadFile('test/output/template-imports-module.txt'));
            });

            it('does not take precedence over imports', function() {
                var template = require('!!../?pack=imports&importsModule=..%2F/custom-imports!./templates/template-imports-module.html');
                assert.throws(function() {
                    template();
                });
            });
        });

        describe('prependFilenameComment', function() {
            it('can be set via params', function() {
                var template = require('!!../?prependFilenameComment=./test!./templates/prepend-filename-content.html');
                assert.equal(template(), loadFile('test/output/prepend-filename-content.txt'));
            });

            it('can be set via options', function() {
                var template = require('!!../?pack=prependFilenameComment!./templates/prepend-filename-content.html');
                assert.equal(template(), loadFile('test/output/prepend-filename-content.txt'));
            });
        });

        describe('attributes', function() {
            it('should handle <img src="..."> by default', function() {
                var template = require('./templates/attributes.html');
                assert.equal(template(), loadFile('test/output/attributes.txt'));
            });

            it('can have custom attributes set via params', function() {
                var template = require('!!../?attributes=div:data-img-src!./templates/attributes-custom.html');
                assert.equal(template(), loadFile('test/output/attributes-custom.txt'));
            });

            it('can have custom attributes set via options', function() {
                var template = require('!!../?pack=customAttributes!./templates/attributes-custom.html');
                assert.equal(template(), loadFile('test/output/attributes-custom.txt'));
            });

            it('can be disabled by passing false', function() {
                var template = require('!!../?-attributes!./templates/attributes-disabled.html');
                assert.equal(template(), loadFile('test/output/attributes-disabled.txt'));
            });

            describe('root', function() {
                it('can be set via params', function() {
                    var template = require('!!../?root=.!./templates/attributes-root.html');
                    assert.equal(template(), loadFile('test/output/attributes-root.txt'));
                });

                it('can be set via options', function() {
                    var template = require('!!../?pack=attributesRoot!./templates/attributes-root.html');
                    assert.equal(template(), loadFile('test/output/attributes-root.txt'));
                });
            });

            describe('parseDynamicRoutes', function() {
                it('can be set via params', function() {
                    var template = require('!!../?root=/assets/img&parseDynamicRoutes!./templates/attributes-parse-dynamic-routes.html');
                    assert.equal(template({img: 'franny'}), loadFile('test/output/attributes-parse-dynamic-routes.txt'));
                });

                it('can be set via options', function() {
                    var template = require('!!../?pack=attributesParseDynamicRoutes!./templates/attributes-parse-dynamic-routes.html');
                    assert.equal(template({img: 'franny'}), loadFile('test/output/attributes-parse-dynamic-routes.txt'));
                });
            });
        });

    });

});
