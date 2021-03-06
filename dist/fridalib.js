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
        test: {},

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
                var atomic = this;
                if (FridaLib.receivers.filter(function(obj){return obj.toString() === atomic.toString();}).length > 0){        
                    onReceiveCallback();
                } else {                    
                    this.onReceive(context,intent);
                }                       
            }
            
            FridaLib.Android.Common.Context.registerReceiver($receiver,$filter);
            FridaLib.receivers = (FridaLib.receivers || []).concat([$receiver]);
            return FridaLib.receivers.length-1;
        },

        monitorBroadcastReceivers: function(onReceiveCallback){
            var ContextWrapper = Java.use("android.app.ContextImpl");     
            var StringWriter = Java.use("java.io.StringWriter");
            var Xml = Java.use("android.util.Xml"); 
            
            ContextWrapper.registerReceiverInternal.overload("android.content.BroadcastReceiver", "int", "android.content.IntentFilter", "java.lang.String", "android.os.Handler","android.content.Context").implementation = function(receiver, userid, filter, broadcastPermission, scheduler, context) {               
                var serializer = Xml.newSerializer();
                var writer = StringWriter.$new();                
                serializer.setOutput(writer);
                serializer.startTag(null,"receiver");
                serializer.startTag(null,"intent-filter");
                broadcastPermission ? serializer.attribute(null, "permission", broadcastPermission) : null;
                filter.writeToXml(serializer);      
                serializer.endTag(null,"intent-filter");
                serializer.endTag(null,"receiver");        
                serializer.endDocument();            
                console.log("registerReceiver: \n" 
                            + writer.toString());
                if (typeof onReceiveCallback === 'function'){
                    clazz = Java.use(receiver.$className);
                    clazz.onReceive.implementation = function(context,intent){
                        return onReceiveCallback(this,context,intent);
                    };
                }
               

                return this.registerReceiverInternal(receiver, userid, filter, broadcastPermission, scheduler, context);
            };   
        },

        discoverReceivers : function(onReceiveCallback){
            var BroadcastReceiver = Java.use("android.content.BroadcastReceiver")
            var classes = Java.enumerateLoadedClassesSync();
            for (var index in classes){
                if (classes[index].startsWith("android") || classes[index].startsWith("java") || classes[index].startsWith("com.android")) continue;
                try {
                    var clazz = Java.use(classes[index]);
                    if (BroadcastReceiver.class.isAssignableFrom(clazz.class)){
                        console.log(classes[index]);
                        if (typeof onReceiveCallback === 'function'){
                            clazz.onReceive.implementation = function(context,intent){
                                return onReceiveCallback(this,context,intent);
                            };
                        }
                    }
                    clazz.$dispose();
                } catch (e) {

                }   
            }
        }
    }
}()
},{}],8:[function(require,module,exports){
module.exports = function(){
    return {
        Android: require("./android/index.js"),
        iOS: require("./ios/index.js"),
        utils: require("./utils/index.js")
    }
}();
},{"./android/index.js":5,"./ios/index.js":13,"./utils/index.js":16}],9:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
module.exports = function(){
    return {
        formatXml : function (xml) {
        var reg = /(>)\s*(<)(\/*)/g; // updated Mar 30, 2015
        var wsexp = / *(.*) +\n/g;
        var contexp = /(<.+>)(.+\n)/g;
        xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
        var pad = 0;
        var formatted = '';
        var lines = xml.split('\n');
        var indent = 0;
        var lastType = 'other';
        // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
        var transitions = {
            'single->single': 0,
            'single->closing': -1,
            'single->opening': 0,
            'single->other': 0,
            'closing->single': 0,
            'closing->closing': -1,
            'closing->opening': 0,
            'closing->other': 0,
            'opening->single': 1,
            'opening->closing': 0,
            'opening->opening': 1,
            'opening->other': 1,
            'other->single': 0,
            'other->closing': -1,
            'other->opening': 0,
            'other->other': 0
        };

        for (var i = 0; i < lines.length; i++) {
            var ln = lines[i];
            var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
            var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
            var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
            var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
            var fromTo = lastType + '->' + type;
            lastType = type;
            var padding = '';

            indent += transitions[fromTo];
            for (var j = 0; j < indent; j++) {
                padding += '\t';
            }
            if (fromTo == 'opening->closing')
                formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
            else
                formatted += padding + ln + '\n';
        }

        return formatted;
    }
    }
}();

},{}]},{},[8])(8)
});