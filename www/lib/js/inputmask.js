// onchange     : function(val){...}
// onkeypressed : function(val){...}
//
function inputmask(itemID, mask, cast, decimals, onchange, onkeypressed)
{
	if (typeof onkeypressed === "undefined") { onkeypressed = noop; }
	if (typeof onchange === "undefined") { onchange = noop; }

	switch(cast.toLowerCase()) {

		case "int" : case "integer" : {

			let mask = "#,##0";
			let myoptions = {};
			myoptions["reverse"   ] = true;
			myoptions["onChange"  ] = onchange;
			myoptions["onKeyPress"] = onkeypressed;
			jQuery("#" + itemID).mask(mask, myoptions);
			break;
		}

		case "num" : case "float" : {

			let mask = "#,##0";
			if (decimals > 0) {
				mask += "." + str_concat("0", decimals);
			}
			let myoptions = {};
			myoptions["reverse"   ] = true;
			myoptions["onChange"  ] = onchange;
			myoptions["onKeyPress"] = onkeypressed;
			jQuery("#" + itemID).mask(mask, myoptions);
			break;
		}

		case "phone" : case "tel" : {
				
			let myoptions = {
				onChange   : onchange,
				onKeyPress : function (val, event, field, options) {
   				var masks = ['000 000-00000', '000 0000-000000'];
   				var mask  = (val.length > 11) ? masks[1] : masks[0];
   				jQuery("#" + itemID).mask(mask, options);
					onkeypressed(val);
				}
			};
			let value = jQuery("#" + itemID).val();
			if (value.length > 9) {
				jQuery("#" + itemID).mask("000 0000-000000", myoptions);
			}
			else {
				jQuery("#" + itemID).mask("000 000-000", myoptions);
			}
			break;
		}

		case "code" : {
			let myoptions = {};
			myoptions["translation"] = { '#': { pattern: /[0-9]/, optional: false } };
			myoptions["onChange"   ] = onchange;
			myoptions["onKeyPress" ] = onkeypressed;
			jQuery("#" + itemID).mask(mask, myoptions);
			break;
		}

		default : {

			let myoptions = {};
			myoptions["onChange"  ] = onchange;
			myoptions["onKeyPress"] = onkeypressed;
			jQuery("#" + itemID).mask(mask, myoptions);
			break;
		} 
	}

}


function uncode (value, keep)
{
	if (typeof keep === "undefined") { keep = ST_NUM; }
	value = value.toString();
	var result = "";

	for (var i = 0; i < value.length; i++) {
		var c = value.substr(i,1);
		if (keep.indexOf(c) >= 0) {
			result += c;
		}
	}

	return result;
}


function inputfield(fieldname, value, eltIDToScrollOnFocus)
{
	if (typeof eltIDToScrollOnFocus === "undefined") { eltIDToScrollOnFocus = ""; }
	if (typeof value === "undefined") { value = ""; }

	console.log("IN inputfield() fieldname='" + fieldname + "' eltIDToScrollOnFocus='" + eltIDToScrollOnFocus + "' ");

	var type="text", decimals = 0;

	try {
		type = jQuery("label[for='" + fieldname + "']").data("type");
		if (typeof type === "undefined") {
			type = jQuery("#" + fieldname).attr("type");
		}
	}
	catch(e) {
		type = jQuery("#" + fieldname).attr("type");
	}

	type = String(type);
	type = type.toUpperCase();

	var p = type.indexOf(":");
	if (p > 0) {
		var tail = type.substr(p + 1);
		type = type.substr(0, p);
		decimals = parseInt(tail);
	}

	switch(type) {

		case "INT" : case "INTEGER" : {
			jQuery("#" + fieldname).attr("type", "tel");
			try {
				value = parseInt(value);
				if (value > 0) {
					jQuery("#" + fieldname).val(value);
				}
				else {
					jQuery("#" + fieldname).val("");
				}
			}
			catch(e) {
				jQuery("#" + fieldname).val(value);
			}
			inputmask(fieldname, "", "int", 0);
			break;
		}

		case "FLOAT" : case "NUM" : {
			jQuery("#" + fieldname).attr("type", "tel");
			try {
				value = str_replace(",", "", String(value));
				value = parseFloat(value);
				if (value > 0) {
					if (decimals > 0) {
						value = value * Math.pow(10, decimals);
					}
					jQuery("#" + fieldname).val(value);
				}
				else {
					jQuery("#" + fieldname).val("");
				}
			}
			catch(e) {
				jQuery("#" + fieldname).val(value);
			}
			inputmask(fieldname, "", "float", decimals);
			break;
		}

		case "TEL": {
			if (value.substr(0, ST_PHONE_CTRY_CODE.length) === ST_PHONE_CTRY_CODE) {
				value = value.substr(ST_PHONE_CTRY_CODE.length);
			}
			else {
				var test = "+" + ST_PHONE_CTRY_CODE;
				if (value.substr(0, test.length) === test) {
					value = value.substr(test.length);
				}
			}
			jQuery("#" + fieldname).attr("type", "tel");
			jQuery("#" + fieldname).val(value);
			inputmask(fieldname, "", "phone", 0);
			break;
		}

		case "CODE" : {

			var mask = "";
			try {
				mask = jQuery("label[for='" + fieldname + "']").data("mask");
			}
			catch(e) {
				try {
					mask = jQuery("#" + fieldname).data("mask");
				}
				catch(f) {
					mask = str_concat("0",16);
				}
			}

			jQuery("#" + fieldname).attr("type", "tel");
			if (value.length > 0) {
				jQuery("#" + fieldname).val(value);
			}
			else {
				jQuery("#" + fieldname).val("");
			}
			inputmask(fieldname, mask, "code", 0);
			break;
		}

		case "MULTILINE": {
			var buffer = str_replace("\n", "<br>", value);
			jQuery("#" + fieldname).html(buffer);
			move_cursor_to_end(fieldname);
			break;
		}

		default: {
			jQuery("#" + fieldname).attr("type", "TEXT");
			jQuery("#" + fieldname).val(value);
			break;
		}
	}

	if (strlen(eltIDToScrollOnFocus) > 0) {
		new keepVisibleOnFocus(fieldname, eltIDToScrollOnFocus);
	}

}


function str_format(value, mask, cast, decimals)
{
	if (typeof decimals === "undefined") { decimals = 0; }
	if (typeof cast === "undefined") { cast = "string"; }

	//console.log(value);
	//console.log(cast,decimals);

	switch(cast) {

		case "num": case "float": {

			//console.log("IN cast=float");
			value = String(value);
			value = str_replace(",", "", value);
			//console.log(value);

			if (strlen(value) > 0) {
				if (decimals > 0) {
					var expressedValueDecimals = 0;
					var p = value.indexOf(".");
					//console.log(p);
					if (p >= 0) {
						var expressedValueDecimals = strlen(value) - 1 - p;
						//console.log(expressedValueDecimals);
						if (expressedValueDecimals > decimals) {
							var extraDigitsCount = expressedValueDecimals - decimals;
							//console.log(extraDigitsCount);
							var newlen = strlen(value) - extraDigitsCount;
							value = value.substr(0, newlen);
							//console.log(value);
						}
						else if (expressedValueDecimals < decimals) {
							var extraNeededZeros = decimals - expressedValueDecimals;
							value += str_concat("0",extraNeededZeros);
						}
					}
					else {
						value += "." + str_concat("0",decimals);
						//console.log(value);
					}

					//console.log(value);

					value = parseFloat(value);
					value = Math.floor(value * Math.pow(10, decimals));
					//console.log(value);
				}
			}

			//console.log(value);
			break;
		}
	}

	var itemID = rand_num_str(4);

	var div = makeFakeCssDiv();
	jQuery(div).attr("id", "div_" + itemID);

	let html = '<input id="inp_{itemID}" type="text" name="inp_{itemID}" value="{value}">'

	html = str_replace("{itemID}", itemID, html);
	html = str_replace("{value}",  String(value),  html);
	//console.log(html);

	var str = "";

	jQuery("#div_" + itemID).html(html);
	inputmask("inp_" + itemID, mask, cast, decimals);

	try {
	//console.log("IN TRY");
		str = jQuery("#inp_" + itemID).masked();
	//console.log(str);
	//console.log("TRY OK str='" + str + "'");
	}
	catch(err) {
	//console.log("IN CATCH");
		str = jQuery("#inp_" + itemID).val();
	//console.log("TRY ERROR str='" + str + "'");
	}

	jQuery(div).remove();
	return str;
}


function str_msisdn_format(value)
{
	var st = msisdn.format(String(value));
	st = st.substr(ST_PHONE_CTRY_CODE.length);
	//console.log(st);
	st = "+" + ST_PHONE_CTRY_CODE + " " + str_format(st, "", "phone", 0);
	//console.log(st);
	return st;
}


// End of file: inputmask.js
