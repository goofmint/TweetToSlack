const FastText = require('fasttext.js');
const config = require('./config');

(async () => {
  var fastText = new FastText({
    serializeTo: './model',
    trainFile: config.files.train,
    
  });
  await fastText.train({
    dim: 10,
    lr: 0.1,
    wordNgrams: 2,
    minCount: 1,
    bucket: 10000000,
    epoch: 5,
    thread: 4
  });
  console.log('Done');
})();