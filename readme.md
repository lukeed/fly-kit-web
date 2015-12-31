# Fly Starter [![Build Status](https://travis-ci.org/lukeed/fly-starter.svg?branch=master)](https://travis-ci.org/lukeed/fly-starter)

> Starter Kit for scaffolding a Web App with [Fly](https://git.io/fly) as the task runner.

**WARNING** This isn't ready to use in yet. Development/Watch tasks will append file content to existing file content, resulting in duplicative & oversized files.
Please see [this issue](https://github.com/bucaran/fly/issues/121) to stay updated.

## Install

```
$ git clone https://github.com/lukeed/fly-starter.git
$ cd fly-starter
$ rm -rf .git
$ git init
```

You now have a fresh copy of this repo.

## Usage

**Default** -- build development files & recompile on file changes
```
npm run fly
```

**Watch** -- build development files & start a server. Recompiles & refreshes server on file changes
```
npm run watch
```

**Build** -- build production-ready assets
```
npm run build
```

**Serve** -- build production-ready assets & start a server
```
npm run serve
```

**Test** -- Run tests using [Ava](https://github.com/sindresorhus/ava)
```
# todo
```

## License

MIT © [Luke Edwards](https://github.com/lukeed)
