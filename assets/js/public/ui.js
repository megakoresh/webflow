/**
 * Created by Stanislav on 1.3.2015.
 */
/*$('#chartform').on('shown.bs.modal', function () {
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
if (loaded) { //run the graph events if it was loaded
  console.log('loaded');
//EVENT TRIGGERS
  graph.on('change:source change:target', function (link) { //Make new connections and be social
    var sourceId = link.get('source').id;
    var targetId = link.get('target').id;

    if ((sourceId && targetId) && sourceId != targetId) {
      if (connections[sourceId].length > 0) {
        if (!_.contains(connections.sourceId, targetId)) {
          for (var i = 0; i < nodedata.length; i++) {
            if (nodedata[i].id == sourceId) {
              nodedata[i].targets.push(targetId);
              console.log(nodedata[i]);
              i = nodedata.length;//conventional loop breaks are too mainstream for me
            }
          }
        }
      }
    }
  }); //Inverse bracket stairs ahoy!

  graph.on('change:position', function (shape) {
    console.log(shape);
    *//*Update the locations of shapes. It's like facebook statuses. For data. We are so alike.
     We are all just data in this vast construct known as the universe.
     Our existence is in the hands of one grand script.
     I should found a religion. Programmology. Yeah.*//*
    if (shape.attributes.props.node) {
      var id = shape.id;
      var x = shape.attributes.position.x;
      var y = shape.attributes.position.y;

      var i = _.findIndex(nodedata, function (node) {
        return node.id == id;
      });
      nodedata[i].x = x;
      nodedata[i].y = y;
      console.log(nodedata[i]);
    }
  });

  graph.on('add', function (cell) {
    if (cell.attributes.props.node) {
      var celldata = {
        x: cell.attributes.position.x,
        y: cell.attributes.position.y,
        width: 100,
        height: 65,
        color: "#365C5A", //TODO: make my palette into JS function that randomly assigns colors to new nodes on creation.
        text: "Default text",
        label: "Default label",
        targets: []
      };
      nodedata.push(celldata);
    }
  });
//END EVENT TRIGGERS
}
$('#save').click(function () {
  $("code").remove();
  nodedata.forEach(function (node) {
    if (csrf) node._csrf = csrf;
    console.log(node);
    $.post('Node/saveOne', node).done(function (response) {
      console.log("received response");
      $("<code>" + JSON.stringify(response) + "<code>").insertAfter("#paper");
    });
  });
});*/

