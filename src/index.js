module.exports = function(){
    return {
        Android: require("./android/index.js"),
        iOS: require("./ios/index.js"),
        utils: require("./utils/index.js")
    }
}();