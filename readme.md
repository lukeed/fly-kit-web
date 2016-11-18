# fly-kit-web

> A lean Web App starter kit with [Fly](https://github.com/flyjs/fly)

---
<p align="center">Boilerplate & commands will evolve as my own development process does.</p>
---

## Install

```
git clone https://github.com/lukeed/fly-kit-web
npm install
npm start
```

> **Pro Tip:** Use [Yarn](https://yarnpkg.com/) to install NPM dependencies 3x faster than NPM!


## Commands

#### build

```
$ npm run build
```

Compiles all files. Output is sent to the `dist` directory.

#### release

```
$ npm run release
```

Builds the app for production, includes [cache-busting](http://webassets.readthedocs.io/en/latest/expiring.html) asset names. Output is sent to the `release` directory.

#### start

```
$ npm start
```

Executes [`build`](#build) and runs your application (from the `dist` directory) in the browser.

#### test

```
$ npm run test
```

Lints all JavaScript files.

#### watch

```
$ npm run watch
```

Like [`start`](#start), but will auto-compile & auto-reload the server after any file changes within the `src` directory.


## License

MIT © [Luke Edwards](https://lukeed.com)
