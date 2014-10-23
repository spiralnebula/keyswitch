define({
	// should add a way to recursivley call eloquent when verification passes
	define : {
		allow   : "*",
		require : [
			"morph",
			"transistor",
			"event_master"
		],
	},

	make : function ( define ) {
		
		var shumput_body, event_circle

		shumput_body = this.library.transistor.make(
			this.define_body( define ) 
		)
		event_circle = this.library.event_master.make({ 
			state  : this.define_state( define ),
			events : this.define_event({
				body : shumput_body,
				with : define.with
			})
		})
		event_circle.add_listener(
			this.define_listener( define )
		)

		return this.define_interface({
			body         : shumput_body,
			event_master : event_circle
		})
	},

	define_interface : function ( define ) { 
		return { 
			body      : define.body.body,
			append    : define.body.append,
			get_state : function () { 
				return define.event_master.get_state()
			},
			reset     : function () {
				define.event_master.stage_event({
					called : "reset",
					as     : function ( state ) { 
						return { 
							event : { 
								target : define.body.body
							},
							state : state
						}
					}
				})
			},
		}
	},

	define_state : function ( define ) {
		var default_value
		default_value = define.with.value || ""
		return {
			value          : default_value,
			original_value : default_value,
			valid          : ( !define.with.verify ),
			verify         : define.with.verify || {}
		}
	},

	define_event : function ( define ) {
		return [
			{ 
				called : "reset"
			},
			{ 
				called       : "shumput input type",
				that_happens : [
					{
						on : define.body.body,
						is : [ "keyup" ]
					}
				],
				only_if      : function ( heard ) {
					return heard.event.target.hasAttribute("data-shumput")
				}
			}
		]
	},

	define_listener : function ( define ) {
		var self = this
		return [
			{ 
				for       : "reset",
				that_does : function ( heard ) {
					
					var input_node, option_state

					input_node         = heard.event.target.firstChild
					option_state       = heard.state
					option_state.value = option_state.original_value
					input_node.value   = option_state.original_value
					input_node.setAttribute("value", option_state.original_value )

					if ( option_state.verify && option_state.verify.when ) {

						var verification, text_body

						text_body = input_node.nextSibling

						if ( option_state.verify.when( input_node.value ) ) {

							verification            = option_state.verify.with( input_node.value )
							option_state.valid      = verification.is_valid
							text_body.textContent   = verification.text
							text_body.style.display = "block"

						} else { 
							text_body.style.display = "none"
						}
					}



					return heard
				}
			},
			{
				for       : "shumput input type",
				that_does : function ( heard ) {

					var input_node, option_state

					input_node   = heard.event.target
					option_state = heard.state

					if ( option_state.verify && option_state.verify.when ) {

						var verification, text_body

						text_body = input_node.nextSibling

						if ( option_state.verify.when( input_node.value ) ) {

							verification            = option_state.verify.with( input_node.value )
							option_state.valid      = verification.is_valid
							option_state.value      = input_node.value
							text_body.textContent   = verification.text
							text_body.style.display = "block"

							if ( option_state.valid ) {
								text_body.setAttribute( "class", define.class_name.text_valid )
							} else {
								text_body.setAttribute( "class", define.class_name.text_invalid )
							}

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
		return {
			"class" : define.class_name.wrap,
			"child" : [
				( define.with.size === "large" ? 
					this.define_large( define ) : 
					this.define_small( define ) 
				)
			].concat(
				( define.with.verify ? 
					this.define_text( define ) : 
					[] 
				)
			)
		}
	},

	define_text : function ( define ) {

		var verification, default_value, to_be_shown

		default_value = define.with.value || ""
		to_be_shown   = define.with.verify.when( default_value )
		verification  = { 
			is_valud : false,
			text     : ""
		}

		if ( to_be_shown ) { 
			verification = define.with.verify.with( default_value )
		} 

		return {
			"class"   : (
				verification.is_valid ? 
					define.class_name.text_valid : 
					define.class_name.text_invalid
			),
			"text"    : verification.text,
			"display" : ( to_be_shown ? "block" : "none" )
		}
	},

	define_small : function ( define ) {
		
		var definition

		definition = {
			"type"         : "input",
			"class"        : define.class_name.small,
			"value"        : define.with.value || "",
			"data-shumput" : "true"
		}
		
		if ( define.with.placeholder ) { 
			definition.placeholder = define.with.placeholder
		}

		return definition
	},

	define_large : function ( define ) { 
		
		var definition
		
		definition = {
			"type"         : "textarea",
			"data-shumput" : "true",
			"class"        : define.class_name.large,
			"text"         : define.with.value || ""
		}

		if ( define.with.placeholder ) { 
			definition.placeholder = define.with.placeholder
		}

		return definition
	},
})