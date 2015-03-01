/**
 * Created by Stanislav on 17.2.2015.
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
  var shapes = [];
  var connectors = this.connectors = [];
  var newSource, newTarget;
  var self = this;

  //Constructor operations
  createShapes(nodes);

  //Internal function
  function makeButton(shape){
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
    path = makeButton(path);
    return path;
  }
  function createShapes(nodes) {
    for (var i=0; i<nodes.length;i++){
      var point = new Point(nodes[i].x, nodes[i].y); //make a PaperJS point for placement
      var size = new Size(nodes[i].width, nodes[i].height); //make a PaperJS size object
      var shape = makeRectangle(point, size, 8, nodes[i].color); //Pass to the object instantiating function
      shape.data = { //Store arbitrary data for programming reference.
        ID: nodes[i].ID,
        label: nodes[i].label,
        text: nodes[i].text,
        connectors: {
          to: [],
          from: []
        },
        targets: _.clone(nodes[i].targets)
      };
      shapes.push(shape); //Store reference for updating
    }
    for(i=0; i<shapes.length;i++){
      shape = shapes[i];
      if (shape.data.targets.length > 0) { //if shape has targets
        var targets = _.filter(shapes, function (target) {
          return _.contains(shape.data.targets, target.data.ID);
        });
        for (var j = 0; j < shape.data.targets.length; j++) {
          shape.data.targets[j] = targets[j]; //Replace the ID-type reference with drawn object reference
        }
      }
      shape.data.label = new PointText({
        point: (shape.bounds.topLeft + new Point(5, 20)),
        content: shape.data.label,
        fillColor: 'black',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontSize: 18
      });
      shape.addChild(shape.data.label);
      shape.data.text = new PointText({
        point: shape.bounds.center + new Point(0,12),
        content: shape.data.text,
        fillColor: 'black',
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontSize: 14
      });
      shape.data.text.point.x -= shape.data.text.bounds.width/2;
      shape.addChild(shape.data.text);
    }
  }

  //Member functions
  this.connect = function() {
    _.each(connectors, function(conn){
      conn.remove();
    });
    connectors.length = 0;
    //Main loop
    shapes.forEach(function(shape){
      if (shape.data.targets.length > 0) {
        shape.data.targets.forEach(function (target) {
          var curve, seg1, seg2, r1cent, r2cent, conBound, h1, h2;

          r1cent = shape.bounds.center;
          r2cent = target.bounds.center;
          conBound = new Rectangle(r1cent, r2cent);

          h1 = conBound.leftCenter - r1cent;
          h2 = conBound.rightCenter - r2cent;

          seg1 = new Segment(r1cent, null, h1);
          seg2 = new Segment(r2cent, h2, null);

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

          _.find(target.children, function(child){
            if (child.data !== undefined) {
              if (child.data.button) {
                if (curve.getIntersections(child)[0]) intersection = curve.getIntersections(child)[0];
                return intersection !== undefined;
              } else {
                intersection = curve.getIntersections(child)[0];
              }
            }
          });

          offset = curve.getOffsetOf(intersection.point);
          offset2 = offset - 13;

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

          var connector = new Group([curve,triangle]);
          connector.data = {
            connectorGroup: true
          };
          connector.sendToBack();
          shape.data.connectors.from.push(connector);
          target.data.connectors.to.push(connector);
          connectors.push(connector);
        });
      }
    });
    var buttons = project.activeLayer.getItems({
      data:{
        button: true
      }
    });
    buttons.forEach(function(button){});
  };
}
function newConnection(shapeButton){
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
};
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
};

var chart;
var segment, path, newC;
var movePath = false;
var hitOptions = {
  segments: false,
  stroke: false,
  fill: true,
  tolerance: 5
};

//project.activeLayer.redraw();

function onMouseDown(event) {
  segment = path = null;
  var hitResult = project.hitTest(event.point, hitOptions);
  if (!hitResult)
    return;
  if (hitResult && !hitResult.item.data.button) {
    path = hitResult.item.parent;
  }
  if (hitResult.item.data.button){
    newC = newConnection(hitResult.item);
  }
}

function onMouseUp(event) {
  var hitResult = project.hitTest(event.point, hitOptions);
  if (hitResult && newC !== undefined) {
    var item = hitResult.item.parent;
    var source = newC.source;
    if (item.data.ID)
      var targetID = item.data.ID;
    var sourceData = getDataEntry(source);
    if (!_.contains(sourceData.targets, targetID)){
      sourceData.targets.push(targetID);
      project.activeLayer.redraw();
    }
  }
  newC = undefined;
}

function onMouseDrag(event) {
  if (newC !== undefined) newC.dragEnd(event, 1);
  if (path) {
    path.position += event.delta;
    var pathdata = getDataEntry(path);
    pathdata.x = path.position.x;
    pathdata.y = path.position.y;
    updateConnections(event, path);
  }
}

function updateConnections(event, path){
  if($.isEmptyObject(path.data.connectors) === false){ //if the dragged node has any connections
    path.data.connectors.to.forEach(function(to){ //update connections and arrows when nodes are dragged
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
    path.data.connectors.from.forEach(function(from){
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
}

function getDataEntry(pathItem){
  var index = _.findIndex(nodes, function(node){
    return node.ID == pathItem.data.ID;
  });
  return nodes[index];
}
