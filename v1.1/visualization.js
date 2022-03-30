//Width and height of map
const width = 960;
const height = 500;

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
const svg = d3.select("body")
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);



const g = svg.append("g");

const div = d3.select("body")
    .append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);


d3.json("us-states.json").then(function(json) {
    // Bind the data to the SVG and create one path per GeoJSON feature
    // console.log(json.features);
    const states = g.append("g")
        .attr("fill", "#444")
        .attr("cursor", "pointer")
        .selectAll("path")
        .data(json.features)
        .join("path")
        .on("click", clicked)
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
                .style("fill", "blue")	
                .style("opacity", 0.85)	

            .on("mouseover", function(event, d) {      
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                    div.text(d.resort_name)
                    .style("left", (event.pageX) + "px")     
                    .style("top", (event.pageY - 28) + "px");    
            })  
            // fade out tooltip on mouse out               
            .on("mouseout", function(event, d) {       
                div.transition()        
                .duration(500)      
                .style("opacity", 0);   
            });
    });
});

function clicked(event, d) {    
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    // d3.select(this).transition().style("fill", "green");
    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, svg.node())
      );
}

// function reset() {
//     svg.transition().duration(750).call(
//       zoom.transform,
//       d3.zoomIdentity,
//       d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
//     );
//   }
d3.select('svg')
  .call(zoom);

function zoomed(event) {
    const {transform} = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }


