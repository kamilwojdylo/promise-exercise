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
  constructor(concurrency, finishCb) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
    this.finishCb = finishCb;
  }

  push(task) {
    this.queue.push(task);
    process.nextTick(this.next.bind(this));
    return this;
  }

  next() {
    if (this.queue.length === 0 && this.running === 0) {
      return this.finishCb();
    }

    while(this.running < this.concurrency && this.queue.length > 0) {
      const nextTask = this.queue.shift();
      nextTask(() => {
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

//spider(urlToSpider, 2, finalCb);
const queue = new TaskQueue(2, finalCb);

queue.push((done) => {
  spider(urlToSpider, 2, done, queue);
})

function spider(link, nesting, doneCb, queue) {
  updateStats(link);
  downloadFile(link, fileDownloaded);

  function fileDownloaded(body, downloadedLink) {
    storeFileContent(downloadedLink, body);

    if (nesting === 0) {
      return doneCb();
    }

    const linksOnPage = findOtherLinks(downloadedLink, body);
    const linksCount = linksOnPage.length;

    if (linksCount < 1) {
      return doneCb();
    }

    linksOnPage.forEach(linkOnPage => {
      queue.push((done) => {
        spider(linkOnPage, nesting - 1, done, queue);
      })
    });
    doneCb();
  }
}
