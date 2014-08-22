define({
	
	define : {
		require : [
			"morphism",
			"event_master",
			"transistor",
			"shumput"
		],
		allow : "*"
	},

	make : function ( define ) {
		var event_circle, body

		body = this.library.transistor.make(
			this.define_body(define)
		)

		event_circle = Object.create(this.library.event_master).make(
			this.define_event({
				node    : body.body,
				options : define.options 
			})
		)

		event_circle.add_listener(
			this.define_listener({
				class_name : define.class_name
			})
		)

		return { 
			get_state : function () { 
				return event_circle.get_state()
			},
			append : function ( append_to ) {
				body.append( append_to )
			},
		}
	},

	define_state : function ( define ) {
		var state
		state = { 
			value : define.with.option.value || define.with.option.choice[0]
		}
		if ( define.with.input && define.with.input.verify ) {
			state.verify  = define.with.input.verify
			state.show_on = define.with.input.show_on
		}

		return state
	},

	define_listener : function ( define ) {
		var self = this
		return [
			{
				for       : "keyswitch type",
				that_does : function ( heard ) {
					return self.library.shumput.input_type_listener({
						data_name  : "data-keyswitch-shumput",
						class_name : define.class_name.input,
						state      : heard.state,
						event      : heard.event
					})
				}
			},
			{
				for       : "keyswitch select",
				that_does : function ( heard ) {
					var option_state, value, button, wrap
					button             = heard.event.target
					wrap               = button.parentElement
					option_state       = heard.state.option[button.getAttribute("data-keyswitch")]
					value              = button.getAttribute("data-value")
					option_state.value = value
					button.setAttribute("class", define.class_name.item_selected )
					self.library.morphism.index_loop({
						array   : button.parentElement.children,
						else_do : function ( loop ) {
							if ( loop.indexed !== button ) { 
								loop.indexed.setAttribute("class", define.class_name.item )
							}
							return []
						}
					})
					if ( option_state.show_on ) { 
						wrap.nextSibling.style.display = ( option_state.show_on === value ? "block" : "none" )
					}
					return heard
				}
			}
		]
	},

	define_event : function ( define ) {
		return [
			{ 
				called       : "keyswitch type",
				that_happens : [
					{
						on : define.with.body,
						is : [ "keyup" ]
					}
				],
				only_if      : function ( heard ) { 
					return ( 
						heard.event.target.getAttribute("data-keyswitch-shumput")
					)
				}
			},
			{
				called       : "keyswitch select",
				that_happens : [
					{ 
						on : define.with.body,
						is : [ "click" ]
					}
				],
				only_if : function ( heard ) {
					return ( 
						heard.event.target.getAttribute("data-keyswitch") 
					)
				}
			}
		]
	},

	define_body : function ( define ) {
		var default_value, self
		self          = this
		default_value = define.with.option.value || define.with.option.choice[0]
		return {
			"class" : define.class_name.wrap,
			"child" : [
				{
					"class" : define.class_name.item_wrap,
					"child" : this.library.morphism.index_loop({
						array   : define.with.option.choice,
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
			].concat( define.with.input ?
				{
					"class"   : define.class_name.input_wrap,
					"display" : ( default_value === define.with.input.show_on ? "block" : "none" ),
					"child"   : [
						self.library.shumput.define_body({
							class_name  : define.class_name.input,
							with        : define.with.input,
							option_name : "keyswitch-shumput",
							name        : define.name
						})
					]
				} : 
				[]
			)
		}
	}
})