// Debug module shim
module.exports = function() {
  return {
    enabled: false,
    debug: function() {},
    extend: function() { return this; }
  };
};
