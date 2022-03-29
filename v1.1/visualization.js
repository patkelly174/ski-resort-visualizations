//Width and height of map
var width = 960;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
                .translate([width/2, height/2])    // translate to center of screen
                .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection

//Create SVG element and append map to the SVG
var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

var div = d3.select("body")
    .append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

d3.json("us-states.json", function (json) {


    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1")
    	.style("fill", "gray");

    
    // Map the cities I have lived in!
    d3.csv("ski_resort_stats.csv", function(data) {

        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", 3)
                .style("fill", "blue")	
                .style("opacity", 0.85)	

            .on("mouseover", function(d) {      
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                    div.text(d.resort_name)
                    .style("left", (d3.event.pageX) + "px")     
                    .style("top", (d3.event.pageY - 28) + "px");    
            })  
            // fade out tooltip on mouse out               
            .on("mouseout", function(d) {       
                div.transition()        
                .duration(500)      
                .style("opacity", 0);   
            }); 
        
        });  


});