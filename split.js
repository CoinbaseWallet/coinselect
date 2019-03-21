var utils = require('./utils')
var BN = require('bn.js')
var ext = require('./bn-extensions')

// split utxos between each output, ignores outputs with .value defined
module.exports = function split (utxos, outputs, feeRate) {
  if (!isFinite(utils.bnOrNaN(feeRate))) return {}

  var bytesAccum = utils.transactionBytes(utxos, outputs)
  var fee = ext.multiply(feeRate, bytesAccum)
  if (outputs.length === 0) return { fee: fee }

  var inAccum = utils.sumOrNaN(utxos)
  var outAccum = utils.sumForgiving(outputs)
  var remaining = ext.subtract(ext.subtract(inAccum, outAccum), fee)
  if (!isFinite(remaining) || remaining < 0) return { fee: fee }

  var unspecified = outputs.reduce(function (a, x) {
    return a + !isFinite(x.value)
  }, 0)

  var remainingIsZero = ext.isZero(remaining)
  if (remainingIsZero && unspecified === 0) return utils.finalize(utxos, outputs, feeRate)

  // Counts the number of split outputs left
  var splitOutputsCount = new BN(outputs.reduce(function (a, x) {
    return a + !x.value
  }, 0))

  // any number / 0 = infinity (shift right = 0)
  var splitValue = ext.shiftright(ext.divide(remaining, splitOutputsCount), 0)

  // ensure every output is either user defined, or over the threshold
  if (!outputs.every(function (x) {
    var splitIsMoreThanDustThreshold = ext.greaterThan(splitValue, utils.dustThreshold(x, feeRate))
    return x.value !== undefined || splitIsMoreThanDustThreshold
  })) {
    return {
      fee: fee
    }
  }

  // assign splitValue to outputs not user defined
  outputs = outputs.map(function (x) {
    if (x.value !== undefined) return x

    // not user defined, but still copy over any non-value fields
    var y = {}
    for (var k in x) y[k] = x[k]
    y.value = splitValue
    return y
  })

  return utils.finalize(utxos, outputs, feeRate)
}
