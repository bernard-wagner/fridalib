module.exports = function(){
    return {
        fileIncludedInBackup: function(){      
            var NSHomeDirectory = new NativeFunction(ptr(Module.findExportByName("Foundation","NSHomeDirectory")),'pointer',[]);
            var NSFileManager = ObjC.classes.NSFileManager;
            var NSURL = ObjC.classes.NSURL;
            var documentsPath = (new ObjC.Object(NSHomeDirectory())).stringByAppendingPathComponent_("Documents");
            var enumerator = NSFileManager.defaultManager().enumeratorAtPath_(documentsPath);
            var filePath = null;
            var isDirPtr = Memory.alloc(Process.pointerSize);
            Memory.writePointer(isDirPtr,NULL);
            while ((filePath = enumerator.nextObject()) != null){
                NSFileManager.defaultManager().fileExistsAtPath_isDirectory_(documentsPath.stringByAppendingPathComponent_(filePath),isDirPtr);
                var url = NSURL.fileURLWithPath_(documentsPath.stringByAppendingPathComponent_(filePath));
                if (Memory.readPointer(isDirPtr) == 0) {
                    var resultPtr = Memory.alloc(Process.pointerSize);
                    var errorPtr = Memory.alloc(Process.pointerSize);
                    url.getResourceValue_forKey_error_(resultPtr,"NSURLIsExcludedFromBackupKey",errorPtr)
                    var result = new ObjC.Object(Memory.readPointer(resultPtr));
                    send(JSON.stringify({result:result.toString(), path:documentsPath.stringByAppendingPathComponent_(filePath).toString()}));
                }
            }
        }
    }
}()