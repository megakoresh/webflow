/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  schema: true,

  attributes: {

    // The user's name or callsign
    name: {
      type: 'string',
      required: true
    },

    //Favourite animal
    favan: {
      type: 'string'
    },

    // The user's email address
    // e.g. jonsnow@winterfell.net
    email: {
      type: 'string',
      email: true,
      required: true,
      unique: true
    },

    hash: {
      type: "string"
      //required: true
    }
  }/*,
  toJSON: function(){ //Override the user response to prevent sensitive data from coming back.
    var obj = this.toObject();
    delete obj.password;
    delete obj.confirmation;
    delete obj._csrf;
    delete obj.encryptedPassword;
    return obj;
  }*/

};

