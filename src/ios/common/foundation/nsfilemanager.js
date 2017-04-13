module.exports = function(){
    var NSDocumentDirectory = "";

    var NSFileManager = ObjC.classes.NSFileManager;

    return {
        documentsPath: function(){
            NSFileManager.defaultManager().URLsForDirectory()
        }
    }
}