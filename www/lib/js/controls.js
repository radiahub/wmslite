// ============================================================================
// Module      : controls.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Application support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 2-Feb-24 00:00:00 WIT Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
//
// COMMON API
//
// ****************************************************************************
// ****************************************************************************

function ripple(element, callback, duration)
{
	//console.info("IN ripple()");
	//console.log(JSON.stringify(element));
	
	if (typeof duration === "undefined") { duration = 300;  }
	if (typeof callback !== "function" ) { callback = noop; }

	if (typeof element === "string") {
		//console.log("Element object identifier found");
		element = document.getElementById(element);
	}
	else {
		element = jQuery(element).get(0); // In case of "this", for instance
	}

	//console.log(jQuery(element).attr("id"));

	if ((strcasecmp(element.tagName, "SPAN") === 0) && jQuery(element).hasClass("link")) {

		duration = 200;

		//console.log("SPAN CLICKED");

		if (typeof nativeclick !== "undefined") {
			nativeclick.trigger();
		}

		jQuery(element).addClass("underline");

		setTimeout(
			function(){
				jQuery(element).removeClass("underline");
				callback();
			}, 
			duration
		);

	}
	else {

		if (! jQuery(element).hasClass("overflow-none")) {
			jQuery(element).addClass("overflow-none");
		}

		var _ripple = element.getElementsByClassName("ripple")[0];
		if (_ripple) {
			//console.log("Remove previous object with class ripple");
			_ripple.remove();
		}

		var circle   = document.createElement("span");
		var diameter = Math.max(element.clientWidth, element.clientHeight);
		var radius   = (diameter / 2) + 2;

		circle.style.width = circle.style.height = `${diameter}px`;
		circle.style.left  = `${(element.clientWidth  / 2) - radius - 1 }px`;
		circle.style.top   = `${(element.clientHeight / 2) - radius - 1 }px`;
		circle.style.zIndex = 5;

		circle.classList.add("ripple"); 

		if (typeof nativeclick !== "undefined") {
			nativeclick.trigger();
		}

		element.appendChild(circle);
		
		setTimeout(
			function(){
				element.getElementsByClassName("ripple")[0].remove();
				callback();
			}, 
			duration
		);

	}

}

function noripple(element, callback)
{
	//console.info("IN noripple()");
	if (typeof nativeclick !== "undefined") {
		nativeclick.trigger();
	}
	callback();
}

function rippleclass(element, callback, duration)
{
	//console.info("IN rippleclass()");
	//console.log(JSON.stringify(element));

	if (typeof duration === "undefined") { duration = 200;  }
	if (typeof callback !== "function" ) { callback = noop; }

	if (typeof element === "string") {
		//console.log("Element object identifier found");
		element = document.getElementById(element);
	}
	else {
		element = jQuery(element).get(0); // In case of "this", for instance
	}
	//console.log(jQuery(element).attr("id"));

	if (typeof nativeclick !== "undefined") {
		nativeclick.trigger();
	}

	jQuery(element).addClass("ripple");
	setTimeout(
		function(){
			jQuery(element).removeClass("ripple");
			callback();
		}, 
		duration
	);

}

function klik()
{
	if (typeof nativeclick !== "undefined") {
		nativeclick.trigger();
	}
}

function longtap(options) 
{
	var that = this;
	this.options = {
		eltID      : "",                  // DOM ID of the target element
		duration   : 300,                 // Minimum long tap duration
		onlongtap  : function (event) {}, // Callback fired on long completed
		onshorttap : function (event) {}  // Callback fired on short tap only
	};

	for (var i in options) { this.options[i] = options[i]; }

	this.obj = document.getElementById(that.options.eltID);

	this.event_time_start = 0;
	this.event_name_start = isTouchSupported ? 'touchstart' : 'mousedown';
	this.event_name_end   = isTouchSupported ? 'touchend'   : 'mouseup';

	this.on_event_end = function (e)
	{
		that.clear();
		e.stopPropagation();
		e.preventDefault();
		var duration = (new Date().getTime() - that.event_time_start);
		if (duration >= that.options.duration) {
			jQuery("#"+that.options.eltID).removeClass("ripple");
			that.options.onlongtap(e);
		}
		else {
			jQuery("#"+that.options.eltID).removeClass("ripple");
			that.options.onshorttap(e);
		}
	};

	this.clear = function ()
	{
		that.obj.removeEventListener(that.event_name_end, that.on_event_end, false);
	};

	this.obj.addEventListener(
		that.event_name_start,
		function (e) {
			jQuery("#" + that.options.eltID).removeClass("ripple").addClass("ripple");
			that.event_time_start = new Date().getTime();
			that.obj.addEventListener(
				that.event_name_end,
				that.on_event_end,
				false
			);
		},
		false
	);
}

function multitap(options) 
{
	var that = this;
	this.options = {
		eltID     : "",            // DOM ID of the target element
		count     : 3,             // Minimum taps expected within duration
		duration  : 1000,          // Maximum duration for multitap
		onsuccess : function () {} // Callback fired on multitap completed within duration
	};

	for (var i in options) { this.options[i] = options[i]; }

	//console.log(JSON.stringify(this.options));

	this.obj = document.getElementById(that.options.eltID);
	this.count = 0;
	this.event_name = isTouchSupported ? 'touchstart' : 'mousedown';
	this.lt = null;

	//console.log(that.event_name);

	this.clear = function () 
	{
		jQuery("#"+that.options.eltID).removeClass("ripple");
		clearTimeout(that.lt);
		that.count = -1;
	};

	this.obj.addEventListener(
		that.event_name,
		function (e) {
			
			that.count++
			//console.log("Event fired that.count=" + String(that.count));

			if (that.count === 0) {
				jQuery("#"+that.options.eltID).removeClass("ripple").addClass("ripple");
				that.lt = setTimeout(function(){ that.clear(); }, that.options.timeout);
			}
			else {
				//console.log(that.count);
				if (that.count >= that.options.count) {
					that.clear();
					that.options.onsuccess();
				}
			}
		}
	);
}

/*
Sample code for textarea:
<div class="col-22 android">
	<textarea id="TA_TEST_1" oninput='this.style.height=""; this.style.height=this.scrollHeight+"px";' style="min-height:20px; max-height:200px; width:100%; overflow-y:scroll;"></textarea>
</div>
...
jQuery("#TA_TEST_1").off("keyup").on("keyup", function(e){
	if (e.which === 13) {
		var txt = jQuery("#TA_TEST_1").val();
		//console.log(txt);
	}
});
*/

// duration : object, ex duration = { minutes : 3, seconds : 0 }
//
function countdown (eltID, duration, ontimeout)
{
	var that = this;

	if (typeof ontimeout !== "function") { ontimeout = noop; }
	var current = ((duration.minutes * 60) + duration.seconds);

	this.okcont = true;

	this.iterate = function() {
		//console.info("IN countdown.iterate()");
		var minutes = Math.floor(current / 60); if (minutes < 0) { minutes = 0; }
		var seconds = current - (minutes * 60); if (seconds < 0) { seconds = 0; }
		var caption = (minutes > 0) ? "" + minutes + "m " + seconds + "s" : "" + seconds + "s";
		jQuery("#" + eltID).html(caption);

		if (that.okcont) {
			current--;
			if (current >= 0) {
				setTimeout(that.iterate,1000);
			}
			else {
				jQuery("#" + eltID).html("");
				ontimeout();
			}
		}
	}

	this.start = function() {
		//console.info("IN countdown.start()");
		that.okcont = true;
		that.iterate();
	};

	this.stop = function() {
		//console.info("IN countdown.stop()");
		that.okcont = false;
	};
	
}

// <div id="DIV_PROGRESS" class="progress" style="height:4px;"></div>
//
function progressBar(options)
{
	//console.log("IN progressBar()");

	var that = this;

	this.options = {
		divID    : "",                    // Will work better in a long-shaped DIV
		pctValue : 86,                    // Current value
		fgColor  : "var(--bg-control-on)" // Default to color scheme progress foreground
	};

	for (var i in options) { this.options[i] = options[i]; }
	//console.log(JSON.stringify(options));

	this.currentPctValue = this.options.pctValue;

	if (! jQuery("#" + this.options.divID).hasClass("progress")) {
		jQuery("#" + this.options.divID).addClass("progress");
	}

	var index = '<div class="index" style="width:[pctValue]%; background-color:[fgColor]"></div>';
	index = str_replace("[fgColor]", this.options.fgColor, index);

	this.set = function(pctValue)
	{
		//console.info("IN progressBar.set() pctValue=" + pctValue);
		that.currentPctValue = pctValue;
		var dummy = str_replace("[pctValue]", String(pctValue), index);
		jQuery("#" + this.options.divID).html(dummy);
	};

	this.get = function()
	{
		//console.info("IN progressBar.get()");
		return parseInt(String(that.currentPctValue));
	};

	this.set(this.options.pctValue);
}

function loading_animation (eltID, caption, timeout, index_fg_color, index_bg_color)
{
	//console.info("IN loading_animation() eltID='" + eltID + "' caption='" + caption + "'");
	if (typeof index_bg_color === "undefined") { index_bg_color = getCssVariable(eltID, "--bg-disabled"); }
	if (typeof index_fg_color === "undefined") { index_fg_color = getCssVariable(eltID, "--accent"); }

	if (typeof timeout === "undefined") { timeout = 5 * 1000; }
	if (typeof caption === "undefined") { caption = ""; }

	var that = this, direction = "inc", running = true;

	this.html = '<div class="row">'
						+ '<div class="progress-caption col-24">[caption]</div>'
						+ '</div>'
						+ '<div class="row margin-xs-top flex-middle" style="height:1em;">'
						+ '<div class="progress" style="height:4px;">'
						+ '<div class="index" style="width:0%;"></div>'
						+ '</div>'
						+ '</div>';

	this.html = str_replace("[caption]", caption, this.html);
	this.html = str_replace("[index_bg_color]", index_bg_color, this.html);
	this.html = str_replace("[index_fg_color]", index_fg_color, this.html);

	this.iterate = function() {
		var go_on = function() {
			if (running) {
				direction = (direction === "inc") ? "dec" : "inc";
				that.iterate();
			}
		};
		if (direction === "inc") {
			jQuery("#DIV_PROGRESS_LOADING").find(".index").animate({ "width": "100%" }, timeout, "linear", go_on);
		}
		else {
			jQuery("#DIV_PROGRESS_LOADING").find(".index").animate({ "width": "0%" }, timeout, "linear", go_on);
		}
	};

	this.stop = function() {
		running = false;
	};

	this.start = function() {
		running = true;
		that.iterate();
	}

	this.hide = function() {
		this.stop();
		jQuery("#" + eltID).html("");
	};

	this.show = function() {
		jQuery("#" + eltID).html(that.html);
		if (strlen(caption) === 0) {
			jQuery("#" + eltID).find(".progress-caption").remove();
		}
		jQuery("#" + eltID).find(".progress").css("background-color", index_bg_color);
		jQuery("#" + eltID).find(".index").css("background-color", index_fg_color);
		that.start();
	}

	this.show();
};

function spinner (eltID, spinner_fg_color)
{
	if (strlen(spinner_fg_color) === 0) { 
		spinner_fg_color = "#FFFFFF";
	}

	//console.info("IN spinner() eltID='" + eltID + "' spinner_fg_color='" + spinner_fg_color + "'");

	var that = this;
	this.html = '<div class="spinner"></div>';

	//console.log(this.html);

	this.hide = function() {
		jQuery("#" + eltID).html("");
	};

	this.show = function() {
		document.getElementById(eltID).setAttribute("style", "--spinner_fg_color:" + spinner_fg_color);
		jQuery("#" + eltID).html(that.html);
	};

	this.show();
};


// <div id="DIV_PROGRESS_CIRCLE" class="progress-circle h3 bold" style="width:220px; height:220px;">
//	 Rp137,000
// </div>
//
function progressCircle(options)
{
	//console.log("IN progressCircle()");
	var that = this;

	this.options = {
		divID       : "",                   // Will work better in a square-shaped DIV
		pctValue    : 50,                   // Current value
		pctText     : "",                   // Text to come on overlay
		bgControl   : "var(--bg-page)",     // Background of the control
		bgColor     : "var(--bg-progress)", // Default to color scheme progress background
		fgColor     : "var(--fg-progress)", // Default to color scheme progress foreground
		conicCutPct : 60                    // The smaller the control, the smaller this value may be
	};

	for (var i in options) { this.options[i] = options[i]; }
	//console.log(JSON.stringify(options));

	this.currentPctValue = this.options.pctValue;
	this.currentPctText  = this.options.pctText ;

	var incCutPct = this.options.conicCutPct + 1;

	var bgstring = 'radial-gradient(closest-side, [bgControl] [conicCutPct]%, transparent [incCutPct]% 100%),'
							 + 'conic-gradient([fgColor] [pctValue]%, [bgColor] 0)';

	bgstring = str_replace("[bgControl]",   this.options.bgControl,   bgstring);
	bgstring = str_replace("[conicCutPct]", this.options.conicCutPct, bgstring);
	bgstring = str_replace("[incCutPct]",   incCutPct,                bgstring);
	bgstring = str_replace("[fgColor]",     this.options.fgColor,     bgstring);
	bgstring = str_replace("[bgColor]",     this.options.bgColor,     bgstring);
	//console.log(bgstring);

	this.set = function(pctValue, pctText)
	{
		//console.info("IN progressCircle.set() pctValue=" + pctValue + ", pctText='" + pctText + "'");
		var dummy = bgstring;
		that.currentPctValue = pctValue;
		that.currentPctText  = pctText ;
		dummy = str_replace("[pctValue]", String(pctValue), dummy);
		var dom = document.getElementById(this.options.divID);
		dom.style.backgroundImage = dummy;
		if (strlen(pctText) > 0) {
			dom.innerHTML = String(pctText);
		}
		else {
			dom.innerHTML = "&nbsp;";
		}
	};

	this.get = function()
	{
		//console.info("IN progressCircle.get()");
		return parseInt(String(that.currentPctValue));
	};

	this.set(this.options.pctValue, this.options.pctText);
}

/*
jQuery.scrollIntoView() scrolls an element's parent to make this
element visible

reservedHeight: allows to adjust the computed viewport height to accomodate the
                presence of a footer or of  the virtual keyboard in combination 
							  with application.keyboard_did_show/keyboard_did_hide
*/

(function($) {
 
  $.fn.scrollIntoView = function(reservedHeight) {
 
		if (typeof reservedHeight ==="undefined") { reservedHeight = 0; }

		this.each(function() {
			
			var element = jQuery(this).get(0);

			var HHH  = element.getBoundingClientRect().height;
			var p    = getScreenCordinates(element);
			var maxY = window.innerHeight - HHH - reservedHeight;

			if (p.y > maxY) {
				var delta = p.y - maxY;
				//element.parentNode.scrollTop += delta;
				jQuery(this).closest(".overflow-y")[0].scrollTop += delta;
			}
			else {
				var containerTop = element.parentNode.getBoundingClientRect().top; 
				if (p.y < containerTop) {
					var delta = containerTop - p.y;
					//element.parentNode.scrollTop -= delta;
					jQuery(this).closest(".overflow-y")[0].scrollTop -= delta;
				}
			}

		});

		return this;

  };
 
}(jQuery));		




// End of file: controls.js
// ============================================================================