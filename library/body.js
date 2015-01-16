(function ( window, module ) {

	if ( window.define && window.define.amd ) {
		define(module)
	} else { 

		var current_scripts, this_script, module_name

		current_scripts     = document.getElementsByTagName("script")
		this_script         = current_scripts[current_scripts.length-1]
		module_name         = this_script.getAttribute("data-module-name") || "body"
		window[module_name] = module
	}
})( 
	window,
	{
		define : {
			allow   : "*",
			require : [
				"morph"
			],
		},

		define_body : function ( define ) {

			var default_value, self, content

			self          = this
			default_value = define.with.option.value || define.with.option.choice[0]
			content       = []

			if ( define.with.label ) { 
				content = content.concat({
					"class" : define.class_name.label,
					"text"  : define.with.label.text					
				})
			}

			content = content.concat({
				"class" : define.class_name.item_wrap,
				"child" : this.library.morph.index_loop({
					subject : define.with.option.choice,
					else_do : function ( loop ) {
						return loop.into.concat({
							"class"          : ( default_value === loop.indexed ? 
								define.class_name.item_selected :
								define.class_name.item
							),
							"data-selected"  : "false",
							"data-value"     : loop.indexed,
							"data-keyswitch" : "true",
							"text"           : loop.indexed
						})
					}
				})
			})

			return {
				"class"            : define.class_name.wrap,
				"child"            : content
			}
		},
	}
)