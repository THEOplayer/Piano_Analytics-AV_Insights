# Piano Analytics AV Insights

This project provides a THEOplayer Web SDK integration of [Piano Analytics' AV Insights](https://developers.atinternet-solutions.com/as2-tagging-en/javascript-en/content-javascript-en/media-javascript-en/av-insights-javascript-en/).

## How to use

This section explains how to get the THEOplayer Piano Analytics AV Insights adapter up and running.
This section assumes that you've correctly set up the THEOplayer Web SDK on your page (e.g. [index.html](index.html)).

1/ Run the following commands to build the Piano Analytics AV Insights adapter, e.g.
```javascript
npm install
npm run build
```
This `npm run build` command recompiles [`src/PianoAnalyticsAVInsightsTHEOplayerAdapter.js`][src/PianoAnalyticsAVInsightsTHEOplayerAdapter.js] into a minified [`dist/PianoAnalyticsAVInsightsTHEOplayerAdapter.min.js`](dist/PianoAnalyticsAVInsightsTHEOplayerAdapter.min.js).

2/ Add the Piano Analytics AV Insights tag, e.g.
```html
<script src="https://tag.aticdn.net/614713/smarttag.js"> </script>
```

3/ Add the Piano Analytics AV Insights adapter to your page, e.g.
```html
<script src="dist/PianoAnalyticsAVInsightsTHEOplayerAdapter.min.js"></script>
```

4/ Initialize the adapter, e.g.
```javascript
const avInsights = new AVInsights(player, {debug: true, accountId: "614713"});
```

5/ Set a video [`source`](https://docs.theoplayer.com/api-reference/web/theoplayer.sourcedescription.md) with the `pianoAnalyticsAVInsights` property, e.g.
```javascript
player.source = {
    "sources": [{
      "src": "//cdn.theoplayer.com/video/big_buck_bunny/big_buck_bunny_metadata.m3u8"
    }],
    "ads": [
      {
            "sources": "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=",
            "timeOffset": "start",
            "integration": "google-ima"
      }
    ],
    "pianoAnalyticsAVInsights": {
      metadata: {
        av_content_id: "fge234",
        av_content: "myContent",
        av_content_type: "video",
        av_content_duration: 596000,
        av_content_genre: ["News", "Sport"]
      }
    }
};
```

## Remarks

1. An example is available at [`index.html`](index.html).

2. This adapter has been specifically certified for the following features:
    * HLS VOD streams
    * Advertisements pre-rolls using [THEOplayer's Google IMA integration](https://docs.theoplayer.com/how-to-guides/01-ads/10-google-ima.md/)

## License

The contents of this package are subject to the [THEOplayer license](https://www.theoplayer.com/terms).