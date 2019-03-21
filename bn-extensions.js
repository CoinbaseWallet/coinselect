var BN = require('bn.js')

var BN_ZERO = new BN(0)
var BN_ONE = new BN(1)

function multiply (multiplicand, multiplier) {
  if (!BN.isBN(multiplicand) || !BN.isBN(multiplier)) return NaN

  return multiplicand.mul(multiplier)
}

function divide (dividend, divisor) {
  if (!BN.isBN(dividend) || !BN.isBN(divisor)) return NaN
  if (divisor.cmp(BN_ZERO) === 0) return Infinity

  return dividend.div(divisor)
}

function add (arg1, arg2) {
  if (!BN.isBN(arg1) || !BN.isBN(arg2)) return NaN

  return arg1.add(arg2)
}

function subtract (arg1, arg2) {
  if (!BN.isBN(arg1) || !BN.isBN(arg2)) return NaN

  return arg1.sub(arg2)
}

function shiftright (argument, shiftBy) {
  if (!BN.isBN(argument)) return NaN
  if (BN.isBN(shiftBy)) shiftBy = shiftBy.toNumber()
  if (typeof shiftBy !== 'number') return NaN

  return argument.shrn(shiftBy)
}

function isZero (argument) {
  if (!BN.isBN(argument)) return false
  if (argument.cmp(BN_ZERO) === 0) return true
  return false
}

function lessThan (subject, argument) {
  if (!BN.isBN(argument) || !BN.isBN(subject)) return false
  return subject.lt(argument)
}

function greaterThan (subject, argument) {
  if (!BN.isBN(argument) || !BN.isBN(subject)) return false
  return subject.gt(argument)
}

module.exports = {
  multiply: multiply,
  divide: divide,
  add: add,
  subtract: subtract,
  shiftright: shiftright,
  isZero: isZero,
  lessThan: lessThan,
  greaterThan: greaterThan,
  BN_ZERO: BN_ZERO,
  BN_ONE: BN_ONE
}
