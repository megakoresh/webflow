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
  update: function(req, res){
    if(req.session.user !== undefined) {
      var newData = req.param('user');
      
      User.update({id: req.session.user}).exec(function(err, user){
      
      })
    }
  },
  login: function (req, res) {
    var bcrypt = require('bcryptjs');
	console.log('Hi');
    User.findOneByEmail(req.param("email")).exec(function (err, user) {
      if (err) res.json({ error: 'DB error' }, 500);

      if (user) {
        bcrypt.compare(req.param("password"), user.password, function (err, match) {
          if (err) res.json({ error: 'Server error' }, 500);

          if (match) {
            // password match			
            req.session.user = user.id;
            return res.redirect('/panel');            
            /*res.view('panel',{
              username: user.username,
              email: user.email,
              avatar: user.avatar
            });*/
          } else {
            // invalid password
            if (req.session.user) req.session.user = null;
            res.json({ error: 'Invalid password' }, 400);
          }
        });
      } else {
        res.send('<h2>User not found WTFLOL!</h2>');
      }
    });
  },
  logout: function(req,res){
    req.session = null;
    return res.redirect("/signup");
  },
  displayPanel: function(req, res){
    if(req.session.user !== undefined) {
      User.findOneById(req.session.user).exec(function(err, user){
        if (err) return res.negotiate(err);
        
        if (user){
          delete user.password;
          return res.view('panel',user);
        }
      });
    } else {
      return res.send('NOT SESSION EEZ BAD!');
    }
  },
  create: function(req,res,next){
    var params = req.params.all();
    if (params.password != params.confirmation){
      req.flash("Passowrds don't match");
      return res.redirect('/signup');
    }
    var Gravatar = require('machinepack-gravatar');
    // Build the URL of a gravatar image for a particular email address.
    Gravatar.getImageUrl({
      emailAddress: params.email,
      gravatarSize: 400,
      defaultImage: 'http://www.gravatar.com/avatar/00000000000000000000000000000000',
      rating: 'g',
      useHttps: true
    }).exec({
      'error': function(){
        params.avatar = 'http://www.gravatar.com/avatar/00000000000000000000000000000000';
	User.create(params, function userCreated(err,user){
	  if(err){
		req.flash('err',err.ValidationError);
		return res.redirect('/signup');
	  }
	  res.location('/panel');
	  return res.view('panel');
	});
      },
      'encodingFailed': function(){        
	User.create(params, function userCreated(err,user){
	  if(err){
		req.flash('err',err.ValidationError);
		return res.redirect('/signup');
	  }
          res.location('/panel');
	  return res.view('panel');
	});
      },
      'success': function(imgUrl){
        params.avatar = imgUrl;
	User.create(params, function userCreated(err,user){
	  if(err){
		req.flash('err',err.ValidationError);
		return res.redirect('/signup');
	  }
	  res.location('/panel');
	  return res.view('panel');
	});
      }
    });
  }
};

