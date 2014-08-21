Morph
=====
*stateless utility*

### History & Background
Il get to witting one these, one these days.

Signed Mr.Slackaslack

### Methods

#### Homomorph

**Definition** : 

```javascript
morph.homomorph({ object : {}, set : "(object|array)", with : function () {} })
```

**Examples** : 

Map to object

```javascript
var who
who = morph.homomorph({
	object : {
		title : "Count",
		name  : "Dracula"
	},
	with   : function ( member ) {
		// first iteration
		member.value         // => Count
		member.property_name // => title
		member.set           // => {}
		return member.value + "mwhaahaha"
	}
})
console.log( who ) 
// => { title : "Countmwhaahaha", name : "Draculamwhaahaha" }
```

Map to array

```javascript
var who
who = morph.homomorph({
	object : {
		title : "Count",
		name  : "Dracula"
	},
	set    : "array",
	with   : function ( member ) {
		// first iteration
		member.value         // => Count
		member.property_name // => title
		member.set           // => []
		return member.value + "mwhaahaha"
	}
})
console.log( who ) 
// => [ "Countmwhaahaha", "Draculamwhaahaha" ]
```

### To Do

* A method that maps new members onto an existing set and returns result ( injective )
* A method that removes members from an existing set and returns leftover ( surjective )
* A method that extracts members from an existing set and returns extraction ( surjective )
* Unification of object and array looping