'use strict'

const test = require('tape')
const gctime = require('.')

test('no start', function (t) {
  t.plan(1)

  try {
    gctime.stop()
  } catch (err) {
    t.is(err.message, 'Already stopped')
  }
})

test('double start', function (t) {
  t.plan(1)

  gctime.start()

  try {
    gctime.start()
  } catch (err) {
    t.is(err.message, 'Already started')
  }

  gctime.stop()
})

test('start and stop', function (t) {
  t.plan(11)

  gctime.start()
  for (let i = 0; i < 1e3; i++) new Array(1e3).fill(0)
  global.gc()

  const stats = gctime.stop()

  t.is(typeof stats.min[0], 'number')
  t.is(typeof stats.min[1], 'number')
  t.is(typeof stats.max[0], 'number')
  t.is(typeof stats.max[1], 'number')
  t.is(typeof stats.sum[0], 'number')
  t.is(typeof stats.sum[1], 'number')
  t.is(typeof stats.size, 'number')

  t.ok(stats.size > 0)
  t.ok(nano(stats.min) > 0)
  t.ok(nano(stats.max) > 0)
  t.ok(nano(stats.sum) > 0)
})

function nano (hrtime) {
  return hrtime[0] * 1e9 + hrtime[1]
}
