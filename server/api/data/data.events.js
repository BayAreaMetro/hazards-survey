/**
 * Data model events
 */

'use strict';

import {EventEmitter} from 'events';
var Data = require('../../sqldb').Data;
var DataEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
DataEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Data) {
  for(var e in events) {
    let event = events[e];
    Data.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    DataEvents.emit(event + ':' + doc._id, doc);
    DataEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Data);
export default DataEvents;
