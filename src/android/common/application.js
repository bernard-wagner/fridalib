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