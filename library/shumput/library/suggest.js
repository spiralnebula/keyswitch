(function ( window, module ) {

	if ( window.define && window.define.amd ) {
		define(module)
	} else { 

		var current_scripts, this_script, module_name

		current_scripts     = document.getElementsByTagName("script")
		this_script         = current_scripts[current_scripts.length-1]
		module_name         = this_script.getAttribute("data-module-name") || "suggest"
		window[module_name] = module
	}
})( 
	window,
	{ 
		define : { 
			allow   : "*",
			require : ["morph"]
		},

		get_the_closest_matching_word_from_an_array : function ( match ) {
			var self = this
			return this.library.morph.index_loop({
				subject : match.array,
				else_do : function ( loop ) {

					var matching_word_definition
					matching_word_definition = self.does_word_contain_any_part_of_the_searched_text_if_so_which({
						word          : loop.indexed,
						searched_text : match.searched_text
					})

					if ( matching_word_definition ) { 
						return loop.into.concat( matching_word_definition )
					} else { 
						return loop.into
					}
				}
			})
		},

		does_word_contain_any_part_of_the_searched_text_if_so_which : function ( given ) {

			var index_of_words_location, cut_of_word
			index_of_words_location = given.word.indexOf( given.searched_text )
			cut_of_word             = index_of_words_location + given.searched_text.length

			if ( index_of_words_location < 0 ) { 
				return false
			}

			return { 
				matching : { 
					range    : {
						from : index_of_words_location,
						to   : cut_of_word
					},
					word     : given.word, 
					text     : given.searched_text,
					leftover : {
						before : given.word.slice( 0, index_of_words_location ),
						after  : given.word.slice( cut_of_word )
					}
				}
			}	
		}
	}
)