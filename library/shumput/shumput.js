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
		var self = this
		return [ 
			{
				for       : "shumput input type",
				that_does : function ( heard ) {
					return self.input_type_listener({
						data_name  : "data-shumput",
						class_name : define.class_name,
						state      : heard.state,
						event      : heard.event,
					})
				}
			}
		]
	},

	input_type_listener : function ( input ) {
		var value, option_state
		option_state       = input.state.option[input.event.target.getAttribute( input.data_name )]
		value              = input.event.target.value
		option_state.value = value
		if ( option_state.verify && option_state.verify.when ) {
			var verification, text_body
			text_body = input.event.target.nextSibling
			if ( option_state.verify.when( value ) ) {
				verification            = option_state.verify.with( value )
				option_state.valid      = verification.is_valid
				text_body.textContent   = verification.text
				text_body.style.display = "block"
				if ( option_state.valid ) { 
					text_body.setAttribute("class", input.class_name.text_valid )
				} else { 
					text_body.setAttribute("class", input.class_name.text_invalid )
				}
			} else {
				text_body.style.display = "none"
			}
		}
		return { 
			state : input.state,
			event : input.event
		}
	},

	define_body : function ( define ) {
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