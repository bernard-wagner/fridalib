module.exports = function(){
    var $Security = FridaLib.iOS.Common.Security;
    return {
        dumpKeychain : function(){
            var $result = $Security.SecCopyItemMatching({
                [$Security.kSecReturnAttributes]: true, 
                [$Security.kSecMatchLimit]: $Security.kSecMatchLimitAll, 
                [$Security.kSecReturnData]: true
            });
            var result = FridaLib.iOS.Common.Foundation.NSDictionary.toObject($result);
            console.log(result);
        },
    }
}