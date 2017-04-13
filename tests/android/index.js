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

    var testButton = function(){
          Java.perform(function(){
             var MainActivity = Java.use("com.mwrlabs.test.MainActivity");

             MainActivity.btnClicked.overload("android.view.View").implementation = function(view){
                 console.log("Button clicked");
                 this.btnClicked(view);
             }
          })
    }

    var monitorAndRegisterBroadcast = function(){
         Java.perform(function(){
              FridaLib.Android.Module.IPC.monitorBroadcastReceivers();
              FridaLib.Android.Module.IPC.registerReceiver({action: "pew.pew.pew2"});
              FridaLib.Android.Module.IPC.sendBroadcast({action: "pew.pew.pew2"});
              FridaLib.Android.Module.IPC.unregisterReceiver(0);
          })
    }

    var quick = function(){
        Java.perform(function(){
              var LoadedApk = Java.use("android.app.LoadedApk");
              console.log(LoadedApk.mReceivers);
          })
    }

    var runTests = function(){
        startActivity();
    }

    return {
        runTests: runTests
    }
}();