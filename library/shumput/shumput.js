define({

	define : {
		allow   : "*",
		require : [
			"morph"
		],
	},

	make : function () {
		return {}
	},

	define_state : function ( define ) {
		return { 
			value  : "",
			valid  : ( define.with.verify ? false : true ),
			verify : define.with.verify || {}
		}
	},

	define_event : function ( define ) {
		return [ 
			{ 
				called       : "shumput input type",
				that_happens : [
					{
						on : define.with.body,
						is : [ "keyup" ]
					}
				],
				only_if      : function ( heard ) {
					return ( heard.event.target.hasAttribute("data-shumput") )
				}
			}
		]
	},

	define_listener : function ( define ) {
		return [ 
			{
				for       : "shumput input type",
				that_does : function ( heard ) {
					var value, option_state
					option_state       = heard.state.option[heard.event.target.getAttribute("data-shumput")]
					value              = heard.event.target.value
					option_state.value = value
					if ( option_state.verify.when ) {
						var verification, text_body
						text_body = heard.event.target.nextSibling
						if ( option_state.verify.when( value ) ) {
							verification            = option_state.verify.with( value )
							option_state.valid      = verification.is_valid
							text_body.textContent   = verification.text
							text_body.style.display = "block"
						} else { 
							text_body.style.display = "none"
						}
					}
					return heard
				}
			}
		]
	},

	define_body : function ( define ) {
		console.log(define.with)
		return {
			"class" : define.class_name.wrap,
			"child" : [
				( define.with.size === "large" ? this.define_large( define ) : this.define_small( define ) )
			].concat(
				( define.with.verify ? this.define_text( define ) : [] )
			)
		}
	},

	define_text : function ( define ) { 
		return {
			"class"   : define.class_name.text,
			"display" : "none",
			"text"    : "Some Text"
		}
	},

	define_small : function ( define ) {
		var definition, name
		name = ( define.option_name ? "data-"+ define.option_name : "data-shumput" )
		definition = {
			"type"  : "input",
			"class" : define.class_name.small,
			"value" : define.with.value || ""
		}
		definition[name] = define.name
		
		if ( define.with.placeholder ) { 
			definition.placeholder = define.with.placeholder
		}
		return definition
	},

	define_large : function ( define ) { 
		var definition
		definition = {
			"type"         : "textarea",
			"data-shumput" : define.name,
			"class"        : define.class_name.large,
			"text"         : define.with.value || ""
		}
		if ( define.with.placeholder ) { 
			definition.placeholder = define.with.placeholder
		}
		return definition
	}
})