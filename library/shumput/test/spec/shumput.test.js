var model
model         = window.suggest
model.library = {
	"morph" : window.morph
}

describe("get the closest matching word from an array", function() {
	it("does just that", function() {
		expect(model.get_the_closest_matching_word_from_an_array({
			array           : [
				"somesome",
				"somealicious",
				"adjectsome",
				"stuff",
				"another thing",
				"some up the some"
			],
			searched_text  : "some"
		})).toEqual([
			"somesome",
			"somealicious",
			"some up the some"
		])	
	})
})

describe("does word contain any part of the searched text if so which", function() {
	
	it("it returns a word where there is a match", function() {

		expect(model.does_word_contain_any_part_of_the_searched_text_if_so_which({
			word          : "some",
			searched_text : "som"
		})).toEqual({
			matching : { 
				range : {
					from : 0,
					to   : 3
				},
				text     : "som",
				leftover : { 
					before : "",
					after  : "e"
				}
			}
		})

		expect(model.does_word_contain_any_part_of_the_searched_text_if_so_which({
			word          : "the somealicous",
			searched_text : "som"
		})).toEqual({
			matching : { 
				range : {
					from : 4,
					to   : 7
				},
				text     : "som",
				leftover : { 
					before : "the ",
					after  : "ealicous"
				}
			}
		})
	})

	it("returns an empty string when there is no match", function() {
		expect(model.does_word_contain_any_part_of_the_searched_text_if_so_which({
			word          : "some",
			searched_text : "giberish"
		})).toEqual(
			false
		)
	})
})