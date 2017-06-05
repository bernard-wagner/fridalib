(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FridaLib = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(){
    return {
        /**
         * Provides a simpe manner to get application context.
         */
        getApplicationContext : function(){
            var ActivityThread = Java.use("android.app.ActivityThread");
            return ActivityThread.currentApplication();       
        },
    }
}();
},{}],2:[function(require,module,exports){
module.exports = function(){
    return {
        /** 
         * Wraps android.content.Context:startActivity(Intent intent)                            
         * @intent to be used
         */
        startActivity : function($intent){                                
            $intent.addFlags(0x10000000);
            FridaLib.Android.Common.Application.getApplicationContext().startActivity($intent);
        },

        sendBroadcast: function($intent){
            FridaLib.Android.Common.Application.getApplicationContext().sendBroadcast($intent);
        },

        registerReceiver: function($receiver,$intentfilter,broadcastPermission){
            FridaLib.Android.Common.Application.getApplicationContext().registerReceiver($receiver,$intentfilter,broadcastPermission || null,null);
        },

        unregisterReceiver: function($receiver){
            FridaLib.Android.Common.Application.getApplicationContext().unregisterReceiver($receiver);
        }
    }
}();
},{}],3:[function(require,module,exports){
module.exports = function(){
    return {
        Application: require("./application.js"), 
        Context: require("./context.js"), 
        Intent: require('./intent.js'), 
    }
}();
},{"./application.js":1,"./context.js":2,"./intent.js":4}],4:[function(require,module,exports){
module.exports = function(){
    return {
        /**
         * Builds a native Intent
         */
        buildIntent: function(intent){
            var Intent = Java.use("android.content.Intent");
            var $intent = Intent.$new();
            if (intent.action && typeof intent.action === "string") $intent.setAction(intent.action);
            if (intent.component && typeof intent.component === "string") {
                var ComponentName = Java.use("android.content.ComponentName");
                var pkg = intent.component.split("/")[0];
                var cls = intent.component.split("/")[1];
                if (cls.charAt(0) === ".") cls = pkg + cls;
                var componentName = ComponentName.$new(pkg,cls);
                $intent.setComponent(componentName);
            }
            return $intent;
        },
        buildIntentFilter: function(filter){
            var BroadcastReceiver = Java.use("android.content.BroadcastReceiver");
            var IntentFilter = Java.use("android.content.IntentFilter");
              
            var $intentfilter = IntentFilter.$new();
            if (filter.actions && filter.actions instanceof Array) {
                for(var action in filter.actions){
                    if (typeof action === "string") $intentfilter.addAction(action);
                }        
            }
            if (filter.action && typeof filter.action === "string") $intentfilter.addAction(filter.action);
            return $intentfilter;
        },
    }
}();
},{}],5:[function(require,module,exports){
module.exports = function(){
    return {
        Common: require("./common/index.js"),
        Module: require("./module/index.js"), 
    }
}();


},{"./common/index.js":3,"./module/index.js":6}],6:[function(require,module,exports){
module.exports = function(){
    return {
        IPC: require("./ipc.js"), 
    }
}();
},{"./ipc.js":7}],7:[function(require,module,exports){
module.exports = function(){
    return {
        startActivity: function(intent){
            var $intent = FridaLib.Android.Common.Intent.buildIntent(intent);
            FridaLib.Android.Common.Context.startActivity($intent);
        },
        sendBroadcast: function(intent){
            var $intent = FridaLib.Android.Common.Intent.buildIntent(intent);     
            FridaLib.Android.Common.Context.sendBroadcast($intent);
        },
        unregisterReceiver: function(index){
            var $receiver = FridaLib.receivers[index];
            FridaLib.Android.Common.Context.unregisterReceiver($receiver);
        },
        registerReceiver: function(filter,onReceiveCallback){
            var $filter = FridaLib.Android.Common.Intent.buildIntentFilter(filter);
            var TemplateReceiver = Java.use("android.appwidget.AppWidgetProvider");
            var $receiver = TemplateReceiver.$new();

            TemplateReceiver.onReceive.implementation = function(context,intent){                
                onReceiveCallback();
            }
            
            FridaLib.Android.Common.Context.registerReceiver($receiver,$filter);
            FridaLib.receivers = (FridaLib.receivers || []).concat([$receiver]);
            return FridaLib.receivers.length-1;
        },

        monitorBroadcastReceivers: function(){
            var ContextWrapper = Java.use("android.app.ContextImpl");     
            var StringWriter = Java.use("java.io.StringWriter");
            var Xml = Java.use("android.util.Xml"); 
            
            ContextWrapper.registerReceiverInternal.overload("android.content.BroadcastReceiver", "int", "android.content.IntentFilter", "java.lang.String", "android.os.Handler","android.content.Context").implementation = function(receiver, userid, filter, broadcastPermission, scheduler, context) {               
                var serializer = Xml.newSerializer();
                var writer = StringWriter.$new();                
                serializer.setOutput(writer);
                serializer.startTag(null,"receiver");
                broadcastPermission ? serializer.attribute(null, "permission", broadcastPermission) : null;
                filter.writeToXml(serializer);      
                serializer.endTag(null,"receiver");        
                serializer.endDocument();            
                console.log("registerReceiver: " 
                            + writer.toString());
                return this.registerReceiverInternal(receiver, userid, filter, broadcastPermission, scheduler, context);
            };   
        }
    }
}()
},{}],8:[function(require,module,exports){
module.exports = function(){
    return {
        Android: require("./android/index.js"),
        iOS: require("./ios/index.js")
    }
}();
},{"./android/index.js":5,"./ios/index.js":13}],9:[function(require,module,exports){
module.exports = function(){
    return {
        NSDictionary: require("./nsdictionary.js"),
        
    }
}()
},{"./nsdictionary.js":10}],10:[function(require,module,exports){
module.exports = function(){
    return {
        buildNSDictionary : function(obj){
            var $dictionary  = ObjC.classes.NSMutableDictionary.dictionary();
            for(key in obj){
                var value = obj[key];
                switch (typeof value){
                    case "string":
                    case "number":
                         $dictionary.addObject_forKey_(obj[key],key);
                         break;
                    default:
                        break;
                }          
            }
            return $dictionary;
        },
        addItem: function($dictionary,key,value){
            $dictionary.addObject_forKey_(value,key);
        },
        removeItem: function($dictionary,key){
             $dictionary.removeObjectForKey_(value,key);
        },
        toObject: function($dictionary){
            var obj = {};
            var enumerator = $dictionary.keyEnumerator();
            var key;
            while ((key = enumerator.nextObject()) !== null) {
                obj.key = $dictionary.objectForKey_(key);
            }
            return obj;
        }
    }
}()
},{}],11:[function(require,module,exports){
module.exports = function(){
    return {
        Security: require("./security/index.js"),
        Foundation: require("./foundation/index.js")
    }
}();
},{"./foundation/index.js":9,"./security/index.js":12}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
module.exports = function(){
    return {
        Common: require("./common/index.js"),
        Module: require("./module/index.js")
    }
}();
},{"./common/index.js":11,"./module/index.js":14}],14:[function(require,module,exports){
module.exports = function(){
    return {
        Keychain: require("./keychain.js"),
    }
}();
},{"./keychain.js":15}],15:[function(require,module,exports){
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
},{}]},{},[8])(8)
});