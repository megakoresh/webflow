/*
 * This file deals with taking the node data and making a graph from it.
 * TODO: namespace all this shit so it can split properly.
 * */

/*TODO: (optional but advised) Make a map from shape ID to index in data array.
 Would make for easier searching and improve performance for larger charts (maybe...)*/
var data;
var paperEl = $("#paper");
var shapenodes = []; //store node structures
var connections = {}; //store connection pairs
var links = []; //store drawn connectors

function invertColor(hexTripletColor) { //invert color for text
  var color = hexTripletColor;
  color = color.substring(1);           // remove #
  color = parseInt(color, 16);          // convert to integer
  color = 0xFFFFFF ^ color;             // invert three bytes
  color = color.toString(16);           // convert to hex
  color = ("000000" + color).slice(-6); // pad with leading zeros
  color = "#" + color;                  // prepend #
  return color;
}


var xhr = $.get('Node/findAllByChart', { //Make a call to fetch the data
  'Chart': 1
}).done(function (nodes) { //once done, commence the wall of code
  for(var n=0; n<nodes.length; n++) {
    if (nodes[n].targets[0] === "") {
      nodes[n].targets = [];
    }
  }
  data = nodes;
  loaded = true;
  if (paperEl) {
    graph = new joint.dia.Graph;
    var paper = new joint.dia.Paper({ //set up paper
      el: paperEl,
      width: window.innerWidth,
      height: window.innerHeight / 1.5, //we are very responsive like that LOL
      gridSize: 1,
      model: graph,
      defaultLink: new joint.dia.Link({
        'smooth': true,
        attrs: {
          '.connection': {'stroke-width': 3},
          '.marker-source': {},
          '.marker-target': {d: 'M 10 0 L 0 5 L 10 10 z', stroke: 'black', fill: 'black'}, //just an arrow path
          'z-index': -1 //I am not sure this does anything...
        }
      }),
      validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
        // Prevent loop linking
        return (magnetS !== magnetT);
      }
    });
    for (var i = 0; i < nodes.length; i++) { //for all nodes
      var wraptext = joint.util.breakText(nodes[i].text, {width: nodes[i].width - 20}); //break text to fit node width
      var newNode = new joint.shapes.basic.Rect({
        position: {x: nodes[i].x, y: nodes[i].y},
        size: {width: nodes[i].width, height: nodes[i].height},
        props: {
          node: true
        },
        attrs: {
          rect: {
            fill: nodes[i].color,
            rx: 8,
            ry: 8,
            stroke: '',
            magnet: true //this lets you drag out new connections from this shape
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
        id: '' + nodes[i].id + '' //assign custom ID to the node (must be a string)
      });
      var sourceID = newNode.id;
      connections[sourceID] = []; //store id associations for source-target pairs in our data
      Array.prototype.push.apply(connections[sourceID], nodes[i].targets); //safe push the targets to the object
      shapenodes.push(newNode); //output the node structure
    }
    for (var SID in connections) { //for potential Source IDs in connections (i.e. for all nodes)
      if (connections[SID].length > 0) { //if the node has targets
        _.each(connections[SID], function (target) { //for each target
          var link = new joint.dia.Link({ //make link
            source: {id: SID}, //from node with source ID
            target: {id: '' + target + ''}, //to node with current target ID
            'smooth': true,
            attrs: {
              '.connection': {'stroke-width': 3},
              '.marker-source': {},
              '.marker-target': {d: 'M 10 0 L 0 5 L 10 10 z', stroke: 'black', fill: 'black'},
              // default styles don't apply for some reason, when creating links programmatically.
              'z-index': -1
            }
          });
          links.push(link); //store link
        });
      }
    }

    graph.addCells(shapenodes); //add nodes
    graph.addCell(links); //add links
  }
});

//EVENT TRIGGERS
xhr.always(function(){
  graph.on('change:source change:target', function (link) { //Make new connections and be social
    var sourceId = link.get('source').id;
    var targetId = link.get('target').id;

    if ((sourceId && targetId) && sourceId != targetId) {
      if (!_.contains(connections[sourceId], targetId)) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].id == sourceId) {
            data[i].targets.push(targetId);
            i = data.length;//conventional loop breaks are too mainstream for me
          }
        }
      }
    }
  }); //Inverse bracket stairs ahoy!

  graph.on('change:position', function (shape) {
    /*Update the locations of shapes. It's like facebook statuses. For data. We are so alike.
     We are all just data in this vast construct known as the universe.
     Our existence is in the hands of one grand script.
     I should found a religion. Programmology. Yeah.*/
    if (shape.attributes.props && shape.attributes.props.node) {
      var id = shape.id;
      var x = shape.attributes.position.x;
      var y = shape.attributes.position.y;

      var i = _.findIndex(data, function (node) {
        return node.id == id;
      });
      data[i].x = x;
      data[i].y = y;
    }
  });

  graph.on('remove', function(cell){
    if (cell.isLink()){
      var targetId = cell.get('target').id;
      var sourceId = cell.get('source').id;

      var i = _.findIndex(data, function (node) {
        return node.id == sourceId;
      });
      data[i].targets = _.without(data[i].targets, targetId); //on link removal update relevant data entry
    }
  });

  graph.on('add', function (cell) {
    console.log(cell);
    if (cell.attributes.props && cell.attributes.props.node) {
      var celldata = {
        x: cell.attributes.position.x,
        y: cell.attributes.position.y,
        width: cell.attributes.size.width,
        height: cell.attributes.size.height,
        color: cell.attributes.attrs.rect.fill, //TODO: make my palette into JS function that randomly assigns colors to new data on creation.
        text: cell.attributes.attrs.text.text,
        label: $("#label").val(),
        targets: [],
        id: cell.id
      };
      data.push(celldata);
    }
  });
  //END EVENT TRIGGERS
  $("<button onclick='console.log(data)'>See data</button>").insertAfter("#save");
  var savebutton = $('#save');
  savebutton.click(function () {
    $("code").remove();
    data.forEach(function (node) {
      if (csrf) node._csrf = csrf;
      if(node.targets.length == 0) node.targets.push(null); //due to ajax being stupid, it won't send empty arrays. So I use this hack and do serverside check to empty the record.
      $.post('Node/saveOne', node).done(function (response) {
        if(response.oldId){ //handle ID discrepancies, if any
          var cell = graph.getCell(''+response[i].oldId);
          if(cell){
            cell.id = ''+response[i].id+'';
          }
          if(connections.hasOwnProperty(''+response[i].oldId)){
            connections[''+response[i].id] = response[i].oldId;
            delete connections[''+response[i].oldId];
          }
        }
        /*THIS IS FOR LATER. When I start sending them all in one request.
        for (var i=0; i<response.length; i++) {
          console.log(response[i]);
          if(response[i].oldId){
            var cell = graph.getCell(''+response[i].oldId);
            if(cell){
              cell.id = ''+response[i].id+'';
            }
            if(connections.hasOwnProperty(''+response[i].oldId)){
              connections[''+response[i].id] = response[i].oldId;
              delete connections[''+response[i].oldId];
            }
          }
        }*/
      });
    });
    $("#save").animate({
      'background-color':'#7BD389'
    },500).animate({
      'background-color':'#286090'
    },500);
  });
  $("#newNode").click(function(){
    var newtext = $("#description").val();
    var wraptext = joint.util.breakText(newtext, {width: 110}); //break text to fit node width
    var newNode = new joint.shapes.basic.Rect({
      position: {x: 200, y: 200},
      size: {width: 130, height: 80},
      props: {
        node: true
      },
      attrs: {
        rect: {
          fill: "#365C5A",
          rx: 8,
          ry: 8,
          stroke: '',
          magnet: true //this lets you drag out new connections from this shape
        },
        text: {
          text: newtext,
          fill: invertColor("#365C5A"),
          'font-family': 'Arial',
          'font-size': 18,
          'font-weight': 'bold',
          'font-variant': 'small-caps'
        }
      }
    });
    var sourceID = newNode.id;
    connections[sourceID] = []; //store id associations for source-target pairs in our data
    graph.addCell(newNode);
  });
});

$('#chartform').on('shown.bs.modal', function () {
  $('input[name="label"]').focus();
});
var csrf;
//since I have CSRF enabled on the server, we gotta request a CSRF token before issuing any other ajax calls.
$(function () {
  $.ajax({
    type: "GET",
    url: '/csrfToken'
  }).done(function (token) {
    if (token._csrf) {
      csrf = token._csrf
    }
    else alert("CSRF aquisition failed.");
  })
});
