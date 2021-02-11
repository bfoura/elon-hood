## ElonHood

<br />
elon-hood is a sunday project made for fun. It gives you the ability to place a futures trading order each time elon musk tweets about dogecoin.<br />
The placed order is highly empirical and is built on the assumption that each time elon musk tweets about dogecoin, the price jumps in a few seconds. <br />
To protect yourself, a trailing stop is put in place. It is possible to tweak the callback rate (0.1% to 5%) so that the stop price follows the trend and close your position if the price drops below that threshold. <br />
We can define this as a poor man's scalp trading strategy :) <br />

## Notice

If you don't know what are futures trading, trailing stop or even who is elon musk, I advise you to close this window :-) <br />
If you do, you are responsible of the risks you are taking.<br />

### To run it

<br />

You need to have [nvm](https://github.com/nvm-sh/nvm) installed

<br />

```
nvm use
npm install
node src/index
```

<br />
You need to have a twitter developer account and a Binance account.
Use the following env variables:

<br />

| Key                       | Value                                           |
| ------------------------- | ----------------------------------------------- |
| NODE_ENV                  | Node environment                                |
| TWITTER_TOKEN             | Twitter api token                               |
| TWITTER_SECRET            | Twitrer api secret                              |
| TWITTER_CONSUMER_KEY      | Twitter consumer key                            |
| TWITTER_CONSUMER_SECRET   | Twtter consumer secret                          |
| TWITTER_BEARER_TOKEN      | Twitter bearer token                            |
| TWITTER_ENVIRONMENT       | Twitter app project environment                 |
| TWITTER_USERNAME_TO_WATCH | Twitter username to watch. e.g. @elonmusk       |
| BINANCE_API_KEY           | Binance api key                                 |
| BINANCE_API_SECRET        | Binance api secret                              |
| SERVER_URL_DOMAIN         | Server url. e.g "https://9aa0a64aca14.ngrok.io" |
| SERVER_ROUTE_URL          | Api route url. e.g "/webhook/listen"            |
| PORT                      | Server port. e.g. 3333                          |

### Next Steps

<br />
Add more orders types (Market, Limit, Stop limit..)<br />
Enhance order placing strategy based on some more advanced rules.
