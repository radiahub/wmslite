/*
 *
 	emoji.js : Minimal emoji/unicode converter
	version 1.0.0 2020-04-01 Denis
 *
 */

var emoji = {

	emoji_to_unicode : function(token)
	{
		//console.log("IN emoji.emoji_to_unicode()");
		//console.log(token);
		//console.log(token.length);
		var ucode;
		if (token.length === 1) {
			ucode = token.charCodeAt(0);
			//console.log(ucode);
			//console.log(ucode.toString("16"));
		}
		else {
			ucode = (
					(token.charCodeAt(0) - 0xD800) * 0x400
				+ (token.charCodeAt(1) - 0xDC00) + 0x10000
			);
			//console.log(ucode);
			if (ucode < 0) {
					ucode = token.charCodeAt(0);
			}
			//console.log(ucode);
		}			
		return ucode.toString("16");
	},

	unicode_to_emoji : function(ucode)
	{
		//console.log("IN emoji.unicode_to_emoji()");
		return String.fromCodePoint(parseInt (ucode, 16));
	},

	encode : function(text) 
	{
		console.log("IN emoji.encode()");
		console.log(text);
		var arr = Array.from(text);
		var res = arr.map(emoji.emoji_to_unicode);
		console.log(JSON.stringify(res));
		var encoded = payload_encode(res);
		console.log(encoded);
		return encoded;
	},

	decode : function(encoded) {
		//console.log("IN emoji.decode()");
		//console.log(encoded);
		var arr = payload_decode(encoded);
		var res = arr.map(emoji.unicode_to_emoji);
		//console.log(JSON.stringify(arr));
		var text = res.join("");
		return text;
	}

};


// End of file: emoji.js