# Piano Analytics AV Insights

This project provides a THEOplayer Web SDK integration of [Piano Analytics' AV Insights](https://developers.atinternet-solutions.com/as2-tagging-en/javascript-en/content-javascript-en/media-javascript-en/av-insights-javascript-en/).

## How to use

1/ Run the following commands to get the Piano Analytics AV Insights adapter (i.e. `PianoAnalyticsAVInsightsTHEOplayerAdapter.js`), e.g.
```javascript
npm install
npm run build
```

2/ Add the Piano Analytics AV Insights adapter to your page, e.g.
```html
<script src="src/PianoAnalyticsAVInsightsTHEOplayerAdapter.js"></script>
```

3/ Initialize the adapter, e.g.
```javascript
AVInsights.init(player, {debug: true});
```

4/ Set a video [`source`](https://docs.theoplayer.com/api-reference/web/theoplayer.sourcedescription.md) with the `pianoAnalyticsAVInsights` property, e.g.
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
      },
      {
            "sources": "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=",
            "timeOffset": "00:00:15",
            "integration": "google-ima"
        },
        {
            "sources": "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=",
            "timeOffset": "end",
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