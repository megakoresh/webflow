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
  },
  beforeCreate: function (attrs, next) {
    var bcrypt = require('bcrypt');

    bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);

      bcrypt.hash(attrs.password, salt, function(err, hash) {
        if (err) return next(err);

        attrs.password = hash;
        next();
      });
    });
  }
};

