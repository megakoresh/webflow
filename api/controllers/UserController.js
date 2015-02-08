/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	signup: function(req,res){
    res.view('signup');
  },
  create: function(req,res,next){
    User.create(req.params.all(), function userCreated(err,user){
      if(err){
        req.flash('err',err.ValidationError);
        return res.redirect('/signup');
      }
      return res.json(user);
    })
  }
};

