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
