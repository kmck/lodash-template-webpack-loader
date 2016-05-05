# lodash-template-webpack-loader

[![Build Status](https://travis-ci.org/kmck/lodash-template-webpack-loader.svg?branch=master)](https://travis-ci.org/kmck/lodash-template-webpack-loader)

[Webpack](https://webpack.github.io/) loader for [Lodash templates](https://lodash.com/docs#template)

Supports the features you probably expect, such as escaping and template imports, but without the kitchen sink. Unless you want the kitchen sink!

### Installation

    npm install --save-dev lodash-template-webpack-loader

### Usage

Set up the loader in your `webpack.config.js`:

```js
module.exports = {
    //...
    module: {
        loaders: [{
            test: /(\.tpl|\.html)$/,
            loader: 'lodash-template-webpack',
        }],
    },
    lodashTemplateLoader: {
        // optional configuration...
    },
    //...
};
```

This will allow you to `require` and use templates like this:

```js
var template = require('./path/to/template.tpl');
var html = template({
    title: 'Hello world',
});
```

## Configuration

By default, you get variable interpolation, escaping (`_.escape`), and evaluation for free (`<%= thing %>`, `<%- escapedThing %>`, and `<% if (thing) { %>...<% } %>`, respectively). You do _not_ get all of Lodash in the `_` variable or `_.templateSettings.imports`.

There are a number of configuration options available:

* `globalLodash`: enables the assumption of a global `_` variable
* `engine`: specifies the library to use for the local `_` variable in the template (ie. `var _ = require(engine)`)
* `templateEscape`: set to `false` to disable automatic inclusion of `_.escape`
* `imports`
* `importsModule`
* `interpolate`
* `escape`
* `evaluate`
* `variable`
* `prependFilenameComment`
* `attributes`
* `root`
* `parseDynamicRoutes`

### The `_` variable

If you already include the Lodash kitchen sink globally, include `globalLodash: true` in your config. `_` will be presumed to be available for use in your templates.

If you want the Lodash kitchen sink, but would rather define `_` locally, use `engine: 'lodash'`in your configuration. You can use this to specify `'underscore'`, if you want.

### Escaped variable printing

Even if you don't include all of Lodash, this loader includes `_.escape` by default so that escaped printing works with no configuration. If you don't want that behavior, add `templateEscape: false` and `<%- %>` will break.

`templateEscape` does nothing you're using the `globalLodash` or `engine` options.

### Template imports

[`_.templateSettings.imports`](https://lodash.com/docs#templateSettings-imports) provides default variables that are imported into the compiled templates. This is useful when you have utility functions that you want to make available to all templates without explicitly passing them in every time the template is used.

If you use `globalLodash` or `engine`, it will use the value of `_.templateSettings.imports` at the time you `require` the template.

##### template.tpl

```html
"<%- scream(sentence) %>", he said with an exaggerated smile.
```

##### module.js

```js
_.templateSettings.imports.scream = function(str) {
    return (str || '').toUpperCase();
};
var template = require('./path/to/template.tpl');
template('I love dogs.');
```

Setting `_.templateSettings.imports` AFTER `require`-ing the template will **not** work!

You can specify a string of **raw javascript** for the `imports` option to use instead:

```js
module.exports = {
    // ...
    lodashTemplateLoader: {
        imports: '{title: \'Hi, world!\'}',
    },
    // ...
};
```

In some cases, it may be preferable to specify a module to use for the imports. `importsModule` lets you specify module that exports the template imports.

```js
module.exports = {
    // ...
    lodashTemplateLoader: {
        importsModule: path.join(__dirname, 'template-imports'),
    },
    // ...
};
```

### Template settings

You can modify the regular expressions that Lodash uses for [`interpolate`](https://lodash.com/docs#templateSettings-interpolate), [`escape`](https://lodash.com/docs#templateSettings-escape), and [`evaluate`](https://lodash.com/docs#templateSettings-evaluate):

```js
module.exports = {
    // ...
    lodashTemplateLoader: {
        interpolate: '\\{\\[(.+?)\\]\\}',
        escape: '\\{\\{(.+?)\\}\\}',
        evaluate: '\\{%([\\s\\S]+?)%\\}',
    },
    // ...
};
```

You can also specify the [`variable`](https://lodash.com/docs#templateSettings-variable) option, which can be used to namespace the variables you pass into the template:

```js
module.exports = {
    // ...
    lodashTemplateLoader: {
        variable: 'data',
    },
    // ...
};
```

##### template.tpl

```html
<h1><%- data.title %></h1>
<p><%- data.description %></p>
```

##### module.js

```js
var template = require('./path/to/template.tpl');
template({
    title: 'Namespacing',
    description: 'Safe and sound!',
});
```

### Prepending filename comment

When debugging a large single page app with the DevTools, it can be hard to find the template that contains a bug. With the following config a HTML comment is prepended to the template with the relative path in it (e.g. `<!-- view/user/edit.html -->`).

```js
module.exports = {
    // ...
    lodashTemplateLoader: {
        prependFilenameComment: __dirname,
    },
    // ...
};
```

### Attribute parsing

This loader allows for parsing of URLs found in certain tag attributes. Matched attributes pass the URLs through the corresponding Webpack loader, allowing you to do things like remap or add hashes to image URLs. This is enabled for images by default, but you can add wherever using an array of `tag:attribute` pairs:

```js
module.exports = {
    // ...
    module: {
        loaders: [{
            test: /(\.tpl|\.html)$/,
            loader: 'lodash-template-webpack',
        }, {
            test: /(\.gif|\.png|\.jpg)$/,
            loader: 'url-loader', // or 'file-loader'
        }],
    },
    lodashTemplateLoader: {
        attributes: ['img:src', 'link:href'],
    },
    // ...
};
```

You can specify a `root` to translate absolute paths to a relative location:

```js
module.exports = {
    // ...
    lodashTemplateLoader: {
        root: 'assets',
    },
    // ...
};
```

```html
<!-- Attribute in template -->
<img src="/img/franny.jpg">

<!-- Attribute after compilation -->
<img src="assets/img/franny.jpg">
```

You can specify `root` with `parseDynamicRoutes: true` to prepend a root to absolute URL attributes that use template expressions:

```js
module.exports = {
    // ...
    lodashTemplateLoader: {
        root: '/assets/img',
        parseDynamicRoutes: true,
    },
    // ...
};
```

```html
<!-- Attribute in template -->
<img src="/<%- image %>.jpg">

<!-- Attribute after compilation, invoked with `template({image: 'franny'})` -->
<img src="/assets/img/franny.jpg">
```

If you'd like to disable attribute parsing behavior entirely, simply disable `attributes` in your config:

```js
module.exports = {
    // ...
    lodashTemplateLoader: {
        attributes: false,
    },
    // ...
};
```

### License

[MIT License](LICENSE)

---

This project is inspired and based on [underscore-template-loader](https://github.com/emaphp/underscore-template-loader). I owe the contributors on that project a lot of credit for the excellent work they've done, so thanks!
