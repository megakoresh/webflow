/**
* Node.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  schema: true,
  attributes: {
    Chart: {
      required: true,
      model: 'Chart',
      defaultsTo: 1
    },
    x: {
      required: true,
      type: 'integer',
      defaultsTo: 100
    },
    y: {
      required: true,
      type: 'integer',
      defaultsTo: 100
    },
    width: {
      required: true,
      type: 'integer',
      defaultsTo: 100
    },
    height: {
      required: true,
      type: 'integer',
      defaultsTo: 65
    },
    color: {
      required: true,
      type: 'string',
      defaultsTo: "#13293D"
    },
    text: {
      required: true,
      type: 'string',
      defaultsTo: "Node text"
    },
    label: {
      type: 'string',
      defaultsTo: "Node label"
    },
    targets: {
      type: 'array'
    }
  }
};

