


var user = JSON.parse(document.getElementById("user").innerHTML)



var ControlContainer = React.createClass({

    getInitialState: function() {
    return { 

    };
    },

    componentDidMount: function() {

      var followers = changeCoord(user.strava.followers)
      var component = this;
      component.setState({graphData: user})
      component.setState({mapData: followers})
      component.setState({tab: 0})
    },

    setTab0: function() {
      this.setState({tab: 0})
    },

    setTab1: function () {
      this.setState({tab: 1})
    },

    render: function() {


       return (
       	  <div>
          <div className="header">
          <div className="logo">
          <img className="title-img" src="../public/img/world.png"/>
          <h1 className="title"> StravaSocial </h1>
          </div>
          <h3> Social Analytics For Strava Athletes </h3>
          <img src={user.strava.details.profile} />  

          </div>
          <br/> 
          <p> You are viewing data for {user.strava.details.firstname} {user.strava.details.lastname} </p>
            <button className="btn btn-primary" onClick={this.setTab0}> See Your Athlete Social Network </button>
            <button className="btn btn-primary" onClick={this.setTab1}> View Your Global Follower Map </button>
          	<p> Hover Over Athletes for Detailed Info </p>
            
            	{this.state.tab === 0 ?
                          <SocialNetwork data={this.state.graphData} />
                          :null}
              {this.state.tab === 1 ?
                          
                          <GlobalMap data={this.state.mapData} />
                          :null}
  			</div>
  );
     }  




});


var GlobalMap = React.createClass({


     getInitialState: function() {
      
    return { 
      data: this.props.data
    };
    },

    componentDidMount: function() {
      this.appendMap()
    },


    componentWillReceiveProps: function() {
          this.appendGraph()
    },

    componentDidUpdate: function() {
      this.appendMap()
    },

    appendMap: function () {

      var myFollowers = this.props.data

  

    var width = "90%",
    height = 500;


//ADD SVG
d3.select("svg").remove();
var svg = d3.select("#globalMap").append("svg")
    .attr("width", width)
    .attr("height", height)
    .classed("map", true)


//ADD TOOLTIP
 var tooltip = d3.select("#globalMap").append("div").attr("class", "tooltip").style("opacity", 0)

//ADD PROJECTION - center and scale
var projection = d3.geo.mercator()
    .center([0, 0]) //LON (left t0 right) + LAT (up and down)
    .scale(150) //DEFAULT Is 150
    .rotate([0,0, 0]); //longitude, latitude and roll - if roll not specified - uses 0 - rotates the globe

//PATH GENERATOR USING PROJECTION
var path = d3.geo.path()
    .projection(projection);

//G AS APPENDED SVG
var g = svg.append("g");

getMap()

function getMap() {


// load and display the World
d3.json('https://raw.githubusercontent.com/mbostock/topojson/master/examples/world-110m.json', function(json) {
  g.selectAll('path') //act on all path elements
    .data(topojson.feature(json, json.objects.countries).features) //get data
    .enter() //add to dom
    .append('path')
    .attr('fill', '#95E1D3')
    .attr('stroke', '#266D98')
    .attr('d', path)



    drawData()




});


// zoom and pan
var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("path")  
            .attr("d", path.projection(projection)); 
  });

svg.call(zoom)


}



//ZOOM 



function drawData () {


  var data = myFollowers;



   var max = d3.max(data, function(d) { return d.followerNumber});
     var min = d3.min(data, function (d) { return d.followerNumber})

  var radiusScale = d3.scale.linear().domain([min, max]).range([1, 5])

    
       var circle =  g.selectAll("circle")
           .data(data)
           .enter()
           .append("circle")
          .attr('cx', function(d) { return projection([d.long,d.lat])[0] })
          .attr('cy', function(d) { return projection([d.long,d.lat])[1] })
           .attr("r", function(d) {
            return 3;
           })
           .style("fill", function(d) {

            return "black"

           })
           .style("opacity", "0.5");


circle.on("mouseover", function (d) {

  if (!d.followerNumber) {
    d.followerNumber === "Unknown"
  }

  d3.select(this).style("fill", "steelblue").style("opacity", 1).attr("r", function(d) {
    return 5;
  })

       var string = "<img class='profile-pic' style='width: 20px, height: 20px' src=" + d.profile + "/>";
      
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.8)
    tooltip.html("Name: " + d.firstname + " " + d.lastname + "<br>Followers: " + d.followerNumber + "<br>Country: " + d.country + "<br>City: " + d.city) 
        .style("left", (d3.event.pageX + 10) + "px")     
            .style("top", (d3.event.pageY - 28) + "px");    
   }) 
   
circle.on("mouseout", function(d) {

  d3.select(this).style("fill", "black").style("opacity", 0.5).attr("r", function(d) {
    return 3;
  })

     tooltip.transition()
        .duration(200)
        .style("opacity", 0)
   })

   


}





    },

    render: function() {

      

       return (
          <div>
            <div id="globalMap"> </div>
        </div>
  );
     }  




});




var SocialNetwork = React.createClass({

    getInitialState: function() {
    return { 
      data: this.props.data
    };
    },

     shouldComponentUpdate: function(nextProps, nextState) {
      if (nextProps.id === this.props.id) {
        return false;
      }
      else { return true; }
    }, 


    componentWillReceiveProps: function() {
      if (this.props.data) {
          this.appendGraph()
      }
    },

    componentDidMount: function() {
      if (this.props.data) {
          this.appendGraph()
      }
    },


    appendGraph: function() {

   var user = this.props.data;
      var newLinks = [];
      var followers = user.strava.followers;

      //CREATE FIRST OBJ
      var followerObj = {};
      followerObj.source = user.strava.id
      followerObj.target = user.strava.id
      followerObj.name = user.strava.details.firstname
      followerObj.lastname = user.strava.details.lastname
      followerObj.img = user.strava.details.profile
      followerObj.class = "user"
      newLinks.push(followerObj)

      followers.forEach(function(follower) {


      var followerObj = {};
      followerObj.source = user.strava.id
      followerObj.target = follower.id;
      followerObj.name = follower.firstname;
      followerObj.lastname = follower.lastname
      followerObj.img = follower.profile;
      followerObj.followerNumber = follower.followerNumber;
      followerObj.country = follower.country;
      newLinks.push(followerObj)

      if (follower.followers) {
      follower.followers.forEach(function(follower2) {


      if (user.strava.followerIds.indexOf(follower2) > -1) {
      var follower2Obj = {}
      follower2Obj.source = follower.id;
      follower2Obj.target = follower2;
      follower2Obj.followerNumber = getValue(follower2, "followerNumber")
      follower2Obj.name = getValue(follower2, "firstname");
      follower2Obj.lastname = getValue(follower2, "lastname");
      follower2Obj.img = getValue(follower2, "profile");
      follower2Obj.country = getValue(follower2, "country")
      newLinks.push(follower2Obj)
      }


      });

      }





      })






      function getValue (id, value) {
      var returnValue;
      followers.forEach(function(follower) {
      if (follower.id === id) {
      returnValue = follower[value]
      }
      })
      return returnValue;
      }


      var links = newLinks

      createGraph(links)



      function createGraph(data) {


      var nodes = {};

      links.forEach(function(link) {
      //USER NODE
      link.source = nodes[link.source] || (nodes[link.source] = {img: link.img, name: link.name, lastname: link.lastname, class: link.class});
      //FOLLOWER NODES
      link.target = nodes[link.target] || (nodes[link.target] = {img: link.img, name: link.name, lastname: link.lastname});
      });


      var padding = window.innerWidth / 20;

      var width = window.innerWidth - padding*2,
      height = 900;

      d3.select("svg").remove();
      var svg = d3.select("#graph").append("svg")
      .attr("width", width)
      .attr("height", height);



      var tooltip = d3.select("#graph").append("div").attr("class", "tooltip").style("opacity", 0)





      var force = d3.layout.force()
      .nodes(d3.values(nodes)) //CREATES AN ARRAY FROM OUR OBJECT
      .links(links) 
      .size([width, height])
      .gravity(0.22)
      .linkDistance(70)
      .charge(function(d) {
      return -((d.weight * 70) +500);
      })
      .on("tick", tick) //RUNS LAYOUT ONE STEP
      .start(); //STARTS SIMULATION - NEEDS TO BE RUN WHEN LAYOUT FIRST CREATED




      var link = svg.selectAll(".link")
      .data(force.links()) 
      .enter().append("line")
      .attr("class", "link");

      var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      .on("mouseover",  mouseover)
      .on("mouseout", mouseout)
      .call(force.drag); //MAKES IT DRAGGABLE



      node.append("circle")
      .attr("r", function(d) {
      var value = d.class === "user" ? 25 : d.weight /5 + 14
      return value
      })
      .style("fill", function(d) {
      var value = d.class === "user" ? "steelblue" : "black"
      return value
      })
      .classed("circle", true)


      //FOR USERS
      node.append("image")
      .attr('xlink:href', function(d) {

      return d.img;
      })
      .attr('class', 'profile-pic')
      .attr('height', function(d) {
      var value = d.class === "user" ? 30 : 20
      return value;
      })
      .attr('width', function(d) {
      var value = d.class === "user" ? 30 : 20
      return value;
      })

      .attr('x', function(d) {
      var value = d.class === "user" ? -15 : -10
      return value;
      })
      .attr('y', function(d) {
      var value = d.class === "user" ? -15 : -10
      return value;
      return -10
      })




      function tick() {
      link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

      node
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("fill", "black")
      }


      function mouseover(d) {



      if (!d.followerNumber) {
      d.followerNumber = "Unknown"
      }

      tooltip.transition()
      .duration(200)
      .style("opacity", 0.7)
      tooltip.html(d.name + " " + d.lastname)
      .style("left", (d3.event.pageX + 10) + "px")     
      .style("top", (d3.event.pageY - 28) + "px");   

      }

      function mouseout(d) {
      tooltip.transition()
      .duration(200)
      .style("opacity", 0)

      }


      }

    },

    render: function() {

       return (
          <div id="graph"> </div>
  );
     }  




});


var GlobalMap = React.createClass({


     getInitialState: function() {
      
    return { 
      data: this.props.data
    };
    },

    componentDidMount: function() {
      var component = this;
     if (this.state.data){
      component.appendMap()
     }

    },

    componentDidUpdate: function() {
      this.appendMap()
    },

    appendMap: function () {
      var myFollowers = this.state.data;

  

    var width = "90%",
    height = 500;


//ADD SVG
var svg = d3.select("#globalMap").append("svg")
    .attr("width", width)
    .attr("height", height)
    .classed("map", true)


//ADD TOOLTIP
 var tooltip = d3.select("#globalMap").append("div").attr("class", "tooltip").style("opacity", 0)

//ADD PROJECTION - center and scale
var projection = d3.geo.mercator()
    .center([0, 0]) //LON (left t0 right) + LAT (up and down)
    .scale(150) //DEFAULT Is 150
    .rotate([0,0, 0]); //longitude, latitude and roll - if roll not specified - uses 0 - rotates the globe

//PATH GENERATOR USING PROJECTION
var path = d3.geo.path()
    .projection(projection);

//G AS APPENDED SVG
var g = svg.append("g");

getMap()

function getMap() {


// load and display the World
d3.json('https://raw.githubusercontent.com/mbostock/topojson/master/examples/world-110m.json', function(json) {
  g.selectAll('path') //act on all path elements
    .data(topojson.feature(json, json.objects.countries).features) //get data
    .enter() //add to dom
    .append('path')
    .attr('fill', '#95E1D3')
    .attr('stroke', '#266D98')
    .attr('d', path)



    drawData()




});


// zoom and pan
var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("path")  
            .attr("d", path.projection(projection)); 
  });

svg.call(zoom)


}



//ZOOM 



function drawData () {


  var data = myFollowers;



   var max = d3.max(data, function(d) { return d.followerNumber});
     var min = d3.min(data, function (d) { return d.followerNumber})

  var radiusScale = d3.scale.linear().domain([min, max]).range([1, 5])

    
       var circle =  g.selectAll("circle")
           .data(data)
           .enter()
           .append("circle")
          .attr('cx', function(d) { return projection([d.long,d.lat])[0] })
          .attr('cy', function(d) { return projection([d.long,d.lat])[1] })
           .attr("r", function(d) {
            return 3;
           })
           .style("fill", function(d) {

            return "black"

           })
           .style("opacity", "0.5");


circle.on("mouseover", function (d) {

  if (!d.followerNumber) {
    d.followerNumber === "Unknown"
  }

  d3.select(this).style("fill", "steelblue").style("opacity", 1).attr("r", function(d) {
    return 5;
  })

       var string = "<img class='profile-pic' style='width: 20px, height: 20px' src=" + d.profile + "/>";
      
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.8)
    tooltip.html("Name: " + d.firstname + " " + d.lastname + "<br>Followers: " + d.followerNumber + "<br>Country: " + d.country + "<br>City: " + d.city) 
        .style("left", (d3.event.pageX + 10) + "px")     
            .style("top", (d3.event.pageY - 28) + "px");    
   }) 
   
circle.on("mouseout", function(d) {

  d3.select(this).style("fill", "black").style("opacity", 0.5).attr("r", function(d) {
    return 3;
  })

     tooltip.transition()
        .duration(200)
        .style("opacity", 0)
   })

   


}





    },

    render: function() {

      

       return (
          <div>
            <div id="globalMap"> </div>
        </div>
  );
     }  




});


ReactDOM.render(<ControlContainer />, document.getElementById("react-holder"));

function changeCoord (followers) {

        var followers = followers;
         
        var lats = []
        var longs = []

        followers.map(function(follower) {
            lats.push(follower.lat) 
            longs.push(follower.long)
        })

        lats.sort(function(a,b) {
          return a - b;
        })

        longs.sort(function(a,b) {
          return a-b;
        })
        console.log(longs)

        var newLats = [];
        var newLongs = []
        for (var i = 0; i < lats.length; i++) {
          if (lats[i] === lats[i-1]) {
            newLats.push(lats[i])
          }
        }

        for (var i = 0; i < longs.length; i++) {
            if (longs[i] === longs[i-1]) {
            newLongs.push(longs[i])
          }    
        }

        console.log(newLats)
        console.log(newLongs)

        function random () {

          return (Math.random() * 6) - 3;
        }
        
        followers.map(function(follower) {
          if (newLats.indexOf(follower.lat) > -1) {
            follower.lat += random()
          }
           if (newLongs.indexOf(follower.long) > -1) {
            follower.long += random() 
          }
        })
        
        return followers;
        }