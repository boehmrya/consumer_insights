jQuery(function($){

  // flag for scroll snap init
  var scrollSnapInit = false;

  // flags for whether charts have appeared
  var speedMap = false;
  var speedMapEl = $('.speed svg');

  var gSpeedChart = false;
  var gSpeedChartEl = $('.global-speed-chart');

  var gCostChart = false;
  var gCostChartEl = $('.global-cost-chart');

  var donutChart = false;
  var donutChartEl = $('.donut-chart');

  var costChart = false;
  var costChartEl = $('.cost-chart');

  // check if element is in the viewport
  var isInViewport = function(el) {
    var elementTop = el.offset().top;
    var elementBottom = elementTop + el.outerHeight();
    var viewportTop = jQuery(window).scrollTop();
    var viewportBottom = viewportTop + jQuery(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
  };

  function resizeStatCol(col) {
    $('.story').each(function() {
      var thisStory = $(this);
      var thisCol = thisStory.find(col);
      var maxWidth = 0;
      thisCol.each(function() {
        var statNumWidth = $(this).children('.stat-num').width();
        if (statNumWidth > maxWidth) {
          maxWidth = statNumWidth;
        }
      });
      thisCol.children('.stat-num').width(maxWidth);
    });
  }

  $(window).on('load resize scroll', function() {
    var throttled = false;
    var delay = 250;

    // only run if we're not throttled
    if (!throttled) {
      var w = window.innerWidth;

      // set fixed dimensions on stat columns
      if (w > 599) {
        resizeStatCol('.stat.left-col');
        resizeStatCol('.stat.right-col');
      }

      // set up scroll snapping js format
      if (w > 767) {
        if (scrollSnapInit == false) {
          scrollSnap();
          scrollSnapInit = true;
        }
      }
      else {
        if (scrollSnapInit == true) {
          $.scrollify.destroy();
          scrollSnapInit = false;
        }
        buildMobileCharts();
      }

      // we're throttled!
      throttled = true;

      // set a timeout to un-throttle
      setTimeout(function() {
        throttled = false;
      }, delay);
    }
  });

  function scrollSnap() {
    $.scrollify({
      section : ".story-wrap .story",
      sectionName : "section-name",
      interstitialSection : ".footer",
      easing: "easeOutExpo",
      scrollSpeed: 1100,
      offset : 0,
      scrollbars: true,
      standardScrollElements: "",
      setHeights: true,
      overflowScroll: true,
      updateHash: true,
      touchScroll:true,
      before:function(index, elements) {

        // disable charts
        var inFooter = false;
        if (index == 8) {
          inFooter = true;
          $('body').addClass('hide-pagination');
        }
        else {
          $('body').removeClass('hide-pagination');
        }
        removeCharts(inFooter);

        // build charts based on story
        if (index == 4) {
          if (!gSpeedChart) {
            globalSpeedChart()
            gSpeedChart = true;
          }

          if (!gCostChart) {
            globalCostChart();
            gCostChart = true;
          }
        }
        else if (index == 5) {
          if (!donutChart) {
            createDonutChart('.future .donut-chart', 80);
            donutChart = true;
          }
        }
        else if (index == 7) {
          if (!costChart) {
            costReduceChart();
            costChart = true;
          }
        }

        var this_elem = elements[index];
        // switch active classes on sections
        $('.story').removeClass('active');
        this_elem.addClass('active');

        // switch active classes on pagination items
        var pagination_items = $('.bb-numbers-pagination li');
        pagination_items.children('a').removeClass('active');
        pagination_items.eq(index).children('a').addClass('active');
      },
      after:function(index, elements) {

      },
      afterResize:function() {},
      afterRender:function() {}
    });

    $('.down-arrow').on('click', function() {
      $.scrollify.move("#adoption");
    });

    $('.up-arrow').on('click', function() {
      $.scrollify.move("#cost");
    });

    $('.bb-numbers-pagination a').on('click', function() {
      var linkDest = $(this).attr('href');
      $.scrollify.move(linkDest);
    });
  }


  // initialize d3 charts in mobile
  function buildMobileCharts() {
    // only run if we're not throttled
    if (!speedMap && isInViewport(speedMapEl)) {
      speedMapChart();
      speedMap = true;
    }

    if (!gSpeedChart && isInViewport(gSpeedChartEl)) {
      globalSpeedChart();
      gSpeedChart = true;
    }

    if (!gCostChart && isInViewport(gCostChartEl)) {
      globalCostChart();
      gCostChart = true;
    }

    if (!donutChart && isInViewport(donutChartEl)) {
      createDonutChart('.future .donut-chart', 80);
      donutChart = true;
    }

    if (!costChart && isInViewport(costChartEl)) {
      costReduceChart();
      costChart = true;
    }
  }

  function speedMapChart() {
    $('.story.speed').addClass('active');
  }

  // global speed chart
  function globalSpeedChart() {
    var data, margin, width, height, viewBox, parseDate, x, y,
        maxCost, xAxis, svg, bar;

    // broadband adoption data
    data = [{"place":"U.S.", "speed": 161},
            {"place":"Global", "speed": 85.7}];

    // dimensions
    margin = {top: 60, right: 0, bottom: 60, left: 0};
    width = 525 - margin.left - margin.right;
    height = 322.5 - margin.top - margin.bottom;
    viewBox = "0 0 525 322.5";

    x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .025, 0);

    y = d3.scale.linear()
        .range([height, 0]);

    svg = d3.select(".global-speed-chart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", viewBox)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    maxSpeed = d3.max(data, function(d) { return d.speed; });

    x.domain(data.map(function(d) { return d.place; }));
    y.domain([0, maxSpeed]);

    // Bars
  bar = svg.selectAll(".global-speed-chart-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", function(d) {
          if (d.place == "U.S.") {
            return "global-speed-chart-bar red"
          }
          else {
            return "global-speed-chart-bar blue"
          }
        })
        .attr("x", function(d) { return x(d.place); })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0);

  bar.transition()
      .duration(1500)
      .ease("ease-in-out")
      .attr("y", function(d) { return y(d.speed); })
      .attr("height", function(d) { return height - y(d.speed); })
      .each("end", function() {
        d3.selectAll(".global-speed-chart .chart-bar-label").attr("class", function(d) {
          if (d.place == "U.S.") {
            return 'chart-bar-label red reveal';
          }
          else {
            return 'chart-bar-label blue reveal';
          }
        });

        d3.selectAll(".global-speed-chart .chart-bar-data").attr("class", function(d) {
          if (d.place == "U.S.") {
            return 'chart-bar-data white reveal';
          }
          else {
            return 'chart-bar-data blue reveal';
          }
        });
      });

    svg.selectAll(".global-speed-chart .chart-bar-data")
      .data(data)
      .enter()
      .append("text")
      .attr("class", function(d) {
          if (d.place == "U.S.") {
            return 'chart-bar-data white';
          }
          return 'chart-bar-data blue';
      })
      .attr("x", function(d) { return x(d.place) + (x.rangeBand() / 2) })
      .attr("y", function(d){ return height - 30; })
      .text(function(d) { return d.speed + " Mbps"; })
      .attr("text-anchor", "middle");

    svg.selectAll(".global-speed-chart .chart-bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", function(d) {
          if (d.place == "U.S.") {
            return 'chart-bar-label red';
          }
          return 'chart-bar-label blue';
      })
      .attr("x", function(d) { return x(d.place) + (x.rangeBand() / 2) })
      .attr("y", function(d){ return y(d.speed) - 30; })
      .text(function(d) { return d.place; })
      .attr("text-anchor", "middle");

      // chart label
    svg.append("text")
      .attr("class", "chart-label")
      .attr("x", function(d) { return (width / 2) })
      .attr("y", function(d){ return height + 50; })
      .text("Average Download Speed")
      .attr("text-anchor", "middle");

  }


  // global cost chart
  function globalCostChart() {
    var data, margin, width, height, viewBox, parseDate, x, y,
        maxCost, xAxis, svg, bar;

    // broadband adoption data
    data = [{"place":"U.S.", "cost": 0.30},
            {"place":"Europe", "cost": 0.34}];

    // dimensions
    margin = {top: 60, right: 0, bottom: 60, left: 0};
    width = 525 - margin.left - margin.right;
    height = 232.5 - margin.top - margin.bottom;
    viewBox = "0 0 525 232.5";

    x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .025, 0);

    y = d3.scale.linear()
        .range([height, 0]);

    svg = d3.select(".global-cost-chart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", viewBox)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    maxCost = d3.max(data, function(d) { return d.cost; });

    x.domain(data.map(function(d) { return d.place; }));
    y.domain([0, maxCost]);

    // Bars
  bar = svg.selectAll(".global-cost-chart-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", function(d) {
          if (d.place == "U.S.") {
            return "global-cost-chart-bar red"
          }
          else {
            return "global-cost-chart-bar blue"
          }
        })
        .attr("x", function(d) { return x(d.place); })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0);

  bar.transition()
      .duration(1500)
      .ease("ease-in-out")
      .attr("y", function(d) { return y(d.cost); })
      .attr("height", function(d) { return height - y(d.cost); })
      .each("end", function() {
        d3.selectAll(".global-cost-chart .chart-bar-label").attr("class", function(d) {
          if (d.place == "U.S.") {
            return 'chart-bar-label red reveal';
          }
          else {
            return 'chart-bar-label blue reveal';
          }
        });

        d3.selectAll(".global-cost-chart .chart-bar-data").attr("class", function(d) {
          if (d.place == "U.S.") {
            return 'chart-bar-data white reveal';
          }
          else {
            return 'chart-bar-data blue reveal';
          }
        });
      });

      svg.selectAll(".global-cost-chart .chart-bar-data")
        .data(data)
        .enter()
        .append("text")
        .attr("class", function(d) {
            if (d.place == "U.S.") {
              return 'chart-bar-data white';
            }
            return 'chart-bar-data blue';
        })
        .attr("x", function(d) { return x(d.place) + (x.rangeBand() / 2) })
        .attr("y", function(d){ return height - 30; })
        .text(function(d) { return '$' + d.cost.toFixed(2); })
        .attr("text-anchor", "middle");

    svg.selectAll(".global-cost-chart .chart-bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", function(d) {
        if (d.place == "U.S.") {
          return 'chart-bar-label red';
        }
        return 'chart-bar-label blue';
      })
      .attr("x", function(d) { return x(d.place) + (x.rangeBand() / 2) })
      .attr("y", function(d){ return y(d.cost) - 30; })
      .text(function(d) { return d.place; })
      .attr("text-anchor", "middle");

      // chart label
    svg.append("text")
      .attr("class", "chart-label")
      .attr("x", function(d) { return (width / 2) })
      .attr("y", function(d){ return height + 50; })
      .text("Average Price Per Mbps")
      .attr("text-anchor", "middle");

  }


  // function to generate each donut chart
  function createDonutChart(selector, percent) {
    var duration = 2000;
    var transition = 200;
    var width = $(selector).width();
    var height = width;
    var viewBox = "0 0 " + width + " " + height;

    var dataset = {
                lower: calcPercent(0),
                upper: calcPercent(percent)
            },
            radius = Math.min(width, height) / 2.25,
            pie = d3.layout.pie().sort(null),
            format = d3.format(".0%");

    var arc = d3.svg.arc()
            .innerRadius(radius * .5)
            .outerRadius(radius);

    var svg = d3.select(selector).append("svg")
            .attr("viewBox", viewBox)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var path = svg.selectAll("path")
                    .data(pie(dataset.lower))
                    .enter().append("path")
                    .attr("class", function (d, i) {
                        return "color" + i
                    })
                    .attr("d", arc)
                    .each(function (d) {
                        this._current = d;
                    });

    var progress = 0;

    var timeout = setTimeout(function () {
        clearTimeout(timeout);
        path = path.data(pie(dataset.upper));
        path.transition().duration(duration).attrTween("d", function (a) {
            var i = d3.interpolate(this._current, a);
            var i2 = d3.interpolate(progress, percent)
            this._current = i(0);
            return function (t) {
                return arc(i(t));
            };
        });
    }, 200);

    function calcPercent(percent) {
        return [percent, 100 - percent];
    };
  }

  // cost chart
  function costReduceChart() {
    var data, margin, width, height, viewBox, parseDate, x, y,
        maxCost, xAxis, svg, bar;

    // broadband adoption data
    data = [{"year":"2000", "cost": 28.13},
            {"year":"2020", "cost": 0.64}];

    // dimensions
    margin = {top: 50, right: 0, bottom: 50, left: 0};
    width = 525 - margin.left - margin.right;
    height = 300 - margin.top - margin.bottom;
    viewBox = "0 0 525 300";

    parseDate = d3.time.format("%Y").parse;

    // Take each row and put the date column through the parsedate form we've defined above.
    data.forEach(function(d) {
      d.year = parseDate(d.year);
    });

    x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .05, 0);

    y = d3.scale.linear()
        .range([height, 0]);

    xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(d3.time.format("%Y"))
        .tickSize(0)
        .orient("bottom");

    svg = d3.select(".cost-chart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", viewBox)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    maxCost = d3.max(data, function(d) { return d.cost; });

    x.domain(data.map(function(d) { return d.year; }));
    y.domain([0, maxCost]);

    // add axes and labels
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Bars
  bar = svg.selectAll(".cost-chart-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "cost-chart-bar")
        .attr("x", function(d) { return x(d.year); })
        .attr("y", height / 2)
        .attr("width", x.rangeBand())
        .attr("height", height / 2);

  bar.transition()
      .duration(1500)
      .ease("ease-in-out")
      .attr("y", function(d) { return y(d.cost); })
      .attr("height", function(d) { return height - y(d.cost); })
      .each("end", function() {
        d3.selectAll(".cost-chart-bar-label").attr("class", function(d) {
          return 'cost-chart-bar-label white reveal';
        })
      });

  svg.selectAll(".cost-chart-bar-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", function(d) {
        var year = d.year.getFullYear();
        if (year == 2000) {
          return 'cost-chart-bar-label white';
        }
        return 'cost-chart-bar-label red';
    })
    .attr("x", function(d) { return x(d.year) + (x.rangeBand() / 2) })
    .attr("y", function(d){ return height - 30; })
    .text(function(d) { return '$' + d.cost; })
    .attr("text-anchor", "middle");

    // chart label
  var costLabel = svg.append("text")
    .attr("class", "cost-percent-label")
    .attr("x", function(d) { return (x.rangeBand() * 1.55) })
    .attr("y", 0)
    .text("98")
    .attr("text-anchor", "middle");

  costLabel.append("tspan")
    .attr("class", "cost-percent-label-sign")
    .attr("dx", "3px")
    .text("%");

    // chart label
  svg.append("text")
    .attr("class", "cost-percent-label-text")
    .attr("x", function(d) { return (x.rangeBand() * 1.55) })
    .attr("y", 30)
    .text("Decrease")
    .attr("text-anchor", "middle");
  }


  // wrapper function to remove charts on section transitions
  function removeCharts(inFooter) {
    if (inFooter == false) {
      removeCostChart();
    }
    removeGlobalSpeedChart();
    removeGlobalCostChart();
    removeDonutChart();
  }

  function removeCostChart() {
    $('.cost-chart svg').remove();
    costChart = false;
  }

  function removeGlobalSpeedChart() {
    $('.global-speed-chart svg').remove();
    gSpeedChart = false;
  }

  function removeGlobalCostChart() {
    $('.global-cost-chart svg').remove();
    gCostChart = false;
  }

  function removeDonutChart() {
    $('.future .donut-chart svg').remove();
    donutChart = false;
  }


});
