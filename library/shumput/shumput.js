define({
	// should add a way to recursivley call eloquent when verification passes
	define : {
		allow   : "*",
		require : [
			"morph",
			"transistor",
			"event_master",
			"suggest"
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
			verify         : define.with.verify  || false,
			suggest        : define.with.suggest || false
		}
	},

	define_event : function ( define ) {
		return [
			{ 
				called : "reset"
			},
			{ 
				called : "choose suggestion",
				that_happens : [
					{
						on : define.body.body,
						is : [ "click" ]
					}
				],
				only_if      : function ( heard ) {
					return heard.event.target.hasAttribute("data-shumput-choose-suggestion")
				}
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
				for       : "choose suggestion",
				that_does : function ( heard ) {
					
					var input_body, input_container, option_state, new_value

					if ( heard.event.target.parentElement.hasAttribute("data-shumput-choose-suggestion") ) {
						input_body = heard.event.target.parentElement.parentElement.parentElement.firstChild
					} else { 
						input_body = heard.event.target.parentElement.parentElement.firstChild
					}
					input_container    = input_body.parentElement
					option_state       = heard.state
					new_value          = heard.event.target.getAttribute("data-shumput-choose-suggestion")
					input_body.value   = new_value
					option_state.value = new_value

					input_container.removeChild( input_body.nextSibling )

					return heard
				}
			},
			{
				for       : "shumput input type",
				that_does : function ( heard ) {

					var input_node, option_state, input_container

					input_node         = heard.event.target
					input_container    = input_node.parentElement
					option_state       = heard.state
					option_state.value = input_node.value

					if ( option_state.suggest ) {

						if ( input_node.nextSibling !== null ) { 
							input_container.removeChild( input_node.nextSibling )
						}

						if ( input_node.value ) { 
							var matching_word_definition, suggested_body

							matching_word_definition = self.library.suggest.get_the_closest_matching_word_from_an_array({
								array         : option_state.suggest.list,
								searched_text : input_node.value
							})

							if ( matching_word_definition.length > 0 ) {
								suggested_body = self.library.transistor.make(
									self.define_suggest_list({
										class_name : define.class_name,
										list       : matching_word_definition
									})
								)
								suggested_body.append( input_container )
							}
						}
					}

					if ( option_state.verify  ) {

						var verification, text_body

						text_body = input_node.nextSibling

						if ( option_state.verify.when( input_node.value ) ) {

							verification            = option_state.verify.with( input_node.value )
							option_state.valid      = verification.is_valid
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

	define_suggest_list : function ( define ) { 
		return {
			"class" : define.class_name.suggest_container,
			"child" : this.library.morph.index_loop({
				subject : define.list,
				else_do : function ( loop ) {
					return loop.into.concat({
						"class"                          : define.class_name.suggest,
						"data-shumput-choose-suggestion" : loop.indexed.matching.word,
						"child" : [
							{ 
								"class"                          : define.class_name.suggest_text,
								"text"                           : loop.indexed.matching.leftover.before,
								"data-shumput-choose-suggestion" : loop.indexed.matching.word,
							},
							{ 
								"class"                          : define.class_name.suggest_text_match,
								"text"                           : loop.indexed.matching.text,
								"data-shumput-choose-suggestion" : loop.indexed.matching.word,
							},
							{ 
								"class"                          : define.class_name.suggest_text,
								"text"                           : loop.indexed.matching.leftover.after,
								"data-shumput-choose-suggestion" : loop.indexed.matching.word,
							}
						]
					})
				}
			})
		}
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