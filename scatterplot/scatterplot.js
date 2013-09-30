var w = 600;
var h = 600;
var padding = 60;
var dataset = [];
var xValue = "Fmax";
var yValue = "Fmax";
var circleColor = "black";
var circleOpacity = 1.0;
var durationTransition = 1000;
var easingStyle = "linear";

d3.csv("scatterplot.csv", function(error, data) {
   if (error) {
     console.log(error);
   } else {
     // Very important step, without it, functions like d3.max() will behave abnormally;
     for (var i=0; i<data.length; i++)
        for (var opt in data[i])
           data[i][opt] = parseFloat(data[i][opt]);
           
     dataset = data; 
     plot(data);
  }
})

plot = function (data) {
     var xyForm = d3.select("body")
                    .select("form");
     for(var opt in data[0]) {
        xyForm.select("#xVariable")
              .append("option")
              .attr("value", opt)
              .text(opt);
        xyForm.select("#yVariable")
              .append("option")
              .attr("value", opt)
              .text(opt);
     }
     for(var opac = 1.0; opac >= 0.1; opac -= 0.1) {
     	  xyForm.select("#opacity")
     	        .append("option")
     	        .attr("value", parseInt(opac*10)/10)
     	        .text(parseInt(opac*10)/10);     
     }
     
     var entryNumber = data.length;
     var xMax = d3.max(data, function(d) { return d[xValue]; });
     var xMin = d3.min(data, function(d) { return d[xValue]; });
     var yMax = d3.max(data, function(d) { return d[yValue]; });
     var yMin = d3.min(data, function(d) { return d[yValue]; });    

     var xScale = d3.scale.linear()
                    .domain([0, xMax])
                    .range([padding, w - padding])
                    .nice();
     var yScale = d3.scale.linear()
                    .domain([0, yMax])
                    .range([h - padding, padding])
                    .nice();

     var svg = d3.select("body")
                 .append("svg")
                 .attr("width", w)
                 .attr("height", h);
                         
     svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "shape")
        .attr("cx", function(d) { return xScale(d[xValue]); })
        .attr("cy", function(d) { return yScale(d[yValue]); })
        .attr("r", 5)
        .attr("fill", circleColor)
        .attr("fill-opacity", circleOpacity)
        .on("mouseover", function(d) {
				var xPosition = parseFloat(d3.select(this).attr("cx"));
				var yPosition = parseFloat(d3.select(this).attr("cy"));
				
				svg.append("text")
				   .attr("id", "tooltip")
				   .attr("x", xPosition)
				   .attr("y", yPosition-8)
				   .text("(" + d[xValue] +", " + d[yValue] + ")");
				svg.append("circle")
				   .attr("id", "highlightCircle")
				   .attr("cx", xPosition)
				   .attr("cy", yPosition)
				   .attr("r", 7)
			})
		   .on("mouseout", function() {
				d3.select("#tooltip").remove();
				d3.select("#highlightCircle").remove();
		   });
        
     svg.append("g")
        .attr("class", "axis")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(5))
        .append("text")
        .attr("class", "label")
        .attr("id", "xLabel")
        .attr("x",w/2)
        .attr("y", padding/1.5)
        .text(xValue);
        
     svg.append("g")
        .attr("class", "axis")
        .attr("id", "yAxis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5))
        .append("text")
        .attr("class", "label")
        .attr("id", "yLabel")
        .attr("x", -padding/1.5)
        .attr("y", h/2)
        .attr("transform", "rotate(" + (-90) + " " + (-padding/1.5) + " " + h/2 + ")")
        .text(yValue);                                 	  
}

function replot(sel) {

  if (sel.id == "xVariable") { xValue = sel.options[sel.selectedIndex].value; }
  else if (sel.id == "yVariable") { yValue = sel.options[sel.selectedIndex].value; }
  else if (sel.id == "opacity") { circleOpacity = parseFloat(sel.options[sel.selectedIndex].value); }
  else { alert("bad thing happened.") };
  
  var entryNumber = dataset.length;
  var xMax = d3.max(dataset, function(d) { return d[xValue]; });
  var xMin = d3.min(dataset, function(d) { return d[xValue]; });
  var yMax = d3.max(dataset, function(d) { return d[yValue]; });
  var yMin = d3.min(dataset, function(d) { return d[yValue]; });    
 
  var xScale = d3.scale.linear()
                    .domain([0, xMax])
                    .range([padding, w - padding])
                    .nice();
  var yScale = d3.scale.linear()
                    .domain([0, yMax])
                    .range([h - padding, padding])
                    .nice();
                    
  var svg = d3.select("body")
              .select("svg");
  
  svg.selectAll("circle")
     .data(dataset)
     .transition()
     .duration(durationTransition)
     .ease(easingStyle)
     .attr("cx", function(d) { return xScale(d[xValue]); })
     .attr("cy", function(d) { return yScale(d[yValue]); })
     .attr("r", 5)
     .attr("fill", circleColor)
     .attr("fill-opacity", circleOpacity);
     
  svg.selectAll("circle")
     .on("mouseover", function(d) {
 	 	   var xPosition = parseFloat(d3.select(this).attr("cx"));
		   var yPosition = parseFloat(d3.select(this).attr("cy"));
				
		   svg.append("text")
		      .attr("id", "tooltip")
			   .attr("x", xPosition)
			   .attr("y", yPosition-8)
			   .text("(" + d[xValue] +", " + d[yValue] + ")");
   	   svg.append("circle")
			   .attr("id", "highlightCircle")
				.attr("cx", xPosition)
				.attr("cy", yPosition)
				.attr("r", 7)			   
	   })
		.on("mouseout", function() {
		  	 d3.select("#tooltip").remove();	
		  	 d3.select("#highlightCircle").remove();
		});
       
  svg.select("#xAxis") 
     .transition()
     .duration(durationTransition)
     .ease(easingStyle)
     .call(d3.svg.axis()
                 .scale(xScale)
                 .orient("bottom")
                 .ticks(5));
 
  svg.select("#xLabel")
     .transition()
     .duration(durationTransition)
     .ease(easingStyle)  
     .text(xValue);
                    
  svg.select("#yAxis") 
     .transition()
     .duration(durationTransition)
     .ease(easingStyle)     
     .call(d3.svg.axis()
                 .scale(yScale)
                 .orient("left")
                 .ticks(5));
  
  svg.select("#yLabel")
     .transition()
     .duration(durationTransition)
     .ease(easingStyle)     
     .text(yValue);                                  
}
