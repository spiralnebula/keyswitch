Key Switch
==========

*Replaces you radio buttons.*

 - Allows input fields to popup on specified options.

```javascript
keyswtich.make({
    class_name : {}
    with       : {
        option : {
            choice        : Array,
            default_value : String
        },
        input : {
            show_on : String, 
            with    : {
                placeholder : String,
                value       : String,
                verify      : {
                    when : function ( value ) {
                        return Boolean
                    },
                    with : function ( value ) {
                        return {
                            is_valid : Boolean,
                            text     : String
                        }
                    },
                }
            }
        }
    }
})
```