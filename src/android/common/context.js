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

        registerReceiver: function($receiver,$intentfilter){
            FridaLib.Android.Common.Application.getApplicationContext().registerReceiver($receiver,$intentfilter);
        },

        unregisterReceiver: function($receiver){
            FridaLib.Android.Common.Application.getApplicationContext().unregisterReceiver($receiver);
        }
    }
}();