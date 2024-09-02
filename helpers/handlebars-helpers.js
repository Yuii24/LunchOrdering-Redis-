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
  },
  multiply: function (a, b) {
    return a * b
  },
  let: function (value, options) {
    const context = Object.assign({}, this, options.hash);
    context[options.hash.key] = value;
    return options.fn(context);
  }
}