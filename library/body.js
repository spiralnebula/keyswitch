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

		define_default_class_names : function () {
			return { 
				"wrap"          : "radio_wrap",
				"label"         : "radio_label",
				"items_wrap"    : "radio_items_wrap",
				"item_wrap"     : "radio_item_wrap",
				"item_box_wrap" : "radio_item_box_wrap",
				"item_box"      : "radio_item_box",
				"item_selected" : "radio_item_selected",
				"item"          : "radio_item",
			}
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
				"class" : define.class_name.items_wrap,
				"child" : this.library.morph.index_loop({
					subject : define.with.option.choice,
					else_do : function ( loop ) {

						var option_is_selected, content

						option_is_selected = ( default_value.indexOf( loop.indexed ) > -1 )
						content            = []
						content            = content.concat(
							self.define_item_checkbox({
								class_name : define.class_name
							})							
						)
						content            = content.concat(
							self.define_item_text({
								class_name    : define.class_name,
								item_selected : ( default_value.indexOf( loop.indexed ) > -1 ),
								value         : loop.indexed
							})
						)

						return loop.into.concat({
							"class" : define.class_name.item_wrap,
							"child" : content
						})
					}
				})
			})

			return {
				"class" : define.class_name.wrap,
				"child" : content
			}
		},

		define_item_checkbox : function ( define ) {
			return { 
				"class" : define.class_name.item_box_wrap,
				"child" : [
					{
						"class" : define.class_name.item_box,
					}
				],
			}
		},

		define_item_text : function ( define ) {
			return {
				"class"          : ( define.item_selected ? 
					define.class_name.item_selected :
					define.class_name.item
				),
				"data-selected"  : (
					define.item_selected ? 
						"true" :
						"false"
				),
				"data-value"     : define.value,
				"data-keyswitch" : "true",
				"text"           : define.value
			}
		},
	}
)