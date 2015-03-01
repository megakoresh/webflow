var nodes = [ //Sample data
  {
    ID: 1,
    Chart: 1,
    x: 50,
    y: 50,
    width: 100,
    height: 80,
    color: "#003253",
    text: "Try to code",
    label: "Start",
    targets: [2]
  },
  {
    ID: 2,
    Chart: 1,
    x: 500,
    y: 170,
    width: 100,
    height: 80,
    color: "#365C5A",
    text: "Fail",
    label: "End",
    targets: [3]
  },
  {
    ID: 3,
    Chart: 1,
    x: 270,
    y: 350,
    width: 150,
    height: 80,
    color: "#81271E",
    text: "Cry a lot",
    label: "Mid",
    targets: [1]
  }
];

var graph = new joint.dia.Graph;

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: window.innerWidth,
    height: window.innerHeight,
    gridSize: 1,
    model: graph,
    validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
      // Prevent loop linking
      return (magnetS !== magnetT);
    }
});
function invertColor(hexTripletColor) {
  var color = hexTripletColor;
  color = color.substring(1);           // remove #
  color = parseInt(color, 16);          // convert to integer
  color = 0xFFFFFF ^ color;             // invert three bytes
  color = color.toString(16);           // convert to hex
  color = ("000000" + color).slice(-6); // pad with leading zeros
  color = "#" + color;                  // prepend #
  return color;
}
var shapenodes = [];
var connections = {};
var links = [];
for (var i=0;i<nodes.length;i++){
  var wraptext = joint.util.breakText(nodes[i].text, {width: nodes[i].width - 20});
  var newNode = new joint.shapes.basic.Rect({
    position: {x: nodes[i].x, y: nodes[i].y},
    size: {width: nodes[i].width, height: nodes[i].height},
    attrs: {
      rect: {
        fill: nodes[i].color,
        rx: 8,
        ry: 8,
        stroke: '',
        magnet: true
      },
      text: {
        text: wraptext,
        fill: invertColor(nodes[i].color),
        'font-family': 'Arial',
        'font-size': 18,
        'font-weight': 'bold',
        'font-variant': 'small-caps'
      }
    },
    id: nodes[i].ID
  });
  var sourceID = newNode.id;
  connections[sourceID] = [];
  Array.prototype.push.apply(connections[sourceID], nodes[i].targets);
  shapenodes.push(newNode);
}
for (var SID in connections){
  if(connections[SID].length>0) {
    _.each(connections[SID], function (target) {
      var link = new joint.dia.Link({
        source: {id: SID},
        target: {id: ''+target+''},
        'smooth': true,
        attrs: {
          '.connection': {'stroke-width': 3},
          '.marker-source':{},
          '.marker-target':{d: 'M 10 0 L 0 5 L 10 10 z', stroke: 'black', fill: 'black'},
          'z-index': -1
        }
      });
      links.push(link);
    });
  }
}
graph.addCells(shapenodes);
graph.addCell(links);
