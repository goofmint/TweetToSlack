const FastText = require('fasttext.js');
const kuromoji = require('kuromoji');

class SpamCheker {
  
  constructor() {
    this.builder = kuromoji.builder({
      dicPath: 'node_modules/kuromoji/dict'
    });
    this.tokenizer = null;
    this.limitLength = 1;
    this.modelPath = './model.bin';
    this.fastText = new FastText({
      loadModel: this.modelPath
    });
    this.loaded = false;
  }
  
  async init() {
    if (!this.tokenizer) this.tokenizer = await this.kuromojiBuild();
    if (!this.loaded) {
      this.loaded = true;
      await this.fastText.load();
    }
  }
  
  async isSpam(str) {
    await this.init();
    const content = str.replace(/https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+/, '');
    this.words = await this.getWords(content);
    const results = await this.fastText.predict(this.words.join(' '));
    return (results[0] && results[0].label === '0') ? false : true;
  }
  
  end() {
    this.fastText.unload();
  }
  
  async getWords(text) {
    const tokens = this.tokenizer.tokenize(text);
    const words = tokens.filter(word => {
      if (word.surface_form.length > this.limitLength && ['名詞', '動詞'].indexOf(word.pos) > -1) return 1;
    })
    .map(word => word.surface_form);
    return words;
  }
  
  // Build kuromoji
  async kuromojiBuild() {
    return new Promise((res, rej) => {
      this.builder.build((err, tokenizer) => {
        if (err) {
          rej(err);
        } else {
          res(tokenizer);
        }
      });
    });
  }
}


exports.SpamCheker = SpamCheker;