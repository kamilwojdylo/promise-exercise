/*
import {spider, TaskQueue} from './index.js';
import got from 'got';
import sinon from 'sinon';
import chai from 'chai';
*/
const {spider, TaskQueue} = require('./index.js');
const got = require('got');
const sinon = require('sinon');
const chai = require('chai');

const {expect} = chai;


describe('test', function() {
  beforeEach(function() {
    this.spy = sinon.spy(got, 'get');
  });

  afterEach(function() {
    got.get.restore();
  });
  it('should pass', function(done) {
    //jaka funkcja jest wywoływana jeżeli zrobi się got('link');
    //czy import pozwala na takie mockowanie modułów tzn. czy monkey patching działa z importami
    //Arrange
    const queue = new TaskQueue(2, finalCb.bind(this));
    const urlToSpider = 'http://localhost:8080';

    //Act
    queue.push((done) => {
      spider(urlToSpider, 2, done, queue);
    });

    //Assert
    function finalCb() {
      expect(this.spy.callCount).to.equal(19);
      done();
    };
  });
});
