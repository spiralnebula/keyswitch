define({
	
	define : {
		allow   : "*",
		require : [
			"morph",
			"event_master",
			"transistor",
			"shumput"
		],
	},

	make : function ( define ) {

		var keyswitch_body, event_circle

		keyswitch_body = this.library.transistor.make(
			this.define_body(define)
		)
		event_circle   = this.library.event_master.make({
			events : this.define_event({
				body : keyswitch_body,
				with : define.with 
			}),
			state  : this.define_state( define ),
		})

		event_circle.add_listener(
			this.define_listener( define )
		)

		return this.define_interface({
			body         : keyswitch_body,
			event_master : event_circle
		})
	},

	define_interface : function ( define ) {
		return {
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
			body      : define.body.body,
			append    : define.body.append,
		}
	},

	define_state : function ( define ) {
		var default_value = define.with.option.value || define.with.option.choice[0]
		return state = { 
			original_value : default_value,
			value          : default_value
		}
	},

	define_event : function ( define ) {
		return [
			{ 
				called : "reset"
			},
			{
				called       : "keyswitch select",
				that_happens : [
					{ 
						on : define.body.body,
						is : [ "click" ]
					}
				],
				only_if : function ( heard ) {
					return heard.event.target.hasAttribute("data-keyswitch")
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
					
					var wrap_node, button_wrap_node, button

					wrap_node        = heard.event.target
					button_wrap_node = wrap_node.firstChild
					button           = self.library.morph.index_loop({
						subject : button_wrap_node.children,
						into    : { 
							selected      : "",
							default_value : ""
						},
						else_do : function ( loop ) {
							if ( loop.indexed.getAttribute("data-value") === heard.state.value ) {
								console.log("the same yo")
								loop.into.selected = loop.indexed
							} 

							if ( loop.indexed.getAttribute("data-value") === heard.state.original_value ) {
								loop.into.default_value = loop.indexed
							}

							return loop.into
						}
					})

					if ( button.selected !== button.default_value ) {
						heard.state.value = heard.state.original_value
						button.selected.setAttribute("class", define.class_name.item )
						button.default_value.setAttribute("class", define.class_name.item_selected )
					}

					return heard
				}
			},
			{
				for       : "keyswitch select",
				that_does : function ( heard ) {

					var option_state, value, button, wrap

					button             = heard.event.target
					wrap               = button.parentElement
					option_state       = heard.state
					value              = button.getAttribute("data-value")
					option_state.value = value
					button.setAttribute("class", define.class_name.item_selected )
					self.library.morph.index_loop({
						subject : button.parentElement.children,
						else_do : function ( loop ) {
							if ( loop.indexed !== button ) { 
								loop.indexed.setAttribute("class", define.class_name.item )
							}
							return []
						}
					})
					return heard
				}
			}
		]
	},

	define_body : function ( define ) {

		var default_value, self

		self          = this
		default_value = define.with.option.value || define.with.option.choice[0]
		return {
			"class"            : define.class_name.wrap,
			"child"            : [
				{
					"class" : define.class_name.item_wrap,
					"child" : this.library.morph.index_loop({
						subject : define.with.option.choice,
						else_do : function ( loop ) {
							return loop.into.concat({
								"class"          : ( default_value === loop.indexed ? 
									define.class_name.item_selected :
									define.class_name.item
								),
								"data-value"     : loop.indexed,
								"data-keyswitch" : define.name,
								"text"           : loop.indexed
							})
						}
					})
				}
			]
		}
	}
})