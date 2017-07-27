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
                var atomic = this;
                if (FridaLib.receivers.filter(function(obj){return obj.toString() === atomic.toString();}).length > 0){        
                    onReceiveCallback(receiver,context,intent);
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