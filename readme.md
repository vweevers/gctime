# gctime

> **Record time spent on GC in high resolution.**  
> Yields a statistic set with `min`, `max` and `sum` of duration and `size` (number of cycles).

[![npm status](http://img.shields.io/npm/v/gctime.svg)](https://www.npmjs.org/package/gctime)
[![node](https://img.shields.io/node/v/gctime.svg)](https://www.npmjs.org/package/gctime)
[![Travis build status](https://img.shields.io/travis/vweevers/gctime.svg?label=travis)](http://travis-ci.org/vweevers/gctime)
[![AppVeyor build status](https://img.shields.io/appveyor/ci/vweevers/gctime.svg?label=appveyor)](https://ci.appveyor.com/project/vweevers/gctime)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Dependency status](https://img.shields.io/david/vweevers/gctime.svg)](https://david-dm.org/vweevers/gctime)

## Usage

Continuously log GC cycles and duration:

```js
const gctime = require('gctime')
const nano = require('nanoseconds')
const diffy = require('diffy')()
const fmt = require('util').format
const stats = gctime.get()

diffy.render(function () {
  // Update stats. Alternatively call .get() to get a new object.
  gctime.accumulate(stats)

  return fmt(
    'cycles: %d. min: %dns. max: %dns. avg: %dns',
    stats.size,
    nano(stats.min),
    nano(stats.max),
    nano(stats.sum) / stats.size | 0
  )
})

gctime.start()

setInterval(() => Array(1e6).fill(1), 100)
setInterval(() => diffy.render(), 500)
```

```
$ node example.js
cycles: 174. min: 45488ns. max: 843813ns. avg: 131384ns
```

When you're done, call `gctime.stop()`. For a single run, you can skip `get()` as `stop()` returns stats too: `stats = gctime.stop()`.

The statistics follow the format of [`process.hrtime()`](https://nodejs.org/api/process.html#process_process_hrtime_time): an array of `[seconds, nanoseconds]` where `nanoseconds` is the remaining part of the time that can't be represented in second precision.

The state of `start()`, `get()` and `stop()` is global. They throw if already started or stopped, respectively.

## Install

With [npm](https://npmjs.org) do:

```
npm install gctime
```

## License

[MIT](LICENSE) © 2017-present Vincent Weevers. Contains 8 lines of code from Node.js [© many people](https://github.com/nodejs/node/blob/master/LICENSE).
