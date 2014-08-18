"use strict";
define({
	define : {
		allow : "*"
	},
	make   : function ( what ) {
		return {
			body   : what.body,
			append : function ( what ) {
				what.appendChild( this.body )
			}
		}
	}
})