(function ( window, module ) {

	if ( window.define && window.define.amd ) {
		define(module)
	} else { 

		var current_scripts, this_script, module_name

		current_scripts     = document.getElementsByTagName("script")
		this_script         = current_scripts[current_scripts.length-1]
		module_name         = this_script.getAttribute("data-module-name") || "event"
		window[module_name] = module
	}
})( 
	window,
	{
		define : {
			allow   : "*",
			require : [],
		},
		
		define_state : function ( define ) {
			var default_value = define.with.option.value || define.with.option.choice[0]
			return { 
				show_on        : ( 
					define.with.input ? 
						define.with.input.show_on : 
						false
				),
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
		}
	}
)