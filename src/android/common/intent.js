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