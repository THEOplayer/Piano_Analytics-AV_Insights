const accountId = 614713;
const tag = new ATInternet.Tracker.Tag({ site: accountId });
const media = new tag.avInsights.Media(5, 5);
const DEBUG = true;

const AVInsights = {
  init: function (player, native) {
    let firstPlayDone = false;
    let ended = false;
    let events = [];
    let adMedia = {};
    let isGoogleIma = false;
    let metadata = false;
    function getCursorPosition(valueInSeconds) {
      if (!valueInSeconds) {
        return Math.floor(player.currentTime * 1000);
      } else {
        return Math.floor(valueInSeconds * 1000);
      }
    }
    function play(event) {
      player.removeEventListener('play', play);
      if (DEBUG) {
        console.log("media.play(" + getCursorPosition() + ");")
      }
      media.play(getCursorPosition());
    }
    function bufferStart(event) {
      // player.removeEventListener('waiting', bufferStart);
      if (DEBUG) {
        console.log("media.bufferStart(" + getCursorPosition() + ");")
      }
      media.bufferStart(getCursorPosition());
    }
    function playbackStart(event) {
      firstPlayDone = true;
      player.removeEventListener('playing', playbackStart);
      if (DEBUG) {
        console.log("media.playbackStart(" + getCursorPosition(event.currentTime) + ");")
      }
      media.playbackStart(event.currentTime);
    }
    function playbackPaused(event) {
      if (!ended) {
        if (didAdPlaybackStart) {
          if (DEBUG) {
            console.log("adMedia.playbackPaused(" + getCursorPosition() + ");")
          }
          adMedia.playbackPaused(getCursorPosition());
        } else {
          if (DEBUG) {
            console.log("media.playbackPaused(" + getCursorPosition() + ");")
          }
          media.playbackPaused(getCursorPosition());
        }
        
      }
    }
    let oldCursorPosition;
    let seeking = false;
    function oldCursorPositionHandler(event) {
      if (!seeking && !player.ads.playing) {
        oldCursorPosition = player.currentTime;
      }
    }
    duration = -1;
    function durationHandler(event) {
      if (!player.ads.playing) {
        duration = event.duration * 1000;
      }
    }
    function seekHandler(event) {
      seeking = true;
    }
    function seek(event) {
      seeking = false;
      if (firstPlayDone) {
        const newCursorPosition = player.currentTime;
        if (DEBUG) {
          console.log("media.seek(" + getCursorPosition(oldCursorPosition) + "," + getCursorPosition(newCursorPosition) + ");")
          // console.log("media.playbackResumed(" + getCursorPosition() + ");")
        }
        media.seek(getCursorPosition(oldCursorPosition), getCursorPosition(newCursorPosition));
        // media.playbackResumed(getCursorPosition());
      }
    }
    function playbackResumed(event) {
      if (firstPlayDone && !seeking && !player.ads.playing) {
        if (DEBUG) {
          console.log("media.playbackResumed(" + getCursorPosition() + ");")
        }
        media.playbackResumed(getCursorPosition());
      }
    }
    function rebufferStart(event) {
      if (firstPlayDone) {
        if (DEBUG) {
          console.log("media.rebufferStart(" + getCursorPosition() + ");")
        }
        media.rebufferStart(getCursorPosition());
      }
    }
    function playbackStopped(event) {
      if (firstPlayDone) {
        ended = true;
        if (DEBUG) {
          console.log("media.playbackStopped(" + getCursorPosition() + ");")
        }
        media.playbackStopped(getCursorPosition());
      }
    }
    function updateMedia() {
      duration = metadata["av_content_duration"] || player.duration;
      const properties = {
        av_content_id: metadata["av_content_id"],
        av_content: metadata["av_content"],
        av_content_type: metadata["av_content_type"],
        av_content_duration: duration,
        av_content_genre: metadata["av_content_genre"],
        av_player: "THEOplayer Web SDK",
        av_player_version: window.THEOplayer && window.THEOplayer.version
      };
      if (DEBUG) {
        console.log("calling media.setProps with", properties);
      }
      media.setProps(properties);
    }
    function setAdProps(event) {
      isGoogleIma = event.ad.integration && (event.ad.integration == "google-ima");
      // didAdPlaybackStart = true;
      adMedia = new tag.avInsights.Media(5,5);
      const ad = event.ad;
      const isPostroll = (oldCursorPosition + 5 > (duration/1000));
      const isPreroll = (oldCursorPosition < 0.5);
      const adType = isPreroll ? ("preroll") : (isPostroll ? "postroll" : "midroll");
      const properties = {
          av_content_id : ad.creativeId,
          av_content : adType+"-"+ ad.creativeId,
          av_content_type : "video",
          av_ad_type : adType,
          av_content_linked : media.getProps()["av_content_id"], // the ID of the main content
          av_content_duration : getCursorPosition(ad.duration)
     };
      if (DEBUG) {
        console.log("calling adMedia.setProps with", properties);
      }
      adMedia.setProps(properties);
    }
    let didAdPlaybackStart = false;
    function adPlay(event) {
      if (player.ads.playing && !didAdPlaybackStart) {
        if (isGoogleIma) {
          media.playbackPaused(getCursorPosition(oldCursorPosition));
          if (DEBUG) {
            console.log("media.playbackPaused("+getCursorPosition(oldCursorPosition)+")");
          }
        }
        if (DEBUG) {
          console.log("adMedia.play("+getCursorPosition()+")");
          console.log("adMedia.playbackStart("+getCursorPosition()+")");
        }
        adMedia.play(getCursorPosition());
        adMedia.playbackStart(getCursorPosition());
      }
      if (player.ads.playing) {
        didAdPlaybackStart = true;
      }
    }
    function adPlaybackResumed(event) {
      if (didAdPlaybackStart) {
        if (DEBUG) {
          console.log("adMedia.playbackResumed(" + getCursorPosition() + ");")
        }
        adMedia.playbackResumed(getCursorPosition());
      }
    }
    function adPlaybackStopped(event) {
      didAdPlaybackStart = false;
      if (DEBUG) {
        console.log("adMedia.playbackStopped("+getCursorPosition(event.ad.duration)+")");
      }
      adMedia.playbackStopped(getCursorPosition(event.ad.duration));
    }
    player.addEventListener('sourcechange', function (event) {
      if (DEBUG) {
        console.log("sourcechange", event.source);
      }
      if (!event.source.pianoAnalyticsAVInsights) {
        return;
      }
      metadata = event.source.pianoAnalyticsAVInsights.metadata;
      firstPlayDone = false;
      ended = false;
      seekTime = 0;
      updateMedia();
      events = [];
      adMedia = {};
      player.removeEventListener('play', play);
      player.addEventListener('play', play);
      player.removeEventListener('waiting', bufferStart);
      player.addEventListener('waiting', bufferStart);
      player.removeEventListener('playing', playbackStart);
      player.addEventListener('playing', playbackStart);
      player.removeEventListener('pause', playbackPaused);
      player.addEventListener('pause', playbackPaused);
      player.removeEventListener('timeupdate', oldCursorPositionHandler);
      player.addEventListener('timeupdate', oldCursorPositionHandler);
      player.removeEventListener('durationchange', durationHandler);
      player.addEventListener('durationchange', durationHandler);
      player.removeEventListener('seeking', seekHandler);
      player.addEventListener('seeking', seekHandler);
      player.removeEventListener('seeked', seek);
      player.addEventListener('seeked', seek);
      player.removeEventListener('playing', playbackResumed);
      player.addEventListener('playing', playbackResumed);
      // player.removeEventListener('waiting', rebufferStart);
      // player.addEventListener('waiting', rebufferStart);
      player.removeEventListener('ended', playbackStopped);
      player.addEventListener('ended', playbackStopped);

      // ADS
      player.ads.removeEventListener("adbegin", setAdProps);
      player.ads.addEventListener("adbegin", setAdProps);
      player.removeEventListener("playing", adPlay);
      player.addEventListener("playing", adPlay);
      player.ads.removeEventListener("adend", adPlaybackStopped);
      player.ads.addEventListener("adend", adPlaybackStopped);
      player.removeEventListener('play', adPlaybackResumed);
      player.addEventListener('play', adPlaybackResumed);

    });
    if (native) {
      if (DEBUG) {
        console.log("sourcechange");
      }
      firstPlayDone = false;
      ended = false;
      seekTime = 0;
      updateMedia();
      player.removeEventListener('play', play);
      player.addEventListener('play', play);
      player.removeEventListener('waiting', bufferStart);
      player.addEventListener('waiting', bufferStart);
      player.removeEventListener('playing', playbackStart);
      player.addEventListener('playing', playbackStart);
      player.removeEventListener('pause', playbackPaused);
      player.addEventListener('pause', playbackPaused);
      player.removeEventListener('timeupdate', oldCursorPositionHandler);
      player.addEventListener('timeupdate', oldCursorPositionHandler);
      player.removeEventListener('seeking', seekHandler);
      player.addEventListener('seeking', seekHandler);
      player.removeEventListener('seeked', seek);
      player.addEventListener('seeked', seek);
      player.removeEventListener('playing', playbackResumed);
      player.addEventListener('playing', playbackResumed);
      // player.removeEventListener('waiting', rebufferStart);
      // player.addEventListener('waiting', rebufferStart);
      player.removeEventListener('ended', playbackStopped);
      player.addEventListener('ended', playbackStopped);
    }
  }
};
