// ============================================================================
// Module      : dialogs.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Basic dialogs
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 2-Feb-24 00:00:00 WIT Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

function toast(text, duration, btn_ok_caption, on_ok, on_timeout)
{
	//console.log("IN toast() text='" + text + "' duration=" + duration);

	var timer = null;

	if (typeof on_timeout     !== "function")  { on_timeout = noop; }
	if (typeof on_ok          !== "function")  { on_ok = noop; }
	if (typeof btn_ok_caption === "undefined") { btn_ok_caption = ""; on_ok = noop; }
	if (typeof duration       === "undefined") { duration = 3000; }

	var toast_id = rand_num_str(4);

	var cleanup = function() {
		jQuery("#CON_" + toast_id).remove();
	};
	
	var html = "";
	if (btn_ok_caption.length > 0) {
		html = file2bin("lib/html/toast.html");
	}
	else {
		html = file2bin("lib/html/toast_center.html");
	}

	html = str_replace("[toast_id]", toast_id, html);
	html = str_replace("[text]", text, html);
	html = str_replace("[btn_ok_caption]", btn_ok_caption, html);

	jQuery("body").append(html);

	if (duration > 0) {
		timer = setTimeout(
			function() {
				cleanup();
				on_timeout();
			},
			duration
		);
	}

	if (btn_ok_caption.length > 0) {
		jQuery("#BTN_OK_" + toast_id).off("click").on("click", function() {
			if (timer !== null) { clearTimeout(timer); }
			noripple("BTN_OK_" + toast_id, function() {
				cleanup();
				on_ok();
			});
		});
	}
}

function alert(text, title, btn_ok_caption, on_ok)
{
	//console.info("IN alert()");

	if (typeof on_ok !== "function") { on_ok = noop; }
	if (typeof btn_ok_caption === "undefined") { btn_ok_caption = "OK"; }

	if (typeof title === "undefined") { 
		var dummy = "";
		var lastpage = pages.last();
		if (lastpage !== null) {
			dummy = lastpage.options.page_id;
		}
		title = (dummy.length > 0) ? dummy : "Alert";
	}

	var alert_id = rand_num_str(4);

	text = str_replace("\n","<br>",text);

	var html = file2bin("lib/html/alert.html");
	html = str_replace("[alert_id]", alert_id,       html);
	html = str_replace("[title]",    title,          html);
	html = str_replace("[text]",     text,           html);
	html = str_replace("[ok]",       btn_ok_caption, html);

	application.disable_back_button_callback();

	jQuery("body").append(html);

	jQuery("#BTN_OK_" + alert_id).off("click").on("click", function(){
		noripple(this, function(){
			application.enable_back_button_callback();
			jQuery("#DIV_CON_" + alert_id).remove();
			on_ok();
		});
	});

}

function confirm(text, title, btn_ok_caption, btn_cancel_caption, on_ok, on_cancel)
{
	//console.info("IN confirm()");
	//PlayDefaultSounds.play();

	if (typeof on_cancel !== "function") { on_cancel = noop; }
	if (typeof on_ok !== "function") { on_ok = noop; }
	if (typeof btn_cancel_caption === "undefined") { btn_cancel_caption = "CANCEL"; }
	if (typeof btn_ok_caption === "undefined") { btn_ok_caption = "OK"; }

	var confirm_id = rand_num_str(4);

	text = str_replace("\n","<br>",text);

	var html = file2bin("lib/html/confirm.html");

	html = str_replace("[confirm_id]", confirm_id,         html);
	html = str_replace("[title]",      title,              html);
	html = str_replace("[text]",       text,               html);
	html = str_replace("[ok]",         btn_ok_caption,     html);
	html = str_replace("[cancel]",     btn_cancel_caption, html);

	application.disable_back_button_callback();

	jQuery("body").append(html);

	jQuery("#BTN_CANCEL_" + confirm_id).off("click").on("click", function(e){
		noripple(this, function(){
			application.enable_back_button_callback();
			jQuery("#DIV_CON_" + confirm_id).remove();
			on_cancel();
		});
	});

	jQuery("#BTN_OK_" + confirm_id).off("click").on("click", function(e){
		noripple(this, function(){
			application.enable_back_button_callback();
			jQuery("#DIV_CON_" + confirm_id).remove();
			on_ok();
		});
	});
}

// cast    : one of "string", "int", "float", "code" string values
// digits  : if (cast === "float"), number of applicable DECIMAL digits
//           if (cast === "code"), number of digits of the code (code length)
// password: "YES", "NO", if "YES" the input will be offuscated as password
//
function prompt(text, title, suggestions, value, cast, digits, password, btn_ok_caption, btn_cancel_caption)
{
	if (strlen(btn_cancel_caption) === 0) { btn_cancel_caption = R.get("cancel"); }
	if (strlen(btn_ok_caption) === 0) { btn_ok_caption = R.get("ok"); }
	if (strlen(password) === 0) { password = "NO"; }
	if (strlen(digits) === 0) { digits = 0; }
	if (strlen(cast) === 0) { cast = "string"; }
	if (strlen(value) === 0) { value = val.default(cast); }

	digits = parseInt(String(digits));

	return new Promise(
		(resolve, reject)=>{

			var prompt_id = rand_num_str(4);
			console.info("IN prompt() prompt_id='" + prompt_id + "'");


			var hide = function() 
			{
				console.info("IN prompt()->hide()");
				jQuery("#DIV_CON_" + prompt_id).remove();
			};


			var failed = function() 
			{
				console.info("IN prompt()->failed()");
				hide();
				reject();
			};


			var success = function() 
			{
				var result = jQuery("#INP_PROMPT_" + prompt_id).val();
				console.info("IN prompt()->success() result='" + result + "'");
				hide();
				resolve(result);
			};


			var get_result = function()
			{
				console.info("IN prompt()->get_result()");
				var value = jQuery("#INP_PROMPT_" + prompt_id).val();
				console.log(value);
				if (strlen(String(value)) > 0) {
					switch(cast.toUpperCase()) {

						case "NUM": case "FLOAT": {
							value = val.masked("INP_PROMPT_" + prompt_id, "float");
							if (isNaN(value)) { value = 0; }
							value = value / Math.pow(10, digits);
							success(value);
							break;
						}

						case "INTEGER": case "INT": {
							value = val.masked("INP_PROMPT_" + prompt_id, "int");
							if (isNaN(value)) { value = 0; }
							success(value);
							break;
						}

						case "CODE": {
							if (strlen(value) === digits) {
								success(value);
							}
							else {
								application.media("lib/mp3/negative.mp3");
								jQuery("#INP_PROMPT_" + prompt_id).focus();
							}
							break;
						}

						 case "STRING": default : {
							success(value);
							break;
						 }
					} 
				}
				else {
					application.media("lib/assets/mp3/negative.mp3");
					jQuery("#INP_PROMPT_" + prompt_id).focus();
				}
			};


			var onkeyup = function(e)
			{
				e.preventDefault();
				var pos = e.target.selectionStart - 1;
				//console.log(pos);
				jQuery(".code-digit").each(function(id,elt){
					if (jQuery(this).hasClass("border-accent")) {
						jQuery(this).removeClass("border-accent").addClass("border-light");
					}
				});

				jQuery(".code-digit").empty();
				var maxlength = parseInt(String(jQuery("#INP_PROMPT_" + prompt_id).attr("maxlength")));
				var caretpos  = ((pos + 1) >= maxlength) ? pos : pos + 1;
				input_cursor_to_pos("INP_PROMPT_" + prompt_id, caretpos);
				jQuery("#DIV_CODE_DIGIT_" + String(caretpos)).removeClass("border-light").addClass("border-accent");

				var st = jQuery("#INP_PROMPT_" + prompt_id).val();
				//console.log(st);
				for (var i = 0; i < st.length; i++) {
					var id = "DIV_CODE_DIGIT_" + String(i);
					jQuery("#" + id).html(String(st.slice(i, i + 1)));
				}

				if ( e.which === 13 ) {
					if (strcasecmp(cast, "CODE") === 0) {
						if (strlen(st) === maxlength) {
							jQuery("#INP_PROMPT_" + prompt_id).blur();
							get_result();
						}
					}
					else {
						jQuery("#INP_PROMPT_" + prompt_id).blur();
						get_result();
					}
				}
			};

			var onblur = function(e)
			{
				e.preventDefault();
				console.log("IN onblur()");
				jQuery(".code-digit").each(function(id,elt){
					if (jQuery(this).hasClass("border-accent")) {
						jQuery(this).removeClass("border-accent").addClass("border-light");
					}
				});
			};

			var onshow = function()
			{
				console.info("IN prompt()->onshow()");

				// DISPLAY EXISTING VALUE
				//
				if (strlen(String(value)) > 0) {
					console.log(cast.toUpperCase());
					switch (cast.toUpperCase()) {
						
						case "NUM": case "FLOAT": {
							value = parseFloat(String(value));
							console.log(value);
							jQuery("#INP_PROMPT_" + prompt_id).attr("type","tel");
							if ((value > 0) && (typeof inputmask === "function")) {
								var temp = number_format(value, digits, ".", ",");
								jQuery("#INP_PROMPT_" + prompt_id).val(temp);
								inputmask("INP_PROMPT_" + prompt_id, "", "float", digits);
							}
							break;
						}

						case "INT": case "INTEGER": {
							value = parseInt(String(value));
							jQuery("#INP_PROMPT_" + prompt_id).attr("type","tel");
							if ((value > 0) && (typeof inputmask === "function")) {
								var temp = number_format(value, 0, ".", ",");
								jQuery("#INP_PROMPT_" + prompt_id).val(temp);
								inputmask("INP_PROMPT_" + prompt_id, "", "int", 0);
							}
							break;
						}

						case "STRING": {
							if (strcasecmp(password,"YES") !== 0) {
								jQuery("#INP_PROMPT_" + prompt_id).val(value);
							}
							else {
								jQuery("#INP_PROMPT_" + prompt_id).val("");
							}
							break;
						}
					}
				}

				jQuery(".prompt_suggestion_" + prompt_id).off("click").on("click", function(){
					var me = this;
					ripple(this, function(){
						var text = trim(String(jQuery(me).text()));
						if (strlen(text) > 0) {
							jQuery("#INP_PROMPT_" + prompt_id).val(text);
							jQuery("#INP_PROMPT_" + prompt_id).focus();
						}
					});
				});

				jQuery("#BTN_CANCEL_" + prompt_id).off("click").on("click", function(){
					noripple(this, function(){
						failed();
					});
				});

				jQuery("#BTN_OK_" + prompt_id).off("click").on("click", function(){
					noripple(this, function(){
						get_result();
					});
				});

				jQuery("#INP_PROMPT_" + prompt_id).off("focus").on("focus", function(e){
					if (strcasecmp(cast,"CODE") === 0) {
						jQuery("#INP_PROMPT_" + prompt_id).val("");
					}
					onkeyup(e);
				});

				jQuery("#INP_PROMPT_" + prompt_id).off("blur").on("blur", function(e){
					onblur(e);
				});

				jQuery("#INP_PROMPT_" + prompt_id).off("keyup").on("keyup", onkeyup);
				jQuery("#INP_PROMPT_" + prompt_id).focus();
			};


			var show = function()
			{
				console.info("IN prompt()->show()");
				var html = file2bin("lib/html/prompt.html");
				//console.log(html);
				console.log("HTML IS " + strlen(html) + " CHARS LONG");

				if (strcasecmp(cast, "CODE") === 0) {
					html = str_erase_section(html, "<!-- DIV_NORMAL_INPUT", "<!-- END -->");
					if (digits === 0) { digits = 4; }
					var widthDigit = 2.2;
					var widthSep   = 0.5;
					var codeWidth  = (digits * widthDigit) + ((digits - 1) * widthSep);
					console.log(codeWidth);
					console.log(String(codeWidth));
					html = str_replace("[codeWidth]", codeWidth, html);
					//console.log(html);
				}
				else {
					html = str_erase_section(html, "<!-- DIV_CODE_INPUT", "<!-- END -->");
					var disc = (strcasecmp(password, "YES") === 0) ? 'disc' : 'none';
					console.log(disc);
					html = str_replace("[disc]", disc, html);
				}

				if (strlen(title) === 0) {
					title = "<i class=\"fa fa-keyboard-o h1\"></i>";
				}

				html = str_replace("[title]", title, html);
				
				if (strlen(suggestions) > 0) {

					console.log("Building suggestions section");
					
					var html_suggestions = "";
					var html_tpl_suggestion = str_section(html, "<!-- DIVTPL_SUGGESTIONS -->", "<!-- END -->");
					html_tpl_suggestion = str_replace("[prompt_id]", prompt_id, html_tpl_suggestion);

					suggestions = arrayOf(suggestions, "|");
					for (var i = 0; i < suggestions.length; i++) {
						if (strlen(suggestions[i]) > 0) {
							if (strlen(html_suggestions) > 0) { html_suggestions += "\n"; }
							html_suggestions += str_replace("[suggestion]", suggestions[i], html_tpl_suggestion);
						}
					}

					html = str_replace("[html_suggestions]", html_suggestions, html);

				}
				else {
					html = str_erase_section(html, "<!-- DIV_SUGGESTIONS", "<!-- END -->");
				}

				text = str_replace("\n", "<br>", text);

				html = str_replace("[text]",      text,               html);
				html = str_replace("[ok]",        btn_ok_caption,     html);
				html = str_replace("[cancel]",    btn_cancel_caption, html);
				html = str_replace("[prompt_id]", prompt_id,          html);

//console.log(html);

				jQuery("body").append(html);

				if (strcasecmp(cast, "CODE") === 0) {
					delay(100, function(){

						console.log(document.getElementById("DIVCONT_CODE_INPUT"));

						var htmlDigit = jQuery("#DIVTPL_CODE_DIGIT").html();
						var htmlSep   = jQuery("#DIVTPL_CODE_SEP").html();
						var htmlInput = jQuery("#DIVTPL_CODE_INPUT").html();
						htmlInput = str_replace("[digits]", String(digits), htmlInput);

						for (var i = 0; i < digits; i++) {
							var tmpHtml = str_replace("[digit]", i, htmlDigit);
							jQuery("#DIVCONT_CODE_INPUT").append(tmpHtml);
							if (i < digits - 1) {
								jQuery("#DIVCONT_CODE_INPUT").append(htmlSep);
							}
						}

						//console.log(tmpHtml);

						jQuery("#DIVCONT_CODE_INPUT").append(htmlInput);
						onshow();
					});
				}
				else {
					onshow();
				}

			};

			show();
		}
	);
}


// End of file: dialogs.js
// ============================================================================