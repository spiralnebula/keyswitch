define({
	
	define : {
		require : [
			"morphism",
			"event_master",
			"transistor"
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
		return { 
			value : define.with.option.value || define.with.option.choice[0]
		}
	},

	define_listener : function ( define ) {
		var self = this
		return [
			{
				for       : "keyswitch select",
				that_does : function ( heard ) {
					var option_state
					button             = heard.event.target
					option_state       = heard.state.option[button.getAttribute("data-keyswitch")]
					option_state.value = button.getAttribute("data-value")
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
					return heard
				}
			}
		]
	},

	define_event : function ( define ) {
		return [
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
			},
			// {
			// 	called       : "keyswitch_select",
			// 	that_happens : [
			// 		{
			// 			on : define.body,
			// 			is : [ "click" ]
			// 		}
			// 	],
			// 	only_if : function ( heard ) {
			// 		return ( heard.event.target.getAttribute("data-keyswitch-key") )
			// 	}
			// },
		]
	},

	define_body : function ( define ) {
		var self = this
		return {
			"class" : define.class_name.wrap,
			"child" : this.library.morphism.index_loop({
				array   : define.with.option.choice,
				else_do : function ( loop ) {
					return loop.into.concat({
						"class"          : define.class_name.item,
						"data-value"     : loop.indexed,
						"data-keyswitch" : define.name,
						"text"           : loop.indexed
					})
				}
			})
		}
	},

	define_option_state : function ( option ) {
		
		var default_value, state
		default_value = option.default_value || option.choice[0].value
		state = {
			chosen : default_value
		}
		if ( option.text ) { 
			state.text = {
				in_use  : ( option.text.shown_on === default_value ? true : false ),
				show_on : option.text.show_on,
				filter  : option.text.filter,
				content : option.text.default_value || "",
			}
		}
		return state
	},

	convert_text_to_option_name : function ( text ) { 
		return text.replace(/\s/g, "_").toLowerCase()
	},

	get_the_node_with_the_given_value : function ( given ) {
		return this.library.morphism.index_loop_base({
			array    : given.nodes,
			start_at : 0,
			into     : {},
			if_done  : function ( loop ) {
				return loop.into
			},
			else_do  : function ( loop ) {
				if ( loop.array[loop.start_at].getAttribute("data-value") === given.value ) {
					loop.into = loop.array[loop.start_at]
				}
				loop.start_at += 1
				return loop
			}
		})
	}
})