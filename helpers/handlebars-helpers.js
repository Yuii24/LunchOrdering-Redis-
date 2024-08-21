module.exports = {
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  forLoop: function (n, options) {
    let result = '';
    for (let i = 0; i < n; ++i) {
      result += options.fn(i);
    }
    return result;
  }
}