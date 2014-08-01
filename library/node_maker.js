define({

	define : { 
		allow : "*"
	},

	make_node : function (define) {

		var node, changes

		changes = {}
		node    = document.createElement(define.type)

		if ( define.style ) {
			changes.style = this.set_node({
				object : node.style,
				type   : "property",
				to     : define.style
			})
		}
		if ( define.property ) {
			changes.property = this.set_node({
				object : node,
				type   : "property",
				to     : define.property
			})
		}
		if ( define.attribute ) {
			changes.attribute = this.set_node({
				object : node,
				type   : "attribute",
				to     : define.attribute
			})
		}
		if ( define.children ) {
			changes.children = this.make_multiple_nodes({
				from     : define.children,
				start_at : 0,
				into     : [],
				for      : node
			})
		}
		return {
			changes  : changes,
			node     : node,
			append   : function (to) {
				return to.appendChild(node)
			},
		}
	},

	make_multiple_nodes : function (nodes) {

		if ( nodes.start_at >= nodes.from.length ) {
			return nodes.into
		} else {
			var new_make = this.make_node(nodes.from[nodes.start_at])
			nodes.into.push(new_make)
			new_make.append(nodes.for)
			nodes.start_at += 1
			return this.make_multiple_nodes(nodes)
		}
	},

	set_node : function (what) {

		var self = this

		return this.homomorph({
			object : what.to,
			with   : function (member) {
				return self.set_node_methods[what.type]({
					object : what.object,
					name   : member.property_name,
					value  : member.value,
				})
			}
		})
	},

	set_node_methods : {
		property : function (style) {
			style.object[style.name] = style.value
			return style.value
		},
		attribute : function (attribute) {
			attribute.object.setAttribute(attribute.name, attribute.value)
			return attribute.value
		}
	},

	homomorph : function (what) {
		var set = {}
		for ( var property in what.object ) {
			if ( what.object.hasOwnProperty(property) ) {
				set[property] = what.with.call({}, {
					value         : what.object[property],
					property_name : property,
					set           : set,
				})
			}
		}
		return set
	},

})