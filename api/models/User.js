/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  schema: true,
  connection: 'localMaria',

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

    password: {
      type: "string",
      required: true
    }
  }
};

