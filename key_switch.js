define({
	
	define : {
		require : [
			"morphism",
			"event_master",
			"node_maker"
		],
		allow : "*"
	},

	make : function ( define ) {
		var event_circle, body_node

		body_node = this.library.node_maker.make_node(
			this.define_body(define)
		)

		event_circle = Object.create(this.library.event_master).make(
			this.define_events({
				node    : body_node.node,
				options : define.options 
			})
		)

		event_circle.add_listener(
			this.define_event_listeners({
				class_name          : define.class_name
			})
		)

		return { 
			get_state : function () { 
				return event_circle.get_state()
			},
			append : function ( append_to ) { 
				body_node.append( append_to )
			},
		}
	},

	define_body : function ( define ) {

		var self = this
		return {
			type : "div",
			attribute : {
				"class" : define.class_name.main
			},
			children : this.library.morphism.index_loop({
				array : define.options,
				else_do : function ( loop ) { 
					return loop.into.concat(self.define_option({
						option       : loop.indexed,
						class_name   : define.class_name
					}))
				}
			})
		}
	},

	define_option : function ( define ) {

		return {
			type      : "div",
			attribute : {
				"class" : define.class_name.wrap
			},
			children  : this.library.morphism.index_loop({
				array   : define.option.choice,
				into    : [
					{
						type       : "div",
						attribute : {
							"class" : define.class_name.option_title
						},
						property : {
							textContent : define.option.title
						}
					}
				],
				if_done : function ( loop ) {
					if ( define.option.text ) { 
						return loop.into.concat({
							type : "div",
							attribute : { 
								"class"            : define.class_name.option_input_wrap,
							},
							style     : { 
								"display" : ( 
									define.option.text.show_on === define.option.default_value ?
										"block" : 
										"none" 
								),
							},
							children : [
								{
									type      : "input",
									attribute : { 
										"class"            : define.class_name.option_input,
										"placeholder"      : define.option.text.placeholder,
										"data-input"       : "true",
										"data-option-name" : define.option.name
									}
								},
								{
									type      : "div",
									style     : { 
										// "display" : "none"
									},
									attribute : { 
										"class"  : define.class_name.option_input_notification,
									},
									property : { 
										textContent : ""
									}
								},

							]
						})
					} else { 
						return loop.into
					}
				},
				else_do : function ( loop ) {

					return loop.into.concat({
						type      : "div",
						attribute : {
							"class"      : ( 
								define.option.default_value === loop.indexed.value ? 
									define.class_name.active_option :
									define.class_name.option
							),
							"data-value"       : loop.indexed.value,
							"data-option-name" : define.option.name
						},
						property : { 
							textContent : loop.indexed.text
						}
					})
				}
			}),
		}
	},

	define_events : function ( define ) {
		var self
		self          = this
		return {
			state : this.library.morphism.index_loop({
				array   : define.options,
				into    : {},
				else_do : function ( loop ) { 
					
					var default_option_value
					default_option_value = loop.indexed.default_value || loop.indexed.choice[0].value
					loop.into[loop.indexed.name] = {
						text           : ( loop.indexed.text ? loop.indexed.text.default_value : "" ),
						chosen_text    : default_option_value,
						filter         : ( loop.indexed.text ? loop.indexed.text.filter : false ),
						show_on        : ( loop.indexed.text ? loop.indexed.text.show_on : false ),
						use_input_text : (
							loop.indexed.text && loop.indexed.text.shown_on === default_option_value ?
								true :
								false
						),
						chosen_node    : self.get_the_node_with_the_given_value({
							nodes : define.node.children[loop.index].children,
							value : loop.indexed.default_value
						})
					}

					return loop.into
				}
			}),
			events : [
				{
					called       : "input_type",
					that_happens : [
						{ 
							on : define.node,
							is : [ "keyup" ]
						}
					],
					only_if : function ( heard ) { 
						return ( heard.event.target.getAttribute("data-input") )
					}
				},
				{
					called       : "click",
					that_happens : [
						{
							on : define.node,
							is : [ "click" ]
						}
					],
					only_if : function ( heard ) {
						return ( heard.event.target.getAttribute("data-value") )
					}
				},
			]
		}
	},

	define_event_listeners : function ( define ) {
		return [
			{
				for       : "input_type",
				that_does : function ( heard ) {
					
					var option_state  = heard.state[heard.event.target.getAttribute("data-option-name")]
					option_state.text = heard.event.target.value

					if ( option_state.filter.is_ready_for_validation.call({}, ( heard.event.target.value ) ) ) { 
						var filter
						filter = option_state.filter.is_valid( heard.event.target.value )
						heard.event.target.nextSibling.textContent = filter.text
						if ( filter.is_valid ) {
							heard.event.target.nextSibling.setAttribute("class", define.class_name.option_input_valid)
							heard.event.target.nextSibling.style.display = "block"
						} else { 
							heard.event.target.nextSibling.style.display = "block"
							heard.event.target.nextSibling.setAttribute("class", define.class_name.option_input_invalid)
						}
					} else { 
						heard.event.target.nextSibling.style.display = "none"
					}
					return heard
				}
			},
			{
				for       : "click",
				that_does : function ( heard ) {
					
					var option_state = heard.state[heard.event.target.getAttribute("data-option-name")]

					if ( option_state.chosen_node !== false && option_state.chosen_node !== heard.event.target ) {
						option_state.chosen_node.setAttribute("class", define.class_name.option )
					}

					if ( heard.event.target !== option_state.chosen_node ) {
						option_state.chosen_node = heard.event.target
						option_state.chosen_text = heard.event.target.getAttribute("data-value")
						option_state.chosen_node.setAttribute("class", define.class_name.active_option )

					}

					if ( option_state.show_on !== false ) {
						if ( option_state.chosen_text === option_state.show_on ) { 
							heard.event.target.parentElement.lastChild.style.display = "block"
							option_state.use_input_text = true
						} else {
							heard.event.target.parentElement.lastChild.style.display = "none"
							option_state.use_input_text = false
						}
					}

					return heard
				}
			}
		]
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