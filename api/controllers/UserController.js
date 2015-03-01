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
  login: function (req, res) {
    var bcrypt = require('bcrypt');

    User.findOneByEmail(req.param("email")).exec(function (err, user) {
      if (err) res.json({ error: 'DB error' }, 500);

      if (user) {
        bcrypt.compare(req.param("password"), user.password, function (err, match) {
          if (err) res.json({ error: 'Server error' }, 500);

          if (match) {
            // password match
            req.session.user = user.id;
            res.json(req.session.user);
          } else {
            // invalid password
            if (req.session.user) req.session.user = null;
            res.json({ error: 'Invalid password' }, 400);
          }
        });
      } else {
        res.json({ error: 'User not found' }, 404);
      }
    });
  },
  logout: function(req,res){
    req.session = null;
    return res.redirect("/signup");
  },
  create: function(req,res,next){
    User.create(req.params.all(), function userCreated(err,user){
      if (req.param("password") != req.param("confirmation")){
        return next("Fucking check your fucking password you fucktard!!!!");
      } 
      if(err){
        req.flash('err',err.ValidationError);
        return res.redirect('/signup');
      }
      return res.json(user);
    })
  }
};

