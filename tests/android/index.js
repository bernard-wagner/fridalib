var FridaLib = require("../../src/index.js")

module.exports = function(){

    var startActivity = function(){
        Java.perform(function(){
            var intent = {action: "android.intent.action.VIEW", component: "com.mwr.dz/.activities.MainActivity"};
            FridaLib.Android.Module.IPC.startActivity(intent);
        })
    }

    var sendBroadcast  = function(){
         Java.perform(function(){
            var intent = {action: "android.intent.action.RUN"};
            FridaLib.Android.Module.IPC.sendBroadcast(intent);
        })
    }

    var monitorBroadcast = function(){
         Java.perform(function(){
            FridaLib.Android.Module.IPC.monitorBroadcastReceivers();
        })
    }

    var buildIntentFilter = function(){
          Java.perform(function(){
              FridaLib.Android.Module.IPC.registerReceiver({action: "pew.pew.pew2"});
          })

    }

    var monitorAndRegisterBroadcast = function(){
         Java.perform(function(){
              FridaLib.Android.Module.IPC.monitorBroadcastReceivers(function(receiver,context,intent){
                  console.log("onReceive intercepted:" + receiver)
                  return receiver.onReceive(context,intent);
              });
              var index = FridaLib.Android.Module.IPC.registerReceiver({action: "pew.pew.pew2"}, function(){console.log("Success!")});
              FridaLib.Android.Module.IPC.sendBroadcast({action: "pew.pew.pew2"});
              FridaLib.Android.Module.IPC.discoverReceivers(function(receiver,context,intent){
                    console.log("onReceive intercepted:" + receiver)
                    return receiver.onReceive(context,intent);                
              });
              //FridaLib.Android.Module.IPC.unregisterReceiver(index);
          })
    }

    var dumpRegisteredReceivers = function(){
        var result = {}
        Java.perform(function(){
            var ArrayMap = Java.use("android.util.ArrayMap");
            var mReceivers = FridaLib.Android.Common.Application.getApplicationContext().mLoadedApk['value'].mReceivers['value'];
            var BroadcastReceivers = [];
            console.log(mReceivers)
            result = mReceivers.values().toArray()[0];
            result = Java.cast(result,ArrayMap).keySet().toArray();
            console.log(result);
        
        })
    }

    var runTests = function(){
        startActivity();
    }

    return {
        runTests: runTests
    }
}();