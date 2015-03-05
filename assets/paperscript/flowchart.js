/**
 * Created by Stanislav on 17.2.2015.
 * Since JointJS does the same thing (it even has similar datastructure) there is little point to actually continuing to develop this
 * Nevertheless JoinJS is SVG and there actually aren't any libraries that do this shape connection from data thing with canvas.
 * Considering canvas versatility and performance I might continue to develop this as an API as oppose to the actual app, at least
 * as my knowledge levels up. It is here for your reference in the meantime if you are curious. You can even enable it to see what
 * functionality works by including it as a <script type="text/paperscript" src="flowchart.js" canvas="canvasID"> and adding
 * a canvas with a "canvasID"... ID! NOTE: I did not go into detail on the "programmatic drawing". It's a lot of tiny details
 * obtained through some logic and some random experimentation that I am sure you don't care about.
 */

var chartdata = { //Sample data
  ID: 1,
  UID: 1,
  Description: "Test chart for testing tests",
  Label: "Test"
};

var nodes = [ //Sample data
  {
    ID: 1,
    Chart: 1,
    x: 50,
    y: 50,
    width: 100,
    height: 80,
    color: "#167ee5",
    text: "We begin our journey",
    label: "Start",
    targets: [3]
  },
  {
    ID: 2,
    Chart: 1,
    x: 500,
    y: 170,
    width: 100,
    height: 80,
    color: "#167ee5",
    text: "Here is ends",
    label: "End",
    targets: [3]
  },
  {
    ID: 3,
    Chart: 1,
    x: 270,
    y: 350,
    width: 100,
    height: 80,
    color: "#167ee5",
    text: "the golden middle",
    label: "Mid",
    targets: []
  }
];

function Flowchart(nodes, chartdata) {
  //Member vars. They are only used internally
  var shapes = []; //Store references to drawn objects
  var connectors = this.connectors = []; //Store references to drawn connectors
  var self = this; //self reference

  //Constructor operations
  createShapes(nodes); //Create the shapes from data

  //Internal function
  function makeButton(shape){ //Make button geometry from base rectangle
    var pos = shape.bounds.center;
    var width = shape.bounds.width;
    var height = shape.bounds.height;
    var cutter = new Path.Rectangle({
      point: pos,
      size: [width,height],
      fillColor: 'black'
    });
    cutter.rotation -= 45;
    var offset = shape.bounds.width/7;
    cutter.position += new Point({
      length: offset,
      angle: 45
    });
    var cut = shape.divide(cutter);
    cutter.remove();
    cut.children[1].bringToFront();
    cut.children[1].fillColor = '#44af76';
    cut.children[1].data.button = true;
    cut.children[0].data.button = false;
    shape.remove();
    return cut;
  }
  function makeRectangle(topLeft, size, cornerSize, colour) { //Create the visual representation of the data node
    var rectangle = new Rectangle(topLeft, size);
    var corner = new Size(cornerSize, cornerSize); //Size object for corner radius
    var path = new Path.RoundRectangle(rectangle, corner);
    path.fillColor = colour;
    path = makeButton(path); //Add button
    return path; //return drawn object
  }
  function createShapes(nodes) {
    for (var i=0; i<nodes.length;i++){ //for all data entries
      var point = new Point(nodes[i].x, nodes[i].y); //make a PaperJS point for placement
      var size = new Size(nodes[i].width, nodes[i].height); //make a PaperJS size object
      var shape = makeRectangle(point, size, 8, nodes[i].color); //Pass to the object instantiating function
      shape.data = { //Store arbitrary data for connections and text
        ID: nodes[i].ID,
        label: nodes[i].label,
        text: nodes[i].text,
        connectors: {
          to: [],
          from: []
        },
        targets: _.clone(nodes[i].targets)
        //make sure to clone, not pass by reference -
        //or data will be manipulated whenever the geometric
        //attributes are changed - we don't want that!
      };
      shapes.push(shape); //Store reference for updating
    }
    for(i=0; i<shapes.length;i++){ //now for all drawn shapes
      shape = shapes[i];
      if (shape.data.targets.length > 0) { //if shape has targets
        var targets = _.filter(shapes, function (target) { //fetch those objects on canvas...
          return _.contains(shape.data.targets, target.data.ID); //that have IDs from the current shape target list
        });
        for (var j = 0; j < shape.data.targets.length; j++) { //for all targets of the current shape...
          shape.data.targets[j] = targets[j]; //Replace the ID-type reference with drawn object reference
        }
      }
      shape.data.label = new PointText({ //Add text.
        // Text wrapping is missing from any canvas drawing library.
        // PaperJS promised to add it a year ago, but nothing was done yet.
        // If I get time I will code it myself and make a PR on their github... maybe.
        point: (shape.bounds.topLeft + new Point(5, 20)),
        content: shape.data.label,
        fillColor: 'black',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontSize: 18
      });
      shape.addChild(shape.data.label); //add label to drawn node
      shape.data.text = new PointText({
        point: shape.bounds.center + new Point(0,12),
        content: shape.data.text,
        fillColor: 'black',
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontSize: 14
      });
      shape.data.text.point.x -= shape.data.text.bounds.width/2;
      shape.addChild(shape.data.text); //add text to drawn node
    }
  }

  //Member functions
  this.connect = function() { //the meat of this whole thing...
    _.each(connectors, function(conn){
    //moron-proofing (vital for me): if this is called again for some reason, erase previously drawn connections before drawing
      conn.remove();
    });
    connectors.length = 0;
    //Main loop
    shapes.forEach(function(shape){ //for each shape
      if (shape.data.targets.length > 0) { //if has targets
        shape.data.targets.forEach(function (target) { //do magic
          var curve, seg1, seg2, r1cent, r2cent, conBound, h1, h2;

          r1cent = shape.bounds.center;
          r2cent = target.bounds.center;
          conBound = new Rectangle(r1cent, r2cent);

          h1 = conBound.leftCenter - r1cent;
          h2 = conBound.rightCenter - r2cent;

          seg1 = new Segment(r1cent, null, h1);
          seg2 = new Segment(r2cent, h2, null);
          //if you are actually curious for some reason: I am making a bounding box with topLeft corner at center of
          //source shape and bottomRight at center of target. Then drawing bezier handles from both corners till middle
          //of the box and running a curve through the segments generated with those handles. With SVG this is a whole
          //lot easier, but this isn't SVG...
          curve = new Path({
            segments: [seg1, seg2],
            strokeColor: 'black',
            data: {
              curve: true,
              target: target,
              source: shape
            }
          });
          curve.sendToBack();

          /* ===Triangle arrow thingy=== */
          var intersection, triangle, normal, offset, offset2, point;

          _.find(target.children, function(child){// breakable loop through target group's children
          //this clever loop detects edges of the group (not bounding box, like in JoinJS, actual edges! Clever! Useless, but clever!)
            if (child.data !== undefined) { //if child data exists (means it's part of the external shape)
              if (child.data.button) { //if it's a button
                if (curve.getIntersections(child)[0]) intersection = curve.getIntersections(child)[0]; //get possible intersections...
                return intersection !== undefined; //and if this button does indeed intersect the curve, break out
              } else {
                intersection = curve.getIntersections(child)[0]; //else get intersections of the biggest external element
              }
              //this logic can work for any number of components. Simply Ctrl+C->Ctrl+V the button if statement,
              //replace if with else if and data.button with data.somethingElse and assuming you follow
              //the proper data structure, it will always work. Just make the element, which has the largest
              //'outside edge length' ends up in the else part.
            }
          });

          offset = curve.getOffsetOf(intersection.point);//at intersection, get the curve point
          offset2 = offset - 13; //offset back along the curve by length of arrow

          //do magic
          normal = curve.getNormalAt(offset2);
          normal.length = 5;

          point = curve.getPointAt(offset2);

          triangle = new Path.RegularPolygon({
            segments: [
              [intersection.point],
              [point + normal],
              [point - normal]
            ],
            closed: true,
            fillColor: 'black',
            data:{
              arrow: true
            }
          });
          triangle.sendToBack();
          /*===End triangle arrow thingy==*/

          var connector = new Group([curve,triangle]); //group the arrow with curve
          connector.data = {
            connectorGroup: true //assign data identifier
          };
          connector.sendToBack(); //send to back so it doesn't overlap shapes
          shape.data.connectors.from.push(connector); //push reference to relevant source
          target.data.connectors.to.push(connector); //push reference to relevant target
          connectors.push(connector);
        });
      }
    });
    var buttons = project.activeLayer.getItems({ //debug code, ignore
      data:{
        button: true
      }
    });
    buttons.forEach(function(button){}); //debug code, ignore
  };
}
function newConnection(shapeButton){ //for dragging out new connections
  var point = new Point(shapeButton.bounds.bottomRight);
  var newBound = new Rectangle(shapeButton.bounds.center, point);
  var h1 = newBound.leftCenter - shapeButton.bounds.center;
  var h2 = newBound.rightCenter - point;
  var seg1 = new Segment(shapeButton.bounds.center,null,h1);
  var seg2 = new Segment(point,h2,null);
  var newCon = new Path(seg1,seg2);
  newCon.source = shapeButton.parent;
  newCon.strokeColor = 'grey';
  newCon.removeOnUp();
  return newCon;
}
Layer.prototype.redraw = function(){
  this.removeChildren();
  project.view.update();
  chart = new Flowchart(nodes, chartdata);
  chart.connect();
  project.view.update();
}; //I am working with one layer. It made sense to link the custom update function to the PaperJS layer class
Path.prototype.dragEnd = function(event, endIndex) {
  this.segments[endIndex].point += event.delta;
  if (endIndex == 1) {
    this.firstSegment.handleOut += event.delta;
    this.segments[endIndex].handleIn -= event.delta;
  }
  else{
    this.lastSegment.handleOut -= event.delta;
    this.segments[endIndex].handleIn += event.delta;
  }
}; //function for dragging an end of a line

var chart;
var segment, path, newC;
var movePath = false;
var hitOptions = {
  segments: false,
  stroke: false,
  fill: true,
  tolerance: 5
};

project.activeLayer.redraw();

function onMouseDown(event) { //perform a hittest on mouse/tap location
  segment = path = null; //nullify previous results
  var hitResult = project.hitTest(event.point, hitOptions);
  if (!hitResult)
    return;
  if (hitResult && !hitResult.item.data.button) { //if we hit a shape part, assign the result to the whole node group
    path = hitResult.item.parent;
  }
  if (hitResult.item.data.button){ //if we hit a button
    newC = newConnection(hitResult.item); //make new connection from that button
  }
}

function onMouseUp(event) {
  var hitResult = project.hitTest(event.point, hitOptions); //hit test on lift finger/mouse button
  if (hitResult && newC !== undefined) { //if we have been dragging a new connection and lifted on another shape...
    var item = hitResult.item.parent;
    var source = newC.source; //get the source of our new connection
    if (item.data.ID) //if the shape is a node
      var targetID = item.data.ID;
    var sourceData = getDataEntry(source); //get the data element of our source
    if (!_.contains(sourceData.targets, targetID)){ //if we dragged to new target...
      sourceData.targets.push(targetID); //update source data
      project.activeLayer.redraw(); //redrawn all elements with new data: NOT IDEAL, but I am just tired of searching for proper solutions
    }
  }
  newC = undefined; //either way remove the new connection
}

function onMouseDrag(event) {
  if (newC !== undefined) newC.dragEnd(event, 1);
  if (path) {
    path.position += event.delta;
    var pathdata = getDataEntry(path); //I started setting up for server data interaction when I found JointJS...
    pathdata.x = path.position.x;
    pathdata.y = path.position.y;
    updateConnections(event, path); //on moving elements, update relevant connections
  }
}

function updateConnections(event, path){ //update connections
  if($.isEmptyObject(path.data.connectors) === false){ //if the dragged node has any connections
    path.data.connectors.to.forEach(function(to){ //update connections and arrows relative to source element
      var connector = to.children[0];
      var arrow = to.children[1];

      connector.dragEnd(event,1);

      var intersection;
      _.find(connector.data.target.children, function(child){
        if (child.data !== undefined) {
          if (child.data.button) {
            if (connector.getIntersections(child)[0]) intersection = connector.getIntersections(child)[0];
            return intersection !== undefined;
          } else {
            intersection = connector.getIntersections(child)[0];
          }
        }
      });
      var offset = connector.getOffsetOf(intersection.point);
      var offset2 = offset - 13;
      var normal = connector.getNormalAt(offset2);
      normal.length = 5;
      var point = connector.getPointAt(offset2);

      arrow.segments = [
        [intersection.point],
        [point + normal],
        [point - normal]
      ];
    });
    path.data.connectors.from.forEach(function(from){ //update connections and arrows relative to target element
      var connector = from.children[0];
      var arrow = from.children[1];

      connector.dragEnd(event,0);

      var intersection;
      _.find(connector.data.target.children, function(child){
        if (child.data !== undefined) {
          if (child.data.button) {
            if (connector.getIntersections(child)[0]) intersection = connector.getIntersections(child)[0];
            return intersection !== undefined;
          } else {
            intersection = connector.getIntersections(child)[0];
          }
        }
      });
      var offset = connector.getOffsetOf(intersection.point);
      var offset2 = offset - 13;
      var normal = connector.getNormalAt(offset2);
      normal.length = 5;
      var point = connector.getPointAt(offset2);

      arrow.segments = [
        [intersection.point],
        [point + normal],
        [point - normal]
      ];
    });
  }
} //this function is SOOOOO much more complicated in canvas holy shit...
//I tried to do it with event listeners on each of those elements (arrows and connectors), but it didn't work
//I suppose canvas handles these differently... I have no idea to be honest. Canvas is like DirectX in HTML. Less maths,
//but more pain. Even with PaperJS.

function getDataEntry(pathItem){
  var index = _.findIndex(nodes, function(node){
    return node.ID == pathItem.data.ID;
  });
  return nodes[index];
}
