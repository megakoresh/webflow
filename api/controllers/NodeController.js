/**
 * NodeController
 *
 * @description :: Server-side logic for managing nodes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 *
 */

module.exports = {
  'test': function (req, res) {
    res.json(req.params.all());
  },
  saveAll: function (req, res) { //for now I am passing 1 node at a time and sending 3 requests. This is very inefficient
    //so once I am more comfortable with Sails, I will send all the nodes data and use populate() to save it.
    req.session.currentChart = 1; //before user login is implemented, I will just use one chart
    var data = req.params.all();
    var id = data.id;
    res.json(response);
  },
  saveOne: function (req, res) {
    req.session.currentChart = 1;
    var data = req.params.all();
    var id = data.id; //store id in case it's an old node.
    delete data.id;
    /*the reason I do this is because JointJS generates big-ass IDs for it's clientside shenanigans.
     That doesn't fit my requirements so in case this node here is a brand new one (with generated ID),
     I will remove it and let the database create a proper ID for it.*/
    Node.findOne({id: id}).exec(function (err, node) {
      if (node) { //if it exists
        for (var key in node) {
          if (node.hasOwnProperty(key) && data.hasOwnProperty(key)) {
            if (key == 'targets' && data[key][0] === null) {
              node['targets'].length = 0;
            }
            else {
              node[key] = data[key];
            }
          }
        }
        node.save(function (err, record) {
          if (!err) {
            res.json(record);
          }
          if (err) req.flash('Error saving', err);
        });
      } else if (node === undefined) { //if record needs to be created
        Node.create(data).exec(function (err, newnode) {
          if(err){
            req.flash('err', err);
            res.json(err);
            console.log(err);
            return;
          }
          if (newnode) {
            newnode.oldId = id;
            res.json(newnode);
          }
        });
      } else { //if findOne has an error
        if (err) {
          req.flash('Error updating:', err);
          console.log(err);
        }
      }
    });
  },
  findAllByChart: function (req, res) { //Find the nodes which belong to current chart.
                                        // Dynamic chart creation is tied to user system, which isn't done yet, so for now all nodes will be on the same graph.
    req.session.currentChart = req.param('Chart');
    Node.find({Chart: req.param('Chart')}).exec(function (err, found) {
      if (err) req.flash("Can't see nodes:", err);
      if (found) {
        res.json(found);
      }
    });
  }
};

