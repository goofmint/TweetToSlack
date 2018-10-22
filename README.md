# Tweet to Slack

Search tweet and post to slack with FastText.

# Usage

## First training

```
echo "__label__0 , dummy" >> train.txt
```

Create model.

```
node train.js
```

## Execute

```
node index.js
```

It generates training file named "train.txt" like below. It's for use FastText.

```
__label__0 , 新着 2017 10 03 Monaca UG 集まれ Monaca ユーザー atnd_kanto
__label__1 , 三重 monaca 日比谷 野外 音楽 スチャダラパーシングス 13 名古屋 budda the young master 14 roboago
```

You should change to `__label__1` from `__label__0` if you want ignore it. After editing, run again.

```
node train.js
```

## License

MIT.