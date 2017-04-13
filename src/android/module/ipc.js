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
        registerReceiver: function(filter){
            var $filter = FridaLib.Android.Common.Intent.buildIntentFilter(filter);
            var BrickReceiver = Java.use("com.android.server.BrickReceiver");
            var $receiver = BrickReceiver.$new();

            BrickReceiver.onReceive.implementation = function(context,intent){
                this.onReceive(context,intent);
            }
            
            FridaLib.Android.Common.Context.registerReceiver($receiver,$filter);
            FridaLib.receivers = (FridaLib.receivers || []).concat([$receiver]);
        },

        monitorBroadcastReceivers: function(){
            var ContextWrapper = Java.use("android.app.ContextImpl");

            ContextWrapper.registerReceiver.overload("android.content.BroadcastReceiver", "android.content.IntentFilter").implementation = function(receiver, filter) {
                return this.registerReceiver(receiver,filter);
            };
            
            ContextWrapper.registerReceiverInternal.overload("android.content.BroadcastReceiver", "android.content.IntentFilter", "java.lang.String", "android.os.Handler","android.content.Context").implementation = function(receiver, filter, broadcastPermission, scheduler, context) {
                return this.registerReceiver(receiver, filter, broadcastPermission, scheduler, context);
            };   
        }
    }
}()