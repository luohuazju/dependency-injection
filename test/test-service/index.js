module.exports = function(arg1, arg2, arg3) {

    // Set arguments
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.arg3 = arg3;

    this.set = function(name, value) {
        this[name] = value;
    }

    return this;
};