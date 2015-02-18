/**
 * Created by Stanislav on 17.2.2015.
 */
/*
* nodes = Array of node objects
* */

var chartdata = {
  ID: 1,
  UID: 1,
  Description: "Test chart for testing tests",
  Label: "Test"
};

var nodes = [
  {
    ID:1,
    Chart:1,
    x: 50,
    y: 50,
    width:100,
    height:80,
    color:"#167ee5",
    text:"Start",
    label:"Start",
    targets:[2,3]
  },
  {
    ID:2,
    Chart:1,
    x: 500,
    y: 170,
    width:100,
    height:80,
    color:"#167ee5",
    text:"End",
    label:"End",
    targets:[]
  },
  {
    ID:3,
    Chart:1,
    x: 270,
    y: 350,
    width:100,
    height:80,
    color:"#167ee5",
    text:"Mid",
    label:"Mid",
    targets:[2]
  }
];

function draw(nodes, chartdata){
  function makeRectangle(topLeft, size, cornerSize, colour) {
    var rectangle = new Rectangle(topLeft, size);
    var cornerSize = cornerSize;
    var path = new Path.RoundRectangle(rectangle, cornerSize);
    path.fillColor = colour;
    return path;
  }
  var connections = [];
  nodes.forEach(function(node){
    var point = new Point(node.x,node.y);
    var size = new Size(node.width, node.height);
    var c = new Size(8,8);
    var shape = makeRectangle(point,size,c,node.color);
    shape.data = {
      ID: node.ID,
      label: node.label,
      text: node.text
    }
    if (node.targets.length > 0){
      var targetPair = [shape, node.targets];
      connections.push(targetPair);
    }
  });
  function connect(connections){
    connections.forEach(function(pair){
      var source = pair[0];
      sourceCenter = source.bounds.center;
      var targetIDs = pair[1];
      var targetShapes = [];
      targetIDs.forEach(function(targetIDs){
        var shape = project.getItem({
          data: {
            ID: targetIDs
          }
        });
        targetShapes.push(shape);
      });
      var targets = _.clone(targetShapes);
      targets.forEach(function(target){
        var connector, seg1, seg2, conBound, h1, h2; //Lyria's mercy what have I gotten myself into...
        var targetCenter = target.bounds.center;

        conBound = new Rectangle(sourceCenter,targetCenter);
        h1 = conBound.leftCenter - sourceCenter;
        h2 = conBound.rightCenter - targetCenter;

        seg1 = new Segment(sourceCenter,null,h1);
        seg2 = new Segment(targetCenter,h2,null);

        connector = new Path(seg1,seg2);
        connector.strokeColor = "black";
        connector.sendToBack();
        console.log(connector);

        var intersection = connector.getIntersections(target)[0];

        var arrowLength = 13;
        var arrowWidth = 5;

        var offset = connector.getOffsetOf(intersection.point);

        var offset2 = offset - arrowLength;

        var normal = connector.getNormalAt(offset2);
        normal.length = arrowWidth;
        var point = connector.getPointAt(offset2);

        var triangle = new Path.RegularPolygon({
          segments: [
            [intersection.point],
            [point + normal],
            [point - normal]
          ],
          closed: true,
          fillColor: 'black'
        });
      });
    })
  }
  connect(connections);
}
draw(nodes,chartdata);
