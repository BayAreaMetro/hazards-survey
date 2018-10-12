/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data              ->  index
 * POST    /api/data              ->  create
 * GET     /api/data/:id          ->  show
 * PUT     /api/data/:id          ->  upsert
 * PATCH   /api/data/:id          ->  patch
 * DELETE  /api/data/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import { Data } from '../../sqldb';
import config from '../../config/environment';
// Sql Server Library
var sql = require("mssql");



function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
        if (entity) {
            return res.status(statusCode).json(entity);
        }
        return null;
    };
}

function patchUpdates(patches) {
    return function(entity) {
        try {
            // eslint-disable-next-line prefer-reflect
            jsonpatch.apply(entity, patches, /*validate*/ true);
        } catch (err) {
            return Promise.reject(err);
        }

        return entity.save();
    };
}

function removeEntity(res) {
    return function(entity) {
        if (entity) {
            return entity.destroy()
                .then(() => {
                    res.status(204).end();
                });
        }
    };
}

function handleEntityNotFound(res) {
    return function(entity) {
        if (!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode).send(err);
    };
}

// Gets a list of Datas
export function index(req, res) {
    return Data.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Data from the DB
export function show(req, res) {
    return Data.find({
            where: {
                _id: req.params.id
            }
        })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Data in the DB
export function create(req, res) {
    return Data.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given Data in the DB at the specified ID
export function upsert(req, res) {
    if (req.body._id) {
        Reflect.deleteProperty(req.body, '_id');
    }

    return Data.upsert(req.body, {
            where: {
                _id: req.params.id
            }
        })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Upserts the given Data in the DB at the specified ID
export function getResults(req, res) {
    console.log(req.body);
    var wkt = 'Point (' + req.body.lng + ' ' + req.body.lat + ')';
    console.log(wkt);
    var request = new sql.Request(config.mssql);
    request.input('id', sql.Int, 3);
    request.input('wkt', sql.NVarChar(255), wkt);

    request.execute('dbo.getSpatialResults_update', (err, result) => {
        // ... error checks
        if (err) {
            console.log(err);
            sql.close();
        }
        console.log(result);

        res.json(result);
        sql.close();


    });

}

// Updates an existing Data in the DB
export function patch(req, res) {
    if (req.body._id) {
        Reflect.deleteProperty(req.body, '_id');
    }
    return Data.find({
            where: {
                _id: req.params.id
            }
        })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Data from the DB
export function destroy(req, res) {
    return Data.find({
            where: {
                _id: req.params.id
            }
        })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}