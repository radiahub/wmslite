// ============================================================================
// Module      : graph.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Graph charts: API to chart.js import library
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
//
// Points
//
// ****************************************************************************
// ****************************************************************************
/*
A "point" is a plain object representing a value of the chart

var P = { caption: "...", value: 0.0 }
caption : display string (value on X-axis on line/bar graphs)
value   : graph value (value on Y-axis on line/bar graphs)

A "serie" is a plain object representing one or several related points and
the representation colors

var S = { name: "...", points: [], lineColor:"#000000", fillColor:"#F0F0F0" }
name      : display name of the serie (value on legend)
points    : array of at least one point (in case of pie, donut graphs)
lineColor : color of the border line
fillColor : color of the fill color (graph area)

html:

<div class="col-10" style="height:5em;">
	<canvas id="canvasChart1" style="width:100%; height:100%;"></canvas>
</div>

important:

graphs of type 'line', 'bar', 'pie' use data presented with series, where the 
type 'pie' uses multiple series of 1x value (1x point)

*/

function convertSerieToPieGraph (S)
{
	var result = [];

	try {

		var points = S.points;
		if (points.length > 0) {
			for (var i = 0; i < points.length; i++) {
				var serie = {  name: points[i]["caption"], points: [{caption: points[i]["caption"], value: points[i]["value"]}] };
				result.push(serie);
				if (i >= 5) {
					break;
				}
			}
		}

	}
	catch(e) {
		//console.error("Runtime exception");
		//console.error(e);
		result = [];
	}

	return result;
};


// ****************************************************************************
// ****************************************************************************
//
// Graph implementation
//
// ****************************************************************************
// ****************************************************************************

function graph(options)
{
	var that = this;
	this.options = {
		type        : "",     // One of "line","bar","pie","donut" string value
		canvas_id   : "",     // Parent canvas DOM identifier, where the graph will be drawn
		div_text_id : "",     // DOM ID of the DIV, in which the legend will be drawn
		cutoutPct   : 85,     // Percentage of inner space cut out (donut chart only)
		series      : [],     // Array of series sharing the same abscisse list (line and bar graph only)
								 		      // Missing values in the series my lead to unpredictable effects
		display : {           // Plain object listing display options
			fontSize : 10,      // Default font size in pixels for axis texts
			fill : true,        // true = A serie's inner area will be filled with its related color
			lineTension : 0.35, // Value between 0 and 1, 0 : draw straight lines
			pointRadius : 1,    // Diameter of the radius of a value point in pixels
			gridLines : true,   // true = the grid lines (x and y) will be drawn
			axisLines : true,   // true = the axis lines (x and y) will be drawn
			captions  : true    // true = the ticks captions will be drawn
		}
	};

	this.options = deepMerge(that.options, options);

	//console.info("IN graph()");
	//console.log(this.options);

	this.mychart = null;


	// Build the abscisse array from the points of the first serie
	//
	this.abscisses = function()
	{
		var result = null;

		try{
			if (["line","bar"].indexOf(that.options.type) >= 0) {
				if (that.options.series.length > 0) {
					result = [];
					var points = that.options.series[0]["points"];
					for (var i = 0; i < points.length; i++) {
						result.push(points[i]["caption"]);
					}
				}
			} 
		}
		catch(e) {
			//console.error("Runtime exception");
			//console.error(e);
			result = null;
		}

		return result;
	};

	// Build the value array from the points of a serie
	//
	this.values = function(serie_id)
	{
		result = null;

		try {
			if (val.isset(that.options.series[serie_id])) {
				result = [];
				var points = that.options.series[serie_id]["points"];
				for (var i = 0; i < points.length; i++) {
					result.push(points[i]["value"]);
				}
			}
		}
		catch(e) {
			//console.error("Runtime exception");
			//console.error(e);
			result = null;
		}

		return result;
	};

	// Build the graph display options
	//
	this.ChartOptions = function()
	{
		//console.info("IN graph.ChartOptions()");

		var fontFamily = "sans-serif";
		var fontSize = that.options.display["fontSize"];
		var fontColor = getCssValue("chartfontcolor", "color");
		var gridColor = getCssValue("chartgridcolor", "color");

		var noOfRealSeries = 0, barPercentage = 1;
		if (that.options.series.length > 0) {
			for (var i = 0; i < that.options.series.length; i++) {
				if (val.isset(that.options.series[i])) {
					noOfRealSeries++;
				}
			}
		}
		if (noOfRealSeries > 0) {
			barPercentage = 1 / noOfRealSeries;
		}

		var result = {
			fontFamily          : fontFamily,
			fontSize            : fontSize,
			fontColor           : fontColor,
			responsive          : false,
			maintainAspectRatio : true,
			events              : [],
			padding             : 0,
			title               : { display : false },
			legend              : { display : false },
			tooltips            : { enabled : false },
			animation           : false,
		};

		if (["pie","donut"].indexOf(that.options.type) >= 0) {
			if (that.options.type === "pie") {
				result["cutoutPercentage"] = 0;
			}
			else {
				result["cutoutPercentage"] = that.options.cutoutPct;
			}
			result["scales"] = {
				xAxes : [
					{
						display : false
					}
				],
				yAxes : [
					{
						display : false
					}
				]
			};
		}
		else {
			result["scales"] = {
				xAxes : [
					{
						display : that.options.display.axisLines,
						barPercentage: barPercentage,
						gridLines : {
							display   : that.options.display.gridLines,
							lineWidth : 1,
							color     : gridColor,
							ticks : {
								display   : true,
								fontColor : fontColor
							}
						}
					}
				],
				yAxes : [
					{
						display : that.options.display.axisLines,
						gridLines : {
							display   : that.options.display.gridLines,
							lineWidth : 1,
							color     : gridColor,
							ticks : {
								display   : true,
								fontColor : fontColor
							}
						}
					}
				]
			}
		}

		return result;
	};

	this.destroy = function() 
	{
		//console.info("IN graph.destroy()");
		if (this.mychart !== null) {
			//console.log("Destroying graph");
			this.mychart.destroy();
		}
		if (strlen(that.options.div_text_id) > 0) {
			//console.log("Destroying legend");
			jQuery("#" + that.options.div_text_id).empty();
		}
	};

	this.hide = function()
	{
		//console.info("IN graph.hide() type='" + that.options.type + "'");
		that.destroy();
	};

	this.draw = function() 
	{
		//console.info("IN graph.draw() type='" + that.options.type + "'");
		switch(that.options.type.toUpperCase()) {

			case "LINE":
			case "BAR" : {

				var trHtml = '<tr>'
									+ '<td><div style="width:0.8em; height:0.8em; background-color:[fillColor]; border: 1px solid [lineColor];"></div></td>'
									+ '<td style="padding-left:0.6em;">[name]</td>'
									+ '</tr>';

				if (that.options.series.length > 0) {

					var datasets = [], legendHtml = "";

					for (var i = 0; i < that.options.series.length; i++) {
						var j = i + 1;
						var property = that.options.type + "_serie_" + String(j);
						//console.log(property);
						var fillColor = (val.isset(that.options.series[i]["fillColor"])) ? that.options.series[i]["fillColor"] : css(property, "background-color");
						//console.log(fillColor);
						var lineColor = (val.isset(that.options.series[i]["lineColor"])) ? that.options.series[i]["lineColor"] : css(property, "color");
						//console.log(lineColor);
						var dumdum = {
							backgroundColor : fillColor,
							borderColor     : lineColor,
							borderWidth     : 1,
							pointRadius     : that.options.display.pointRadius,
							fill            : that.options.display.fill,
							data            : that.values(i),
							lineTension     : that.options.display.lineTension
						};
						//console.log(JSON.stringify(dumdum));
						datasets.push(dumdum);
						var html = trHtml;
						html = str_replace("[name]", that.options.series[i]["name"], html);
						html = str_replace("[fillColor]", fillColor, html);
						html = str_replace("[lineColor]", lineColor, html);
						if (strlen(legendHtml) > 0) { legendHtml += "\n"; }
						legendHtml += html;
					}

					var canvas = document.getElementById(that.options.canvas_id);
					var ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					that.mychart = new Chart(
						ctx, 
						{
							type    : that.options.type,
							data    : { labels: that.abscisses(), datasets: datasets },
							options : that.ChartOptions()
						}
					);

					if (strlen(that.options.div_text_id) > 0) {
						jQuery("#" + that.options.div_text_id).html(legendHtml);
					}
				}
				break;
			}

			case "PIE" : {

				var trHtml = '<tr>'
									+ '<td><div style="width:0.8em; height:0.8em; background-color:[fillColor]; border: 1px solid [lineColor];"></div></td>'
									+ '<td style="padding-left:0.6em;">[name]</td>'
									+ '<td style="padding-left:0.6em;">[value]</td>'
									+ '</tr>';

				if (that.options.series.length > 0) {

					var dataset = [{ data : [], backgroundColor : [], borderColor : [], borderWidth : 1 }];
					var labels  = [];
					var legendHtml = "";

					//console.log(that.options.series);

					for (var i = 0; i < that.options.series.length; i++) {
						var j = i + 1;
						
						var property = that.options.type + "_serie_" + String(j);
						var fillColor = (val.isset(that.options.series[i]["fillColor"])) ? that.options.series[i]["fillColor"] : css(property, "background-color");
						var lineColor = (val.isset(that.options.series[i]["lineColor"])) ? that.options.series[i]["lineColor"] : css(property, "color");

						dataset[0].data.push(that.options.series[i]["points"][0]["value"]);
						dataset[0].backgroundColor.push(fillColor);
						dataset[0].borderColor.push(lineColor);
						labels.push(that.options.series[i]["points"][0]["caption"]);

						var html = trHtml;
						html = str_replace("[name]", that.options.series[i]["name"], html);
						html = str_replace("[value]", that.options.series[i]["points"][0]["value"], html);
						html = str_replace("[fillColor]", fillColor, html);
						html = str_replace("[lineColor]", lineColor, html);
						if (strlen(legendHtml) > 0) { legendHtml += "\n"; }
						legendHtml += html;

					}

					var canvas = document.getElementById(that.options.canvas_id);
					var ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					that.mychart = new Chart(
						ctx, 
						{
							type : "pie",
							data : { datasets: dataset, labels: labels },
							options: that.ChartOptions()
						}
					);

					if (strlen(that.options.div_text_id) > 0) {
						jQuery("#" + that.options.div_text_id).html(legendHtml);
					}
				}
				break;
			}

			case "DONUT": {

				if (that.options.series.length > 0) {

					var dataset  = [{ data : [], backgroundColor : [], borderColor : [], borderWidth : 1 }];
					var labels   = [];

					var property = "pie_serie_1";
					var fillColor = (val.isset(that.options.series[0]["fillColor"])) ? that.options.series[0]["fillColor"] : css(property, "background-color");
					//console.log(fillColor);
					var lineColor = (val.isset(that.options.series[0]["lineColor"])) ? that.options.series[0]["lineColor"] : css(property, "color");
					//console.log(lineColor);

					var value = that.options.series[0]["points"][0]["value"];
					dataset[0].data.push(value);
					dataset[0].backgroundColor.push(fillColor);
					dataset[0].borderColor.push(lineColor);
					labels.push(that.options.series[0]["points"][0]["caption"]);
					//console.log(labels);

					var paddingFillColor = String(rgb2hex(css("pie_padding", "background-color"))).toUpperCase();
					var paddingLineColor = String(rgb2hex(css("pie_padding", "border-color"))).toUpperCase();

					var pctpad = 100 - value;
					//console.log(pctpad);
					dataset[0].data.push(pctpad);
					dataset[0].backgroundColor.push(paddingFillColor);
					dataset[0].borderColor.push(paddingLineColor);
					labels.push(String(pctpad));

					var canvas = document.getElementById(that.options.canvas_id);
					var ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					that.mychart = new Chart(
						ctx, 
						{
							type : "doughnut",
							data : { datasets: dataset, labels: labels },
							options: that.ChartOptions()
						}
					);

					var legendHtml = "" + value + "%";
					if (strlen(that.options.div_text_id) > 0) {
						jQuery("#" + that.options.div_text_id).html(legendHtml);
					}
				}
				break;
			}

		}
	};

	this.redraw = function(series)
	{
		return new Promise(
			(resolve, reject)=>{

				//console.info("IN graph.redraw() type='" + that.options.type + "'");
				//console.log(JSON.stringify(series));
				
				if ((typeof series !== "undefined") && (series !== null)) {
					that.options.series = series;
				}

				try {
					var elt = jQuery("#" + that.options.canvas_id).parent();
					jQuery("#" + that.options.canvas_id).remove();
					jQuery(elt).empty();
					var html = '<canvas id="' +  that.options.canvas_id + '" style="width:100%; height:100%;"></canvas>';
					//console.log(html);
					jQuery(elt).html(html);
					that.draw();
					resolve();
				}
				catch(e) {
					//console.error("Runtime exception");
					//console.error(e);
					reject();
				}

			}
		);
	};

	this.show = function()
	{
		//console.info("IN graph.show() type='" + that.options.type + "'");
		that.draw();
	};
};




// End of file: graph.js
// ============================================================================