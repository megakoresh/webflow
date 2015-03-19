/**
* Post.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    userID: {
      model: 'user'
    },
    content: {
      type: 'string',
      required: 'true'
    },
    NSFW: {
      type: 'boolean',
      defaultsTo: false
    }
  }
};

