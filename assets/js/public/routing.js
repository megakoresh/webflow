/*
 * This file deals with taking the node data and making a graph from it.
 * TODO: namespace all this shit so it can split properly.
 * */

/*TODO: (optional but advised) Make a map from shape ID to index in data array.
 Would make for easier searching and improve performance for larger charts (maybe...)*/
var data, graph;
var paperEl = document.getElementById("paper");
var shapenodes = []; //store node structures
var connections = {}; //store connection pairs
var links = []; //store drawn connectors

//this here function is very useful for any visual application!
function invertColor(hexTripletColor) { //invert color for text so it's visible no matter what
  var color = hexTripletColor;
  color = color.substring(1);
  color = parseInt(color, 16);
  color = 0xFFFFFF ^ color;
  color = color.toString(16);
  color = ("000000" + color).slice(-6);
  color = "#" + color;
  return color;
}
//MAIN LOGIC
var xhr = $.get('Node/findAllByChart', { //Make a call to fetch the data
  'Chart': 1 //this will be stored in session when i implement user login. For now - fixed.
}).done(function (nodes) { //once done, commence the wall of code
  for(var n=0; n<nodes.length; n++) { //this is to prevent possible compatibility issues with backend services
    if (nodes[n].targets[0] === "") {
      nodes[n].targets = [];
    }
  }
  data = nodes;
  if (paperEl) { //if correct page
    graph = new joint.dia.Graph; //make graph
    var paper = new joint.dia.Paper({ //set up paper
      el: paperEl,
      width: $("#paper-container").width(),
      height: $("#paper-container").height(), //we are very responsive like that LOL
      gridSize: 1,
      model: graph,
      defaultLink: new joint.dia.Link({ //default style for links
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

    //PAPER UI INTERACTIONS
    $("#center").click(function(){
      paper.scaleContentToFit();
    });

    $("#scale").click(function(){
      paper.fitToContent();
    });

    $(window).on('orientationchange resize', function(){
      paper.fitToContent();
    });

    //TODO: somehow get the zoom to work (no idea how)

    $('#paper').bind('mousewheel DOMMouseScroll', function(e) { //prevent global scrolling when inside paper
      var scrollTo = null;

      if (e.type == 'mousewheel') {
        scrollTo = (e.originalEvent.wheelDelta * -1);
      }
      else if (e.type == 'DOMMouseScroll') {
        scrollTo = 40 * e.originalEvent.detail;
      }

      if (scrollTo) {
        e.preventDefault();
        $(this).scrollTop(scrollTo + $(this).scrollTop());
      }
    });

    paperEl.addEventListener('mousewheel', function(event){
    //I have no idea how the fuck does this work. Whatever I do, the zoom doesn't work properly.
    //The creator of the library evidently made it really hard to implement so he could push his
    //enterprise product (https://groups.google.com/forum/#!msg/jointjs/V_xU2UQFkGk/kzblMKw5ak8J)
      var delta = event.wheelDelta;
      var scale = 1;
      var x = event.clientX;
      var y = event.clientY;
      if(delta>0) scale += 0.2;
      if(delta<0) scale -= 0.2;
      paper.scale(scale,scale,x,y);
    });

    paper.on('scale',function(evt){
      //whatever zooming in goes on, it will be done on render SVG container: viewport
      //for that reason, if we still want to have panning enabled, the paper has to be
      //made the size of the viewport after each zooming action is done
      paper.fitToContent();
    });

    $('#reset').click(function(){ //the most useful one.
      paper.scale(1,1);
      paper.setDimensions($("#paper-container").width(), $("#paper-container").height())
    });//the usability of this app is measured in the frequency of usage of this button.

    //DO YOU EVEN PAN BRO
    var pan, dropX, dropY;
    var paperCont = document.getElementById('paper-container'); //get container
    var body = $('body');

    paper.on('blank:pointerdown', function(event) {//register panning start
      if(event.force) {
        //console.log(event);
        dropX = event.clientX;
        dropY = event.clientY;
      }
      pan=true; //set panning flag to true
    });

    body.on('mousemove touchmove', function(event){ //on mouse move...
      if(pan) {//if in pan mode
        //console.log(event);
        paperCont.scrollTop -= event.originalEvent.movementY;
        paperCont.scrollLeft -= event.originalEvent.movementX;
        if(event.type == 'touchmove'){ //on touch this is a bit weird - it's as if the values are too extreme. I nerf them to have softer panning.
          paperCont.scrollTop += (dropY-event.originalEvent.touches[0].clientY)/2;
          paperCont.scrollLeft += (dropX-event.originalEvent.touches[0].clientX)/2;
        }
      }
    });

    body.on('mouseup touchend', function(event){ //on mouse up clear flag.
      pan = false;
      //console.log('touch');
    });
    //END PANNING LOGIC

    paper.on('cell:pointermove', function(event,x,y){ //on member move adjust paper size
      paper.fitToContent();//this works similar to strategy games - move cursor to size, view pans to side.
      //the problem is the sensitivity area of this is very small. I may have to make this logic manual somehow
      //if the JointJS docs were better I might have done it already
    });
    //END PAPER UI INTERACTIONS

    //CONSTRUCT GRAPHICS FROM DATA
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
    paper.fitToContent();
    //END GRAPHICS FROM DATA
  }
  //END WALL OF CODE
});
//END MAIN LOGIC

//EVENT TRIGGERS
xhr.always(function(){ //send callback for data fetching
  //So graph is basically a data holder - it doesn't render anything.
  //For that purpose I use it's events to trigger data changes in the model.
  //This is also the reason it's handlers are attached after the paper's
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

  graph.on('add', function (cell) { //on cell addition...
    console.log(cell);
    if (cell.attributes.props && cell.attributes.props.node) { //if it's a node cell (i.e. not a link)
      var celldata = { //make data
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
      data.push(celldata); //and push it to the object
    }
  });
//END EVENT TRIGGERS


  //$("<button onclick='console.log(data)'>See data</button>").insertAfter("#save"); //debug thing

  //SAVING MECHANICSM
  var savebutton = $('#save');
  savebutton.click(function () { //
    $("code").remove(); //debug thing, never mind this.
    var ok = 0;
    data.forEach(function (node) { //for all data entries (temp, I will send full array and do the separation serverside later)
      if (csrf) node._csrf = csrf; //embed csrf token
      if (node.targets.length == 0) node.targets.push(null); //due to ajax being stupid, it won't send empty arrays. So I use this hack and do serverside check to empty the record.
      $.post('Node/saveOne', node).done(function (response) {
        if (response.oldId) { //handle ID discrepancies, if any
          var cell = graph.getCell('' + response[i].oldId);
          if (cell) {
            cell.id = '' + response[i].id + '';
          }
          if (connections.hasOwnProperty('' + response[i].oldId)) {
            connections['' + response[i].id] = response[i].oldId;
            delete connections['' + response[i].oldId];
          }
        }
        ok++;
        if (ok == data.length) {
          savebutton.trigger('saved'); //slightly alcoholic way to trigger the saved confirmation
        }
      });
    });
  });
  savebutton.on('saved', function () { //so basically when ok reaches number of sent elements, we flash the button
    $("#save").animate({
      'background-color': '#7BD389'
    }, 500).animate({
      'background-color': '#286090'
    }, 500);
  });
  //END SAVING MECHANICSM

  $("#newNode").click(function(){ //when newnode is clicked (in the modal)
    var newtext = $("#description").val();
    var wraptext = joint.util.breakText(newtext, {width: 110}); //break text to fit node width
    var newNode = new joint.shapes.basic.Rect({ //make the new element
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



$('#chartform').on('shown.bs.modal', function () { //This is a little workaround in Bootstrap modals - forms don't work too well on them otherwise.
  $('input[name="label"]').focus();
});

//CSRF
var csrf;
//since I have CSRF enabled on the server, we gotta request a CSRF token before issuing any other ajax calls.
$(function () { //on body load
  $.ajax({
    type: "GET",
    url: '/csrfToken' //request CSRF token from sails
  }).done(function (token) {
    if (token._csrf) { //if recieved: celebrate by drinking alcohol
      csrf = token._csrf
    }
    else alert("CSRF aquisition failed."); //if failed: calm yourself by drinking alcohol
  })
});
