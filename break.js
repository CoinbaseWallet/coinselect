var utils = require('./utils')
var ext = require('./bn-extensions')

// break utxos into the maximum number of 'output' possible
module.exports = function broken (utxos, output, feeRate) {
  if (!isFinite(utils.bnOrNaN(feeRate))) return {}

  var bytesAccum = utils.transactionBytes(utxos, [])
  var value = utils.bnOrNaN(output.value)
  var inAccum = utils.sumOrNaN(utxos)

  if (!isFinite(value) ||
      !isFinite(inAccum)) return { fee: feeRate.mul(bytesAccum) }

  var outputBytes = utils.outputBytes(output)
  var outAccum = ext.BN_ZERO
  var outputs = []

  while (true) {
    // feeRate * (bytesAccum + outputBytes)
    var fee = ext.multiply(feeRate, ext.add(bytesAccum, outputBytes))

    var outputTotal = ext.add(fee, value)
    var totalSoFar = ext.add(outAccum, outputTotal)
    var isLessThanInAccumulator = ext.lessThan(inAccum, totalSoFar)

    // did we bust?
    // inAccum < (outAccum + fee + value)
    if (isLessThanInAccumulator) {
      var isZero = ext.isZero(outAccum)
      // premature?
      if (isZero) {
        return {
          fee: fee
        }
      }
      break
    }

    bytesAccum = ext.add(bytesAccum, outputBytes)
    outAccum = ext.add(outAccum, value)
    outputs.push(output)
  }

  return utils.finalize(utxos, outputs, feeRate)
}
