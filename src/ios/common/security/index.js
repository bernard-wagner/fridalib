module.exports = function(){
    return {
        kSecAttrAccessibleAfterFirstUnlock: "ck",
        kSecAttrAccessibleWhenUnlocked: "ak",
        kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly: "cku",
        kSecAttrAccessibleAlways: "dk",
        kSecAttrAccessibleAlwaysThisDeviceOnly: "dku",
        kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly: "akpu",
        kSecAttrAccessibleWhenUnlockedThisDeviceOnly: "aku",
        kSecAttrAccessibleAfterFirstUnlock: "ck",
        kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly: "cku",
        kSecAttrAccessibleAlways: "dk",
        kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly: "akpu",
        kSecAttrAccessibleWhenUnlocked: "ak",
        kSecAttrAccessibleWhenUnlockedThisDeviceOnly: "aku",
        kSecAttrAccessibleAlwaysThisDeviceOnly: "dku",
        kSecClassCertificate: "cert",
        kSecClass: "class",
        kSecClassGenericPassword: "genp",
        kSecClassIdentity: "idnt",
        kSecClassInternetPassword: "inet",
        kSecClassKey: "keys",
        kSecReturnAttributes: "r_Attributes",
        kSecReturnRef: "r_Ref",
        kSecReturnData: "r_Data",
        kSecMatchLimit: "m_Limit",
        kSecMatchLimitAll: "m_LimitAll",

        SecItemCopyMatching: function(obj){
            var $query = FridaLib.iOS.Common.Foundation.NSDictionary.buildDictionary(obj);
            var SecItemCopyMatching = new NativeFunction(ptr(Module.findExportByName("Security","SecItemCopyMatching")),'pointer',['pointer','pointer']);

        },
    }
}