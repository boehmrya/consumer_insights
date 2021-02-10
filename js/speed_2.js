

var isInViewport = function(el) {
  // takes jquery object as input, returns boolean
  // returns true if bottom half of element is in the viewport
  var elementTop = el.offset().top;
  var elementBottom = elementTop + el.outerHeight();
  var viewportTop = jQuery(window).scrollTop();
  var viewportBottom = viewportTop + jQuery(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
};


var chartOn = false;

document.addEventListener('DOMContentLoaded', function() {
    if (jQuery('.chart-section .speed-chart').length) {
      makeChart();
    }
}, false);

		function makeChart() {

			// Load in the data now...
			d3.csv("../data/data.csv", function(error, data) {

  			//Get width of page
  			var chartwidth = parseInt(d3.select(".speed-chart").style("width"));

  			// Set the margins
  			var margin = {top: 20, right: 20, bottom: 40, left: 20},
  				width = chartwidth - margin.left - margin.right,
  				height = 600 - margin.top - margin.bottom;

  			// Set up the format to match that of the data that is being read in - have a look here for a list of formats - https://github.com/mbostock/d3/wiki/Time-Formatting
  			var parseDate = d3.time.format("%Y").parse;

  			// Setting up the scaling objects
  			var x = d3.time.scale()
  				.range([0, width]);

  			// Same for the y axis
  			var y = d3.scale.linear()
  				.range([height, 0]);

  			// Same for colour.
  			var color = d3.scale.category10();

  			//Setting x-axis up here using x scaling object
  			var xAxis = d3.svg.axis()
  				.scale(x)
          .tickFormat(function(d, i) { // set labels
            if (i == 0) {
              return "2007";
            }
            else if (i == 1) {
              return "2008";
            }
            else if (i == 2) {
              return "2009";
            }
            else if (i == 3) {
              return "2010";
            }
            else if (i == 4) {
              return "2011";
            }
            else if (i == 5) {
              return "2012";
            }
            else if (i == 6) {
              return "2013";
            }
            else if (i == 7) {
              return "2014";
            }
            else if (i == 8) {
              return "2015";
            }
            else {
              return "2018";
            }
          })
  				.orient("bottom");


  			// Setting up a d3 line object - used to draw lines later
  			var line = d3.svg.line()
  				.x(function(d) { return x(d.date); })
  				.y(function(d) { return y(d.speed); });


  			// Now to actually make the chart area
  			var svg = d3.select(".speed-chart").append("svg")
  				.attr("class", "svgele")
  				.attr("id", "svgEle")
  				.attr("width", width + margin.left + margin.right)
  				.attr("height", height + margin.top + margin.bottom)
  			  .append("g")
  				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


			   color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  			  // Take each row and put the date column through the parsedate form we've defined above.
  			  data.forEach(function(d) {
  				  d.date = parseDate(d.date);
  			  });

  			  // Building an object with all the data in it for each line
  			  projections = color.domain().map(function(name) {
    				return {
    				  name: name,
    				  values: data.map(function(d) {
    					       return {date: d.date, speed: +d[name]};
    					 })
    				};
  			  });

			    // Set the domain of the x-value
			    x.domain(d3.extent(data, function(d) {
            return d.date;
          }));

			    // Do the same for the y-axis...[0,800000] by looking at the minimum and maximum for the speed variable.
  			  y.domain([
  				  d3.min(projections, function(c) { return d3.min(c.values, function(v) { return v.speed; }); }),
  				  d3.max(projections, function(c) { return d3.max(c.values, function(v) { return v.speed; }); })
  			  ]);

          svg.append("path")

  			  // Bind the x-axis to the svg object
  			  svg.append("g")
  				  .attr("class", "x axis")
  				  .attr("transform", "translate(0," + height + ")")
  				  .call(xAxis);

  				//create proj
  				var proj = svg.selectAll(".proj")
  						.data(projections)
  						.enter()
  						.append("g")
  						.attr("class", "proj");

  				// Drawing the lines
					proj.append("path")
						.attr("class", "line")
						.attr("id" , function(d, i) {
							return "line" + i;
						})
						.attr("stroke-linecap","round")
					  .attr("d", function(d,i) {
						  return line(d.values);
						 })
					  .style("stroke", function(d,i) {
              if (i < 12) {
                return "#5ac8e7";
              }
              else if (i < 24) {
                return "#E71B4F";
              }
              else {
                return "#8c489a";
              }
            });

				   //Initially set the lines to not show
				   d3.selectAll(".line").style("opacity",0);
           var chart = jQuery('.speed-chart');
           var barwidth = (chartwidth - 120) / 9;

           // 2007: 16 mbps
           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 40)
             .attr("x", 4)
             .style("font-size", "32px")
             .style("font-weight", "bold")
             .style("opacity", 0)
             .text("16");

           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 20)
             .attr("x", 0)
             .style("font-size", "16px")
             .style("opacity", 0)
             .text("MBPS");

           // 2009: 50 mbps
           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 50)
             .attr("x", (barwidth * 2))
             .style("font-size", "32px")
             .style("font-weight", "bold")
             .style("opacity", 0)
             .text("50");

           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 30)
             .attr("x", (barwidth * 2) - 4)
             .style("font-size", "16px")
             .style("opacity", 0)
             .text("MBPS");

           // 2011: 100 mbps
           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 80)
             .attr("x", (barwidth * 4) + 12)
             .style("font-size", "32px")
             .style("font-weight", "bold")
             .style("opacity", 0)
             .text("100");

           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 60)
             .attr("x", (barwidth * 4) + 18)
             .style("font-size", "16px")
             .style("opacity", 0)
             .text("MBPS");

           // 2012: 305 mbps
           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 140)
             .attr("x", (barwidth * 5) + 20)
             .style("font-size", "32px")
             .style("font-weight", "bold")
             .style("opacity", 0)
             .text("305")

           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 120)
             .attr("x", (barwidth * 5) + 26)
             .style("font-size", "16px")
             .style("opacity", 0)
             .text("MBPS");

           // 2013: 505 mbps
           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 200)
             .attr("x", (barwidth * 6) + 30)
             .style("font-size", "32px")
             .style("font-weight", "bold")
             .style("opacity", 0)
             .text("505");

           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 180)
             .attr("x", (barwidth * 6) + 36)
             .style("font-size", "16px")
             .style("opacity", 0)
             .text("MBPS");

           // 2015: 1 GB
           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 340)
             .attr("x", (barwidth * 8) + 40)
             .style("font-size", "32px")
             .style("font-weight", "bold")
             .style("opacity", 0)
             .text("1");

           svg.append("text")
             .attr("class", "speed")
             .attr("y", height - 320)
             .attr("x", (barwidth * 8) + 30)
             .style("font-size", "16px")
             .style("opacity", 0)
             .text("GBPS");

           // 2016: 2 GB
           svg.append("text")
             .attr("class", "speed")
             .attr("y", 25)
             .attr("x", (barwidth * 9) + 10)
             .style("font-size", "32px")
             .style("font-weight", "bold")
             .style("opacity", 0)
             .text("2");

           svg.append("text")
             .attr("class", "speed")
             .attr("y", 45)
             .attr("x", (barwidth * 9))
             .style("font-size", "16px")
             .style("opacity", 0)
             .text("GBPS");

          if (isInViewport(chart)) {
            showText();
          }


           jQuery(window).on('scroll.chart load.chart', function() {
               // Show lines and display text
              if (isInViewport(chart)) {
                if (chartOn == false) {
                  animatelines();
                  showText();
                  chartOn = true;
                }
              }
              /*
              else {
                hideLines();
                hideText();
                chartOn = false;
              }
              */
           });

		   });

		}


    // animate all of the lines
		function animatelines() {
			//Select All of the lines and process them one by one
			d3.selectAll(".line").each(function(d,i) {

        if (i < 24) {
           d3.select(this).style("opacity","1");
        }
        else {
           d3.select(this).style("opacity","0.7");
        }

			  // Get the length of each line in turn
			  var totalLength = d3.select("#line" + i).node().getTotalLength();

				d3.selectAll("#line" + i)
          .attr("stroke-dasharray", totalLength + " " + totalLength)
				  .attr("stroke-dashoffset", totalLength)
				  .transition()
				  .duration(2000)
				  .ease("linear") //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
				  .attr("stroke-dashoffset", 0)
				  .style("stroke-width",2);
			});
	  }


    /*
    // hide the animating lines
    function hideLines() {
      d3.selectAll("svg.svgele .line")
        .style("opacity", 0)
        .style("stroke-width", 0)
        .attr("stroke-dashoffset", 0)
        .attr("stroke-dasharray", 0);
    }


    // hide the text labels above the lines
    function hideText() {
      d3.selectAll("svg.svgele text.speed").style("opacity", 0);
    }
    */


    // show the text labels above the lines
    function showText() {
      d3.selectAll("svg.svgele text.speed")
        .transition()
        .delay(1000)
        .duration(3000)
        .style("opacity", 1);
    }
