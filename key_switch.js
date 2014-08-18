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

	define_body : function ( define ) {

		var self = this
		return {
			"class" : define.class_name.main,
			child   : this.library.morphism.index_loop({
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
		var name
		name = this.convert_text_to_option_name( define.option.title )
		return {
			"class" : define.class_name.wrap,
			child   : this.library.morphism.index_loop({
				array   : define.option.choice,
				into    : [
					{
						"class" : define.class_name.option_title,
						"text"  : define.option.title
					}
				],
				if_done : function ( loop ) {
					if ( define.option.text ) {
						return loop.into.concat({
							"class"   : define.class_name.option_input_wrap,
							"display" : ( 
								define.option.text.show_on === define.option.default_value ?
									"block" : 
									"none" 
							),
							child : [
								{
									type                   : "input",
									"class"                : define.class_name.option_input,
									"placeholder"          : define.option.text.placeholder,
									"data-input"           : "true",
									"data-keyswitch-name"  : name,
									"data-keyswitch-input" : "true",
								},
								{
									"class" : define.class_name.option_input_notification,
									"text"  : ""
								},
							]
						})
					} else { 
						return loop.into
					}
				},
				else_do : function ( loop ) {

					return loop.into.concat({
						"class"      : ( 
							define.option.default_value === loop.indexed.value ? 
								define.class_name.active_option :
								define.class_name.option
						),
						"data-value"          : loop.indexed.value,
						"data-keyswitch-name" : name,
						"data-keyswitch-key"  : "true",
						"text"                : loop.indexed.text
					})
				}
			}),
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

	define_event : function ( define ) {
		return [
			{
				called       : "keyswitch_text_type",
				that_happens : [
					{ 
						on : define.body,
						is : [ "keyup" ]
					}
				],
				only_if : function ( heard ) { 
					return ( heard.event.target.getAttribute("data-keyswitch-input") )
				}
			},
			{
				called       : "keyswitch_select",
				that_happens : [
					{
						on : define.body,
						is : [ "click" ]
					}
				],
				only_if : function ( heard ) {
					return ( heard.event.target.getAttribute("data-keyswitch-key") )
				}
			},
		]
	},

	define_listener : function ( define ) {
		var self = this
		return [
			{
				for       : "keyswitch_text_type",
				that_does : function ( heard ) {

					var option_state, option_name, option_value, node, info_text
					node         = heard.event.target
					option_name  = heard.event.target.getAttribute("data-keyswitch-name")
					option_value = node.value
					option_state = heard.state.option[option_name]
					option_state.text.content = option_value
					if ( option_state.text.filter ) {
						var feedback, info_text
						info_text = node.nextSibling
						if ( option_state.text.filter.is_ready_for_validation.call( {}, option_value ) ) {
							feedback                = option_state.text.filter.is_valid( option_value )
							info_text.style.display = "block"
							info_text.textContent   = feedback.text
							info_text.setAttribute("class", (
								feedback.is_valid ?
									define.class_name.option_input_valid :
									define.class_name.option_input_invalid
							))
						} else { 
							info_text.style.display = "none"		
						}
					}

					return heard
				}
			},
			{
				for       : "keyswitch_select",
				that_does : function ( heard ) {

					var option_state, option_name, option_value, node, old_node
					node         = heard.event.target
					option_name  = heard.event.target.getAttribute("data-keyswitch-name")
					option_value = heard.event.target.getAttribute("data-value")
					option_state = heard.state.option[option_name]
					old_node     = []

					if ( option_value !== option_state.chosen ) {
						old_node = self.get_the_node_with_the_given_value({
							nodes : node.parentElement.children,
							value : option_state.chosen
						})
						old_node.setAttribute("class", define.class_name.option )
						node.setAttribute("class", define.class_name.active_option )
						option_state.chosen = option_value
					}

					if ( option_state.text ) { 
						if ( option_value === option_state.text.show_on ) { 
							node.parentElement.lastChild.style.display = "block"
						} else { 
							node.parentElement.lastChild.style.display = "none"
						}
					}

					return heard
				}
			}
		]
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