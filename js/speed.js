

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
    if (jQuery('#speed-section #chart').length) {
      makeChart();
    }
}, false);


function makeChart() {
  //Get width of page
  var chartWidth = parseInt(d3.select("#chart").style("width"));

  // Set the margins
  var margin = {top: 120, right: 0, bottom: 40, left: 0},
      width = chartWidth - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  // Set up the format to match that of the data that is being read in - have a look here for a list of formats - https://github.com/mbostock/d3/wiki/Time-Formatting
  var parseDate = d3.time.format("%Y").parse;

  var data = [{"year":"2007", "speed": 16},
              {"year":"2009", "speed": 50},
              {"year":"2011", "speed": 100},
              {"year":"2013", "speed": 505},
              {"year":"2015", "speed": 1000},
              {"year":"2017", "speed": 2000},
              {"year":"2018", "speed": 10000}];

  // Take each row and put the date column through the parsedate form we've defined above.
  data.forEach(function(d) {
    d.year = parseDate(d.year);
  });

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1, 0);

  var y = d3.scale.linear()
      .range([height, 0]);

  //Setting x-axis up here using x scaling object
  var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(function(d, i) { // set labels
      if (i == 0) {
        return "2007";
      }
      else if (i == 1) {
        return "2009";
      }
      else if (i == 2) {
        return "2011";
      }
      else if (i == 3) {
        return "2013";
      }
      else if (i == 4) {
        return "2015";
      }
      else if (i == 5) {
        return "2017";
      }
      else {
        return "Future";
      }
    })
    .outerTickSize(0)
    .innerTickSize(0)
    .orient("bottom");


  var svg = d3.select("#chart").append("svg")
    .attr("class", "svgele")
    .attr("id", "svgEle")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var chart = jQuery('#chart');
  var barWidth = (chartWidth - (0.1 * chartWidth)) / data.length;
  var barPadding = barWidth * 0.1;

  // initialize text
  // 16mbps
  initText(svg, height - 20, (barWidth / 2) - 12, "32px", "bold", "16", "num-0"); // height - 40
  initText(svg, height, (barWidth / 2) - 14, "16px", "normal", "MBPS", "label-0"); // height - 20

  // 50mbps
  initText(svg, height - 20, (barWidth * 1.5) + barPadding - 8, "32px", "bold", "50", "num-1"); //height - 50
  initText(svg, height, (barWidth * 1.5) + barPadding - 12, "16px", "normal", "MBPS", "label-1"); // height - 30

  // 100mbps
  initText(svg, height - 20, (barWidth * 2.5) + (barPadding * 2) - 14, "32px", "bold", "100", "num-2"); // height - 60
  initText(svg, height, (barWidth * 2.5) + (barPadding * 2) - 8, "16px", "normal", "MBPS", "label-2"); // height - 40

  // 505mbps
  initText(svg, height - 20, (barWidth * 3.5) + (barPadding * 3) - 10, "32px", "bold", "505", "num-3"); // height - 80
  initText(svg, height, (barWidth * 3.5) + (barPadding * 3) - 6, "16px", "normal", "MBPS", "label-3"); // height - 60

  // 1gbps
  initText(svg, height - 20, (barWidth * 4.5) + (barPadding * 4) + 6, "32px", "bold", "1", "num-4"); // height - 100
  initText(svg, height, (barWidth * 4.5) + (barPadding * 4) - 4, "16px", "normal", "GBPS", "label-4"); // height - 80

  // 2gbps
  initText(svg, height - 20, (barWidth * 5.5) + (barPadding * 5) + 10, "32px", "bold", "2", "num-5"); // height - 140
  initText(svg, height, (barWidth * 5.5) + (barPadding * 5), "16px", "normal", "GBPS", "label-5"); // height - 120

  svg.append('svg:image')
    .attr("class", "speed chart-logo")
    .style("opacity", 0)
    .attr({
      'xlink:href': '../images/10G_logo.png',  // can also add svg file here
      x: ((barWidth * 6) + (barPadding * 6) + 20),
      y: height - 80,
      width: 120,
      height: 80
    });

  // set x and y domains
  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0, d3.max(data, function(d) { return d.speed; })]);

  // add x axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .attr("y", 10)
      .style("text-anchor", "middle");

  // Add bars
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "speed-bar")
    .attr("x", function(d) { return x(d.year); })
    .attr("y", height)
    .attr("fill", "#E71B4F")
    .attr("width", x.rangeBand())
    .attr("height", 0)
    .style("opacity", 0);


   jQuery(window).on('scroll.chart load.chart', function() {
       // Show lines and display text
      if (isInViewport(chart)) {
        if (chartOn == false) {
          showBars(svg, data, y, height);
          chartOn = true;
        }
      }
      else {
        chartOn = false;
      }
   });

}

// hide the text labels above the lines
function hideText() {
  d3.selectAll("svg.svgele text.speed").style("opacity", 0);
}

function showBars(svg, data, y, height) {
  svg.selectAll("rect")
    .style("opacity", 1)
    .transition()
    .duration(2000)
    .ease("elastic")
    .delay(function(d, i) {
      return i / data.length * 500;  // Dynamic delay (each item delays a little longer)
    })
    .attr("y", function(d) { return y(d.speed); })
    .attr("height", function(d) { return height - y(d.speed); })
    .each(function(d, i) {
      if (i < 6) {
        animateText(svg, i, height);
      }
      else {
        animateLogo(svg);
      }
    });
}

function initText(svg, y, x, size, weight, text, label) {
  svg.append("text")
    .attr("class", "speed " + label)
    .attr("y", y)
    .attr("x", x)
    .style("font-size", size)
    .style("font-weight", weight)
    .style("opacity", 0)
    .text(text);
}

function animateText(svg, i, height) {
  var numHeight;
  var labelHeight;

  if (i == 0) {
    numHeight = height - 40;
    labelHeight = height - 20;
  }
  else if (i == 1) {
    numHeight = height - 50;
    labelHeight = height - 30;
  }
  else if (i == 2) {
    numHeight = height - 60;
    labelHeight = height - 40;
  }
  else if (i == 3) {
    numHeight = height - 80;
    labelHeight = height - 60;
  }
  else if (i == 4) {
    numHeight = height - 100;
    labelHeight = height - 80;
  }
  else if (i == 5) {
    numHeight = height - 140;
    labelHeight = height - 120;
  }

  // animate number
  svg.selectAll("text.speed.num-" + i)
    .transition()
    .duration(500)
    .ease("linear")
    .style("opacity", 1)
    .attr("y", numHeight);

  // animate text
  svg.selectAll("text.speed.label-" + i)
    .transition()
    .duration(500)
    .ease("linear")
    .style("opacity", 1)
    .attr("y", labelHeight);
}

function animateLogo(svg) {
  // animate 10g logo
  svg.selectAll(".speed.chart-logo")
    .transition()
    .duration(500)
    .ease("linear")
    .style("opacity", 1)
    .attr("y", -105);
}
