import {spider, TaskQueue} from './index.js';
import got from 'got';
import sinon from 'sinon';
import chai from 'chai';
import nock from 'nock';

const {expect} = chai;

const responseBody = `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8"/>
    </head>
    <body>
      <h1>Hello World!</h1>

      <p>This is a <a href="second/1/">link</a></p>
      <p>This is a <a href="second/2/">link</a></p>
      <p>This is a <a href="second/3/">link</a></p>
      <p>This is a <a href="second/4/">link</a></p>
      <p>This is a <a href="second/5/">link</a></p>
      <p>This is a <a href="second/6/">link</a></p>

      <p>This is an <a href="https://wwww.wp.pl">external link</a></p>
    </body>
  </html>
  `;

const secondResponseBody = `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8"/>
    </head>
    <body>
      <p>This is a second subpage.</p>
      <p>Second <a href="third/1">link to thrid page</a></p>
      <p>Second <a href="third/2">link to thrid page</a></p>
    </body>
  </html>
  `;

const thirdResponseBody = `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8"/>
    </head>
    <body>
      <p>This is a third subpage.</p>
    </body>
  </html>
  `;

describe('test', function() {
  before(function() {
    nock('http://localhost:8080')
      .persist()
      .get('/')
      .reply(200, responseBody)
      // niby regex'y też działają ale tutaj coś nie
      //.get('/second/.*/'
      .persist()
      .get(uri => (uri.includes('second') && !uri.includes('third')))
      .reply(200, secondResponseBody)
      //.get('/second/.*/third/.*/')
      .persist()
      .get(uri => (uri.includes('second') && uri.includes('third')))
      .reply(200, thirdResponseBody)
    ;
  });
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
      expect(this.spy.calledWith('http://localhost:8080')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/1/')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/2/')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/3/')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/4/')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/5/')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/6/')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/1/third/1')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/1/third/2')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/2/third/1')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/2/third/2')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/3/third/1')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/3/third/2')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/4/third/1')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/4/third/2')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/5/third/1')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/5/third/2')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/6/third/1')).to.be.true;
      expect(this.spy.calledWith('http://localhost:8080/second/6/third/2')).to.be.true;
      done();
    };
  });
});
