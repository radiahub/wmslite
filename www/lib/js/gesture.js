// ============================================================================
// Module      : gesture.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Support for touch and gestures (device with touch screen only)
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 14-July-23 00:00 WIT  Denis  Deployment V. 2023 "ALEXANDRE DUMAS"
//
// ============================================================================

function gesture (gestureElement)
{
	var that = this;


	// **************************************************************************
	//
	// Utils
	//
	// **************************************************************************

	this.start = {};

	this.DOMelement = function()
	{
		//M.info("IN gesture.DOMelement()");
		if (typeof gestureElement === "string") {
			return document.getElementById(gestureElement);
		}
		else if (DOMElement(gestureElement)) {
			return gestureElement;
		}
	};

  this.distance = function (event) 
	{
		//M.info("IN gesture.distance()");
    return Math.hypot(event.touches[0].pageX - event.touches[1].pageX, event.touches[0].pageY - event.touches[1].pageY);
  };


	// **************************************************************************
	//
	// Runtime events
	//
	// **************************************************************************

	this.callback_ontouchstart = null; // function(event, x, y, distance)
	this.callback_ontouchmove  = null // function(event, deltaX, deltaY, distance, scaleFactor)
	this.callback_ontouchend   = null; // function(event)

	this.reset = function()
	{
		M.info("IN gesture.reset()");
		var element = that.DOMelement();
		element.removeEventListener("touchmove", that.ontouchmove);
		element.removeEventListener("touchend",  that.ontouchend );
	};

	this.ontouchstart = function(event)
	{
		//M.info("IN gesture.ontouchstart()");
   	//M.log("touchstart event='" + JSON.stringify(event) + "'");
		if (event.touches.length === 1) {

      event.preventDefault(); // Prevent page scroll

    	that.start.x = event.touches[0].pageX;
    	that.start.y = event.touches[0].pageY;
    	that.start.distance = 0;

			if (typeof that.callback_ontouchstart === "function") {
				that.callback_ontouchstart(event, that.start.x, that.start.y, that.start.distance);
			}
		}
    else if (event.touches.length === 2) {

      event.preventDefault(); // Prevent page scroll
      
			// Calculate the barycenter of the position where the fingers have started on the X and Y axis
			//
      that.start.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
      that.start.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
      that.start.distance = that.distance(event);

			//M.log(JSON.stringify(that.start));
			
			if (typeof that.callback_ontouchstart === "function") {
				that.callback_ontouchstart(event, that.start.x, that.start.y, that.start.distance);
			}
    }
	};

	this.ontouchmove = function(event)
	{
		//M.info("IN gesture.ontouchmove()");
   	//M.log("touchmove event='" + JSON.stringify(event) + "'");
		if (event.touches.length === 1) {

      event.preventDefault(); // Prevent page scroll

			var deltaX = event.touches[0].pageX - that.start.x;
			var deltaY = event.touches[0].pageY - that.start.y;
			var deltaDistance = 0;
			var scaleFactor = 0;

 			if (typeof that.callback_ontouchmove === "function") {
				that.callback_ontouchmove(event, deltaX, deltaY, deltaDistance, scaleFactor);
			}
		}
    else if (event.touches.length === 2) {
			
      event.preventDefault(); // Prevent page scroll

      var deltaDistance = that.distance(event);
      var scaleFactor = deltaDistance / that.start.distance;

      var deltaX = (((event.touches[0].pageX + event.touches[1].pageX) / 2) - that.start.x) * 2; // x2 for accelarated movement
      var deltaY = (((event.touches[0].pageY + event.touches[1].pageY) / 2) - that.start.y) * 2; // x2 for accelarated movement
			//M.log("deltaX=" + deltaX + ", deltaY=" + deltaY + ", deltaDistance=" + deltaDistance + ", scaleFactor=" + scaleFactor);
			
 			if (typeof that.callback_ontouchmove === "function") {
				that.callback_ontouchmove(event, deltaX, deltaY, deltaDistance, scaleFactor);
			}
    }
	};

	this.ontouchend = function(event)
	{
		//M.info("IN gesture.ontouchend()");
		if (typeof that.callback_ontouchend === "function") {
			that.callback_ontouchend(event);
		}
		that.start = {};
	};


	// **************************************************************************
	//
	// Runtime events API
	//
	// **************************************************************************

	this.off = function(eventname)
	{
		M.info("IN gesture.off() eventname='" + eventname + "'");
		switch(eventname) {
			case "touchstart": {
				that.callback_ontouchstart = null;
				break;
			}
			case "touchmove": {
				that.callback_ontouchmove = null;
				break;
			}
			case "touchend": {
				that.callback_ontouchend = null;
				break;
			}
		}
		return that;
	};

	this.on = function(eventname, callback)
	{
		M.info("IN gesture.on() eventname='" + eventname + "'");
		if (typeof callback === "function") {
			switch(eventname) {
				case "touchstart": {
					that.callback_ontouchstart = callback;
					break;
				}
				case "touchmove": {
					that.callback_ontouchmove = callback;
					break;
				}
				case "touchend": {
					that.callback_ontouchend = callback;
					break;
				}
			}
		}
		return that;
	};


	// **************************************************************************
	//
	// Initialization
	//
	// **************************************************************************

	this.init = function()
	{
		M.info("IN gesture.init()");
		var element = that.DOMelement();
		element.addEventListener('touchstart', that.ontouchstart);		
		element.addEventListener('touchmove',  that.ontouchmove );		
		element.addEventListener('touchend',   that.ontouchend  );		
	};

	this.init();
};


// End of file: gesture.js
// ============================================================================