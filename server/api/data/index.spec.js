'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var dataCtrlStub = {
  index: 'dataCtrl.index',
  show: 'dataCtrl.show',
  create: 'dataCtrl.create',
  upsert: 'dataCtrl.upsert',
  patch: 'dataCtrl.patch',
  destroy: 'dataCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var dataIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './data.controller': dataCtrlStub
});

describe('Data API Router:', function() {
  it('should return an express router instance', function() {
    expect(dataIndex).to.equal(routerStub);
  });

  describe('GET /api/data', function() {
    it('should route to data.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'dataCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/data/:id', function() {
    it('should route to data.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'dataCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/data', function() {
    it('should route to data.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'dataCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/data/:id', function() {
    it('should route to data.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'dataCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/data/:id', function() {
    it('should route to data.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'dataCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/data/:id', function() {
    it('should route to data.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'dataCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
