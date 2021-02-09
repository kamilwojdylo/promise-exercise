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

function spider(link, nesting, doneCb) {
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

    let completed = 0;

    linksOnPage.forEach(linkOnPage => {
      spider(linkOnPage, nesting - 1, () => {
        completed++;
        if (completed === linksCount) {
          return doneCb();
        }
      });
    });
  }
}
