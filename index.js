import {
  downloadFile,
  findOtherLinks,
  makePathsToStore,
  createDirs,
  updateStats,
  stats,
  storeFileContent,
} from './utils.js';

class TaskQueue {
  constructor(concurrency, fin) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
    this.fin = fin;
  }

  push(task) {
    this.queue.push(task);
    process.nextTick(this.next.bind(this));
    return this;
  }

  next() {
    if (this.queue.length === 0 && this.running === 0) {
      return this.fin();
    }

    while(this.running < this.concurrency && this.queue.length > 0) {
      const nextTask = this.queue.shift();
      nextTask(done => {
        this.running--;
        process.nextTick(this.next.bind(this));
      });
      this.running++;
    }
  }
}

const urlToSpider = 'http://localhost:8080';
const finalCb = () => {
  console.log('Operation finished.');
  console.log(stats);
};

/*
const queue = new TaskQueue(2, finalCb);
queue.push((done) => {
  spider(urlToSpider, 2, done, queue);
});
*/

//spider(urlToSpider, 2, finalCb);

function spider(link, nesting, doneCb, queue) {
  updateStats(link);
  downloadFile(link, downloadFinished);

  function downloadFinished(body, link) {
    storeFileContent(link, body);

    if (nesting === 0) {
      return doneCb();
    }

    const linksOnPage = findOtherLinks(link, body);
    const linksCount = linksOnPage.length;

    if (linksCount === 0) {
      return doneCb();
    }

    linksOnPage.forEach(link => {
      queue.push((done) => {
        spider(link, nesting - 1, done, queue);
      });
    });
    doneCb();
  }
}

export {
  TaskQueue,
  spider
};
