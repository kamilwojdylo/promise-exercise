import {
  downloadFile,
  findOtherLinks,
  makePathsToStore,
  createDirs,
  updateStats,
  stats,
  storeFileContent,
} from './utils.js';

const urlToSpider = 'http://localhost:8080';
const finalCb = () => {
  console.log('Operation finished.');
  console.log(stats);
};

spider(urlToSpider, 2, finalCb);

let concurrency = 2;
let running = 1;

function spider(link, nesting, doneCb) {
  updateStats(link);
  downloadFile(link, fileDownloaded);

  function fileDownloaded(body, downloadedLink) {
    running--;
    storeFileContent(downloadedLink, body);

    if (nesting === 0) {
      return doneCb();
    }

    const linksOnPage = findOtherLinks(downloadedLink, body);
    const linksCount = linksOnPage.length;

    if (linksCount < 1) {
      return doneCb();
    }

    let completed = 0;
    let idx = 0;

    function iterate() {
      while(running < concurrency && idx < linksCount) {
        const nextLink = linksOnPage[idx];
        spider(nextLink, nesting - 1, () => {
          completed++;
          if (completed === linksCount) {
            return doneCb();
          }
          iterate();
        });
        running++;
        idx++;
      }
    }
    iterate();
  }
}
