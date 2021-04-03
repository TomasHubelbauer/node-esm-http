# Node ESM URL

This repository implements a Node [ESM Loader](https://nodejs.org/api/esm.html#esm_loaders)
which adds support for HTTP and HTTPS URLs in ESM `import` statements in Node.
This functionality bridges a gap between Node and browser runtimes, which have
support for this already.

[`demo.js`](demo.js):
```js
import delay from 'https://raw.githubusercontent.com/tomashubelbauer/esm-delay/main/index.js';

void async function () {
  console.log('Watch the delay:');
  await delay(1000);
  console.log('A second later…');
}()
```

```sh
node --experimental-loader ./index.js demo.js
```

## Installation & Usage

### Copy-Paste

You can just copy-paste `index.js` into your project and add it to Node's CLI
arguments using:

```
node --experimental-loader ./index.js
```

### Submodule

```sh
git submodule add https://github.com/tomashubelbauer/node-esm-url
```

Configure Node to use the loader from the submodule directory:

```sh
node --experimental-loader ./node-esm-url/index.js
```

## To-Do

### Add support for fetching dependencies of the downloaded modules

The loader needs an ability to recognize `file:` specifiers whose `parentURL`
(in `context`) is coming from `node_modules` and download those so that the
referenced URL ESM modules can themselves depend on other modules.

### Take inspiration from the example loader in Node documentation

I just noticed the loader documentation talks about a HTTP/HTTPS loader as well
as gives an example of one:

https://nodejs.org/api/esm.html#esm_https_loader

The implementation is cleaner than mine and it looks like it will cleanly
support ESM within the downloaded module. Test it and if it works well, replace
this repository with it.

I've reformatted it and improved it slightly:

```javascript
/* https://nodejs.org/api/esm.html#esm_https_loader */

import https from 'https';

/** @typedef {{ parentURL: string; }} Context */
/** @typedef {(specifier: string, context: Context, defaultResolve: DefaultResolve) => void} DefaultResolve */

export function resolve(/** @type {string} */ specifier, /** @type {Context} */ context, /** @type {DefaultResolve} */ defaultResolve) {
  const { parentURL = null } = context;

  if (specifier.startsWith('https://')) {
    return { url: specifier };
  }

  if (parentURL?.startsWith('https://')) {
    return { url: new URL(specifier, parentURL).href };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

/** @typedef {(url: string, context: unknown, defaultGetFormat: DefaultGetFormat) => void} DefaultGetFormat */

export function getFormat(/** @type {string} */ url, /** @type {unknown} */ context, /** @type {DefaultGetFormat} */ defaultGetFormat) {
  if (url.startsWith('https://')) {
    return { format: 'module' };
  }

  return defaultGetFormat(url, context, defaultGetFormat);
}

/** @typedef {(url: string, context: unknown, defaultGetSource: DefaultGetSource) => void} DefaultGetSource */

export function getSource(/** @type {string} */ url, /** @type {unknown} */ context, /** @type {DefaultGetSource} */ defaultGetSource) {
  if (url.startsWith('https://')) {
    return new Promise((resolve, reject) => {
      https
        .get(url, async response => {
          /** @type {Buffer[]} */
          const buffers = [];
          for await (const buffer of response) {
            buffers.push(buffer);
          }

          resolve({ source: Buffer.concat(buffers) });
        })
        .on('error', reject);
    });
  }

  return defaultGetSource(url, context, defaultGetSource);
}
```

It has a problem where if the referenced module imports built-in Node packages,
it will instead treat those imports as URL imports, too. Fix this, if you find a
way how to.
