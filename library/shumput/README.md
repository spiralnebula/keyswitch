Shumput
=======

*Input component package*

 - Decies when text is to be verified
 - Verifies text and can return weather its valid or not along with text

```javascript
shumput.make({ 
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
    },
})
```