var utils = require('./utils')
var ext = require('./bn-extensions')

// add inputs until we reach or surpass the target value (or deplete)
// worst-case: O(n)
module.exports = function accumulative (utxos, outputs, feeRate) {
  if (!isFinite(utils.bnOrNaN(feeRate))) return {}
  var bytesAccum = utils.transactionBytes([], outputs)

  var inAccum = ext.BN_ZERO
  var inputs = []
  var outAccum = utils.sumOrNaN(outputs)

  for (var i = 0; i < utxos.length; ++i) {
    var utxo = utxos[i]
    var utxoBytes = utils.inputBytes(utxo)
    var utxoFee = ext.multiply(feeRate, utxoBytes)
    var utxoValue = utils.bnOrNaN(utxo.value)

    // skip detrimental input
    var feeIsMoreThanValue = ext.greaterThan(utxoFee, utxoValue)
    // utxoFee > utxoValue
    if (feeIsMoreThanValue) {
      if (i === utxos.length - 1) {
        var bytesSum = ext.add(bytesAccum, utxoBytes)
        return {
          fee: ext.multiply(feeRate, bytesSum)
        }
      }
      continue
    }

    bytesAccum = ext.add(bytesAccum, utxoBytes)
    inAccum = ext.add(inAccum, utxoValue)
    inputs.push(utxo)

    var fee = ext.multiply(feeRate, bytesAccum)

    // go again?
    var totalOutValue = ext.add(outAccum, fee)
    var inputsAreLessThanOutputs = ext.lessThan(inAccum, totalOutValue)

    if (inputsAreLessThanOutputs) continue

    return utils.finalize(inputs, outputs, feeRate)
  }

  return {
    fee: feeRate.mul(bytesAccum)
  }
}
