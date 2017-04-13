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