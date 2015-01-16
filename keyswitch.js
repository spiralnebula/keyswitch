define({
	
	define : {
		allow   : "*",
		require : [
			"morph",
			"event_master",
			"transistor",
			"shumput",
			"body",
			"event",
			"listener",
		],
	},

	make : function ( define ) {

		var keyswitch_body, event_circle, shumput_part, default_value

		default_value  = define.with.option.value || define.with.option.choice[0]
		keyswitch_body = this.library.transistor.make(
			this.define_body(define)
		)
		
		if ( define.with.input ) {

			shumput_part = this.library.shumput.make({
				class_name : define.class_name.input,
				with       : define.with.input.with
			})

			if ( define.with.input.show_on === default_value ) {
				shumput_part.body.style.display = "block"
			} else {
				shumput_part.body.style.display = "none"
			}
			shumput_part.append( keyswitch_body.body )
			
		}
		
		event_circle   = this.library.event_master.make({
			events : this.define_event({
				body : keyswitch_body,
				with : define.with 
			}),
			state  : this.define_state( define ),
		})

		event_circle.add_listener(
			this.define_listener({
				class_name : define.class_name,
				with       : define.with,
				given      : define.given || {},
				shumput    : shumput_part
			})
		)

		return this.define_interface({
			body              : keyswitch_body,
			event_master      : event_circle,
			get_shumput_state : ( shumput_part ? shumput_part.get_state : false )
		})
	},

	define_interface : function ( define ) {
		return {
			get_state : function () {
				if ( define.get_shumput_state !== false ) {
					var input_state, keyswitch_state
					keyswitch_state = define.event_master.get_state()
					input_state     = define.get_shumput_state()
					return { 
						option : input_state,
						input  : keyswitch_state,
						value  : ( 
							keyswitch_state.value === keyswitch_state.show_on ?
								input_state.value :
								keyswitch_state.value
						)
					}
				} else { 
					return define.event_master.get_state()
				}
			},
			reset : function () {
				if ( define.shumput ) { 
					define.shumput.reset()
				}
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
			body   : define.body.body,
			append : function ( to_what ) {
				define.body.append( to_what )
			},
		}
	},

	define_state : function ( define ) {
		return this.library.event.define_state( define )
	},

	define_event : function ( define ) {
		return this.library.event.define_event( define )
	},

	define_listener : function ( define ) {
		return this.library.listener.define_listener( define )
	},

	define_body : function ( define ) {
		return this.library.body.define_body( define )
	}
})