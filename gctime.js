'use strict'

const binding = require('bindings')('gctime')
const fields = new Uint32Array(10)

const SECS = 0
const NANO = 1
const UPPER_32 = 0x100000000

exports.start = binding.start

exports.stop = function () {
  binding.stop()
  return exports.get()
}

exports.get = function () {
  binding.transfer(fields)

  const stats = new HighResolutionStats()

  stats.min[SECS] = fields[0] * UPPER_32 + fields[1]
  stats.min[NANO] = fields[2]

  stats.max[SECS] = fields[3] * UPPER_32 + fields[4]
  stats.max[NANO] = fields[5]

  stats.sum[SECS] = fields[6] * UPPER_32 + fields[7]
  stats.sum[NANO] = fields[8]

  stats.size = fields[9]

  return stats
}

exports.accumulate = function (stats) {
  binding.transfer(fields)

  const newSize = fields[9]

  if (newSize > 0) {
    const oldSize = stats.size

    mergeMin(stats.min, oldSize, fields[0] * UPPER_32 + fields[1], fields[2])
    mergeMax(stats.max, oldSize, fields[3] * UPPER_32 + fields[4], fields[5])
    mergeSum(stats.sum, fields[6] * UPPER_32 + fields[7], fields[8])

    stats.size = oldSize + newSize
  }
}

function HighResolutionStats () {
  this.min = [0, 0]
  this.max = [0, 0]
  this.sum = [0, 0]
  this.size = 0
}

function mergeMin (min, oldSize, sec, nano) {
  if (oldSize === 0 || sec < min[SECS] || (sec === min[SECS] && nano < min[NANO])) {
    min[SECS] = sec
    min[NANO] = nano
  }
}

function mergeMax (max, oldSize, sec, nano) {
  if (oldSize === 0 || sec > max[SECS] || (sec === max[SECS] && nano > max[NANO])) {
    max[SECS] = sec
    max[NANO] = nano
  }
}

function mergeSum (sum, sec, nano) {
  const ns = sum[NANO] + nano
  const overflow = ns / 1e9 | 0

  sum[SECS] = sum[SECS] + sec + overflow
  sum[NANO] = ns % 1e9
}
