var w = 1200;
var h = 600;
var padding = 55;

d3.tsv("timeseries.tsv", function(error, data) {
   if (error) {
     console.log(error);
   } else {
     // Very important step, without it, functions like d3.max() will behave abnormally;
     var j, value;
     var d = new Array();
     for (var i=0; i<data.length; i++) d[i] = new Date();
     for (var i=0; i<data.length; i++) {
        j = 0; 
        for (var opt in data[i]) {
        	  value = opt;
        	  if (j == 0) {
        	  	  d[i].setFullYear(parseInt((data[i][value]).substring(0,4)),
                               parseInt((data[i][value]).substring(4,6)),
                               parseInt((data[i][value]).substring(6,8))
                              );
              d[i].setHours(12,0,0,0);
              data[i][value] = d[i];
           } else {
           	  data[i][value] = parseFloat(data[i][value]);
           }
        	  j++;
        } 
     }
     plot(data); 
  }
 });
 
plot = function (data) {
	  var month = ["Jan", "Feb", "Mar",
	               "Apr", "May", "Jun",
	               "Jul", "Aug", "Sep",
	               "Oct", "Nov", "Dec"
	              ]  
     var entryNumber = data.length;
     var xScale, xValue;
     var yScale, yValue = [], yMax = 0.0, yMin = 100.0;    
     
     var i = 0;
     for (var opt in data[0]) {
        if (i == 0) {
           xValue = opt;
        } else {
        	  yValue[i-1] = opt;
        	  var temp = d3.max(data, function(d) { return d[yValue[i-1]]; });
        	  if (yMax < temp) yMax = temp;
        	  temp = d3.min(data, function(d) { return d[yValue[i-1]]; });
        	  if (yMin > temp) yMin = temp;
        }
        i++;
     }

     xScale = d3.time.scale()
                     .range([padding, w - padding])
                     .domain(d3.extent(data, function (d) { return d[xValue]; }));
 	  yScale = d3.scale.linear()
                .domain([0, yMax])
                .range([h - padding, padding])
                .nice();
     
     var averageTemp = [];
     for (var i=0; i<3; i++) {
     	  averageTemp[i] = new Array();
     	  for (var j=0; j<entryNumber; j++)
     	     averageTemp[i][j] = {"x": data[j][xValue], "y": data[j][yValue[i]] };
     }
 
     var topTemp = [];
     for (var i=0; i<entryNumber; i++) 
        topTemp[i] = d3.max([data[i][yValue[0]], data[i][yValue[1]], data[i][yValue[2]]]);
     
     var lineGenerator = d3.svg.line()
                               .interpolate("basis")
                               .x(function (d) { return xScale(d.x); })
                               .y(function (d) { return yScale(d.y); });

     var svg = d3.select("body")
                 .append("svg")
                 .attr("width", w)
                 .attr("height", h);
     
     var seriesColor = ["darkblue", "lightblue", "cyan"];
     for (var i=0; i<3; i++) {
         svg.append("path")
            .attr("class", "dataline")
            .attr("d", lineGenerator(averageTemp[i]))
            .attr("id", i)
            .attr("stroke", seriesColor[i])
            .attr("stroke-width", 2)
            .attr("fill", "none");                                
     }
 
   svg.selectAll("path")
      .on("mouseover", function() { 
      	var pathID = parseInt(this.id);
      	var restPathID = [];
      	if (pathID == 0) {restPathID[0] = 1; restPathID[1] = 2;}
         if (pathID == 1) {restPathID[0] = 0; restPathID[1] = 2;}
         if (pathID == 2) {restPathID[0] = 0; restPathID[1] = 1;}
      	var xScreen = d3.mouse(this)[0];
      	var yScreen = d3.mouse(this)[1];
      	var xData = xScale.invert(xScreen);
       	var yData = yScale.invert(yScreen);
       	
      	var dataID = 0;
       	for (var i=0; i<entryNumber; i++) if (xData >= data[i][xValue]) dataID = i;
       	dataID +=1;

         var dataTrim = d3.format(".1f");		   
		   svg.append("text")
		      .attr("class", "tooltip")
		      .attr("id", "ytooltip1")
			   .attr("x", xScreen + 5)
			   .attr("y", yScreen - 5)
			   .text(dataTrim(yData));
		   svg.append("text")
		      .attr("class", "tooltip")
		      .attr("id", "ytooltip2")
			   .attr("x", xScreen + 5)
			   .attr("y", yScale(data[dataID][yValue[restPathID[0]]]) - 5)
			   .text(dataTrim(data[dataID][yValue[restPathID[0]]]));
		   svg.append("text")
		      .attr("class", "tooltip")
		      .attr("id", "ytooltip3")
			   .attr("x", xScreen + 5)
			   .attr("y", yScale(data[dataID][yValue[restPathID[1]]]) - 5)
			   .text(dataTrim(data[dataID][yValue[restPathID[1]]]));
		   svg.append("text")
		      .attr("class", "tooltip")
		      .attr("id", "xtooltip")
			   .attr("x", xScreen + 5)
			   //.attr("x", function(xScreen) { if (xScreen > 0.5 * w) return 600; else return xScreen;})
			   .attr("y", h - 1.2* padding)
			   .text(month[xData.getMonth()] + " " + xData.getDate() + " '" + (parseInt(xData.getFullYear()) - 2000));			   
/*   	   svg.append("circle")
			   .attr("id", "highlightCircle")
				.attr("cx", xScreen)
				.attr("cy", yScreen)
				.attr("r", 4);*/
		   svg.append("path")
		      .attr("id", "dataPositionLine")
		      .attr("d", "M " + xScale(data[dataID][xValue]) + " " + padding + " "
		                 + "L " + xScale(data[dataID][xValue]) + " " + yScale(0)
		           )
		      .attr("stroke", "red")
		      .attr("stroke-width", 0.5)
		      .attr("fill", "none");
		})
		.on("mouseout", function() {
		  	 d3.select("#ytooltip1").remove();
		  	 d3.select("#ytooltip2").remove();
		  	 d3.select("#ytooltip3").remove();
		  	 d3.select("#xtooltip").remove();
		  	 //d3.select("#highlightCircle").remove();
		  	 d3.select("#dataPositionLine").remove();	
		});

     svg.append("g")
        .attr("class", "x axis")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .tickFormat(d3.time.format("%b '%y"))
             )
        .append("text")
        .attr("class", "label")
        .attr("id", "xLabel")
        .attr("x",w/2)
        .attr("y", padding)
        .text("Date");
        
     svg.append("g")
        .attr("class", "y axis")
        .attr("id", "yAxis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5))
        .append("text")
        .attr("class", "label")
        .attr("id", "yLabel")
        .attr("x", -padding*3)
        .attr("y", h/2)
        .attr("transform", "rotate(" + (-90) + " " + (-padding/1.5) + " " + h/2 + ")")
        .text("Daily Average Temperature (F)");
     
     for (var i=0; i<3; i++) { 
        svg.append("path")
           .attr("class", "legend")
	        .attr("d", "M " + (100 + i * 150) + " 50 "
		              + "L " + (200 + i * 150) + " 50 "
	             )
	        .attr("stroke", seriesColor[i])
           .attr("stroke-width", 2)
           .attr("fill", "none");
        svg.append("text")
           .attr("id", "legendText")
           .attr("x", 100 + i * 150)
           .attr("y", 45)
           .text(yValue[i]);
	  }
}

