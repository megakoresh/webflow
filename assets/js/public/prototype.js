  function makeRectangle(topLeft, size, cornerSize, colour) {
    var rectangle = new Rectangle(topLeft, size);
    var cornerSize = cornerSize;
    var path = new Path.RoundRectangle(rectangle, cornerSize);
    path.fillColor = colour;
    return path;
  }

  var xy1 = new Point(50, 50);
  var size = new Size(100, 80);
  var c = new Size(8, 8);
  var col = "#167ee5";

  var r1 = makeRectangle(xy1, size, c, col);

  var xy2 = new Point(240, 250);
  var size2 = new Size(115, 70);

  var r2 = makeRectangle(xy2, size2, c, col);

  var connector, seg1, seg2, r1cent, r2cent, conBound, h1, h2;

  r1cent = r1.bounds.center;

  r2cent = r2.bounds.center;

  conBound = new Rectangle(r1cent, r2cent);

  h1 = conBound.leftCenter - r1cent;
  h2 = conBound.rightCenter - r2cent;

  seg1 = new Segment(r1cent, null, h1);
  seg2 = new Segment(r2cent, h2, null);

  connector = new Path(seg1, seg2);
  connector.strokeColor = 'black';
  connector.sendToBack();

  /* ===Triangle arrow thingy=== */

  var intersection = connector.getIntersections(r2)[0];

  var center = intersection.point;
  var sides = 3;
  var radius = 10;
//var triangle = new Path.RegularPolygon(center, sides, radius);
//triangle.fillColor = 'black';
//triangle.scale(1,0.6);


  var offset = connector.getOffsetOf(intersection.point);

  var offset2 = offset - 13;

  var normal = connector.getNormalAt(offset2);
  normal.length = 5;
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


  function connect() {
    r1cent = r1.bounds.center;
    r2cent = r2.bounds.center;

    conBound.point = r1cent;
    conBound.size = r2cent - r1cent;

    connector.segments[0].point = r1cent;
    connector.segments[0].handleIn = null;
    connector.segments[0].handleOut = conBound.leftCenter - r1cent;

    connector.segments[1].point = r2cent;
    connector.segments[1].handleIn = conBound.rightCenter - r2cent;
    connector.segments[1].handleOut = null;

    /*This is very alocoholic*/

    intersection = connector.getIntersections(r2)[0];

    offset = connector.getOffsetOf(intersection.point);
    offset2 = offset - 13;

    normal = connector.getNormalAt(offset2);
    normal.length = 5;
    point = connector.getPointAt(offset2);

    triangle.segments = [
      [intersection.point],
      [point + normal],
      [point - normal]
    ]
  }

//connect();


  /* ===Code for dragging this shit=== */

  var segment, path;
  var movePath = false;

  var hitOptions = {
    segments: false,
    stroke: false,
    fill: true,
    tolerance: 5
  }

  function onMouseDown(event) {
    segment = path = null;
    var hitResult = project.hitTest(event.point, hitOptions);
    if (!hitResult)
      return;
    if (hitResult) {
      path = hitResult.item;
      if (hitResult.type == 'segment') {
        segment = hitResult.segment;
      }
    }
    movePath = hitResult.type == 'fill';
    if (movePath)
      project.activeLayer.addChild(hitResult.item);
  }

  function onMouseDrag(event) {
    if (path) {
      path.position += event.delta;
      connect();
    }
  }
