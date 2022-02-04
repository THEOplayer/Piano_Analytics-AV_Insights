const accountId = 614713;
const tag = new ATInternet.Tracker.Tag({ site: accountId });
const media = new tag.avInsights.Media(5, 5);
const DEBUG = true;

const AVInsights = {
  init: function (player) {
    let firstPlayDone = false;
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
      player.removeEventListener('waiting', bufferStart);
      if (DEBUG) {
        console.log("media.bufferStart(" + getCursorPosition() + ");")
      }
      media.bufferStart(getCursorPosition());
    }
    function playbackStart(event) {
      firstPlayDone = true;
      player.removeEventListener('playing', playbackStart);
      if (DEBUG) {
        console.log("media.playbackStart(" + getCursorPosition() + ");")
      }
      media.playbackStart(getCursorPosition());
    }
    function playbackPaused(event) {
      if (DEBUG) {
        console.log("media.playbackPaused(" + getCursorPosition() + ");")
      }
      media.playbackPaused(getCursorPosition());
    }
    let oldCursorPosition;
    let seeking = false;
    function oldCursorPositionHandler(event) {
      if (!seeking) {
        oldCursorPosition = player.currentTime;
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
        }
        media.seek(getCursorPosition(oldCursorPosition), getCursorPosition(newCursorPosition));
      }
    }
    function playbackResumed(event) {
      if (firstPlayDone) {
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
        if (DEBUG) {
          console.log("media.playbackStopped(" + getCursorPosition() + ");")
        }
        media.playbackStopped(getCursorPosition());
      }
    }
    function updateMedia(duration) {
      const properties = {
        av_content_id: "fge234",
        av_content: "myContent",
        av_content_type: "video",
        av_content_duration: duration || player.duration,
        av_content_genre: ["News", "Sport"],
        av_player: "THEOplayer Web SDK",
        av_player_version: THEOplayer.version
      };
      if (DEBUG) {
        console.log("calling media.setProps with", properties);
      }
      media.setProps(properties);
    }
    player.addEventListener('sourcechange', function () {
      if (DEBUG) {
        console.log("sourcechange");
      }
      firstPlayDone = false;
      seekTime = 0;
      updateMedia(596);
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
      player.removeEventListener('play', playbackResumed);
      player.addEventListener('play', playbackResumed);
      player.removeEventListener('waiting', rebufferStart);
      player.addEventListener('waiting', rebufferStart);
      player.removeEventListener('ended', playbackStopped);
      player.addEventListener('ended', playbackStopped);
    });
  }
};
