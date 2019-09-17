# ananbot
Open issue bot from AOSC telegram group

## How to use?
- clone, build and install [td](https://github.com/tdlib/td)
- install `nodejs` and `yarn`
- clone this repo
- cd ananbot and create `telegram.json` file, example:
```
{
    "apiId": //Telegram API ID,
    "apiHash": // Telegram API Hash
}
```
- create `github.json`, example:
```
{
  "username": "YOU GITHUB ACCOUNT",
  "password": "YOU GITHUB ACCOUNT PASSOWRD",
  "owner": "YOU GITHUB REPO OWNER", //like aosc-dev
  "repo": "YOU GITHUB REPO" //like aosc-os-abbs
}

```
- use `yarn` install dep
- use `npx ts-node index.ts` start bot.

## TODO
- [ ]Readme
- [ ] License
- [ ] Worlfow
- [ ] Github Open issue/comment issue Markdown support
