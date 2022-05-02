//Width and height of map
const width = 960;
const height = 1000;


const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

// D3 Projection
const projection = d3.geoAlbersUsa()
                .translate([width/2, height/2])    // translate to center of screen
                .scale([1000]);          // scale things down so see entire US

// Define path generator
const path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection



//Create SVG element and append map to the SVG
const svg = d3.select("#svg-div")
            .append("svg")
            .attr("viewBox", [0, 250, width, height]);


const g = svg.append("g");


const tooltip = d3.select("body")
    .append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

const more_details = d3.select("body")
    .append("div")   
    .attr("class", "more_details")               
    .style("opacity", 0);

d3.json("us-states.json").then(function(json) {
    // Bind the data to the SVG and create one path per GeoJSON feature
    // console.log(json.features);
    const states = g.append("g")
        .attr("fill", "navy")
        .attr("cursor", "pointer")
        .selectAll("path")
        .data(json.features)
        .join("path")
        .on("click", clicked)
        .on("mouseover", listResorts)
        .attr("d", path);
        
    
    d3.csv("ski_resort_stats.csv").then(function (data) {
        g.selectAll("circle")
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
                .style("fill", "grey")	
                .style("opacity", 0.85)	

            .on("mouseover", function(event, d) { 
                tooltip.transition()        
                    .duration(200)      
                    .style("opacity", .9);
		    tooltip.text("Resort Name: " + d.resort_name + "\n"
			            + "Skiable Acres: " + d.acres + "\n"
                        + "Summit Height: " + d.summit + "\n"
                        +"Vertical Drop: " + d.vertical + "\n"
                        +"Lifts: " + d.lifts + "\n"
                        +"Annual Snowfall: " + d.annual_snowfall + " inches")
                    .style("left", (event.pageX) + "px")     
                    .style("top", (event.pageY - 28) + "px");    
            })  
            // fade out tooltip on mouse out               
            .on("mouseout", function(event, d) {       
                tooltip.transition()        
                .duration(500)      
                .style("opacity", 0);   
            })
            .on("click", details);
    });

    d3.csv("us-airports.csv").then(function (data) {
        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("y", function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("width", 4)
            .attr("height", 4)
            .attr("fill", "red")
            .on("mouseover", function(event, d) {      
                tooltip.transition()        
                    .duration(200)      
                    .style("opacity", .9);
		    tooltip.text(d.name + "\n")
                    .style("left", (event.pageX) + "px")     
                    .style("top", (event.pageY - 28) + "px");    
            })  
            // fade out tooltip on mouse out               
            .on("mouseout", function(event, d) {       
                tooltip.transition()        
                .duration(500)      
                .style("opacity", 0);   
            });

    });
});

let cur_state = null;

function clicked(event, d) { 
    d3.select(cur_state).transition().style("fill", "#444");   
    cur_state = this;
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    d3.select(this).transition().style("fill", "green");
    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, svg.node())
      );
}

let arr = [];
const resort_div = document.getElementById("resort-list");
const list_title = document.getElementById("list-title");

function listResorts(event, d) {
    arr = [];
    resort_div.innerText = "";
    list_title.innerText = d.properties.NAME + " Resorts";
    d3.csv("ski_resort_stats.csv").then(function (data) {
        data.forEach(data => {
            if (data.state.includes(d.properties.NAME)) {
                arr.push(data.resort_name);
            }
        });

        arr.forEach((item)=>{
            let li = document.createElement("li");
            li.innerText = item;
            resort_div.appendChild(li);
          })
    });
}


g.append("circle").attr("cx",100).attr("cy",800).attr("r", 6).style("fill", "grey");
g.append("rect").attr("x",95).attr("y",825).attr("width", 10).attr("height", 10).style("fill", "red");
g.append("text").attr("x", 120).attr("y", 800).text("Ski Resorts").style("font-size", "15px").style("fill", "navy").attr("alignment-baseline","middle");
g.append("text").attr("x", 120).attr("y", 830).text("Airports").style("font-size", "15px").style("fill", "navy").attr("alignment-baseline","middle");

g.append("rect").attr("x",240).attr("y",760).attr("width", 390).attr("height", 95).style("fill", "navy");
g.append("text").attr("x", 250).attr("y", 780).text("Mountain Statistics Definitions:").style("font-size", "15px").style("fill", "white").attr("alignment-baseline","middle").attr("font-weight", "bold");
g.append("text").attr("x", 260).attr("y", 800).text("Skiable Acres: the total area (or size) or skiable terrain").style("font-size", "10px").style("fill", "white").attr("alignment-baseline","middle");
g.append("text").attr("x", 260).attr("y", 810).text("Summit Height: height (in feet) of top of mountain").style("font-size", "10px").style("fill", "white").attr("alignment-baseline","middle");
g.append("text").attr("x", 260).attr("y", 820).text("Vertical Drop: elevation between summit and base of mountain").style("font-size", "10px").style("fill", "white").attr("alignment-baseline","middle");
g.append("text").attr("x", 260).attr("y", 830).text("Lifts: total count of lifts").style("font-size", "10px").style("fill", "white").attr("alignment-baseline","middle");
g.append("text").attr("x", 260).attr("y", 840).text("Annual Snowfall: total amount of snow per year (0 inches indicates missing data)").style("font-size", "10px").style("fill", "white").attr("alignment-baseline","middle");

g.append("text").attr("x", 670).attr("y", 780).text("Terrain Difficulty Key:").style("font-size", "15px").style("fill", "Navy").attr("alignment-baseline","middle").attr("font-weight", "bold");
g.append("text").attr("x", 680).attr("y", 800).text("Green = Easiest").style("font-size", "15px").style("fill", "green").attr("alignment-baseline","middle");
g.append("text").attr("x", 680).attr("y", 820).text("Blue = Intermediate").style("font-size", "15px").style("fill", "blue").attr("alignment-baseline","middle");
g.append("text").attr("x", 680).attr("y", 840).text("Black = Expert").style("font-size", "15px").style("fill", "black").attr("alignment-baseline","middle");




function details(event, d) {
    tooltip.text(d.resort_name + "\nGreen Percent: " + d.green_percent*100 + "%" + "\nBlue Percent: " + d.blue_percent*100 + "%" + "\nBlack Percent: " + d.black_percent*100 + "%");
}

d3.select('svg')
  .call(zoom);

function zoomed(event) {
    const {transform} = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }