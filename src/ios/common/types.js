module.exports = function(){
    return {
        $BOOL: function(value){           
            return ObjC.classes.__NSCFBoolean.numberWithBool_(value);
        }
    }
}();