(function ( window, module ) {

	if ( window.define && window.define.amd ) {
		define(module)
	} else { 

		var current_scripts, this_script, module_name

		current_scripts     = document.getElementsByTagName("script")
		this_script         = current_scripts[current_scripts.length-1]
		module_name         = this_script.getAttribute("data-module-name") || "listener"
		window[module_name] = module
	}
})( 
	window,
	{
		define : {
			allow   : "*",
			require : [],
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

						if ( define.with.input ) {
							
							var input_node
							input_node = wrap_node.lastChild

							if ( define.with.input.show_on === heard.state.original_value ) {
								input_node.style.display = "block"
							} else { 
								input_node.style.display = "none"
							}
						}
						
						if ( define.shumput ) { 
							define.shumput.reset()
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

						if ( define.with.input ) { 
							
							var input_wrap_node
							input_wrap_node = wrap.nextSibling

							if ( button.getAttribute("data-value") === define.with.input.show_on ) {

								input_wrap_node.style.display = "block"

								console.log( input_wrap_node )
							} else { 
								input_wrap_node.style.display = "none"
							}
						}

						return heard
					}
				}
			]
		},
	}
)