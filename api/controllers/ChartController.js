/**
 * ChartController
 *
 * @description :: Server-side logic for managing charts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	'create': function(req, res){
    Chart.create(req.params.all()).exec(function(err, chart){
      if (err) {
        console.log(err);
        return res.serverError();
      }
      res.redirect('flowchart'); //TODO: add chart.id to session.currentChart, subscribe sockets and send the nodes data
    });
  },
  'destroy': function(req,res) { //TODO: e.g. GET chart/destroy?id=1 --> policy checks (if findOne(chart.id).user == session.userID or smth) --> proceed else return 403
    Chart.destroy(req.param('id')).exec(function(err, chart) {
      if (err) {
        return res.serverError();
      }
      var chartID = chart.map(function (chart) {
        return chart.id;
      });
      Node.destroy({Chart: chartID}).exec(function (err, nodes) {
        if(err) return res.serverError();
        if (nodes.lenth > 0){
          req.flash('removed nodes', JSON.stringify(nodes));
          console.log(JSON.stringify(nodes));
        }
        res.view("panel");
      });
    });
  }
};

