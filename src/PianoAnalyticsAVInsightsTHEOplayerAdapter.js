export class AVInsights {

  #accountId
  #tag
  #media
  #adMedia
  #metadata
  #DEBUG
  #firstPlayDone
  #ended
  #events
  #isGoogleIma
  #duration
  #oldCursorPosition
  #seeking
  #didAdPlaybackStart

  constructor(player, configuration) {
    this.player = player;
    this.configuration = configuration;
    this.#init();
  }
  #init() {
    this.#accountId = this.configuration?.accountId;
    let tag;
    if (this.#accountId) {
      tag = new ATInternet.Tracker.Tag({ site: this.#accountId });
    } else {
      tag = new ATInternet.Tracker.Tag();
    }
    this.#media = new tag.avInsights.Media(5, 5);
    this.#tag = tag;
    this.#firstPlayDone = false;
    this.#ended = false;
    this.#events = [];
    this.#adMedia = {};
    this.#isGoogleIma = false;
    this.#metadata = false;
    this.#DEBUG = this.configuration?.debug;
    this.#duration = -1;
    this.#oldCursorPosition = -1;
    this.#seeking = false;
    this.#didAdPlaybackStart = false;
    if (this.#DEBUG) {
      console.log("Piano Analytics version:", this.#tag.version);
    }
    this.player.addEventListener('sourcechange', (event) => {
      if (this.#DEBUG) {
        console.log("sourcechange", event.source);
      }
      if (!event.source.pianoAnalyticsAVInsights) {
        return;
      }
      this.#metadata = event.source.pianoAnalyticsAVInsights.metadata;
      this.#firstPlayDone = false;
      this.#ended = false;
      this.#updateMedia();
      this.#events = [];
      this.#adMedia = {};
      this.player.removeEventListener('play', this.#play);
      this.player.addEventListener('play', this.#play);
      this.player.removeEventListener('waiting', this.#bufferStart);
      this.player.addEventListener('waiting', this.#bufferStart);
      this.player.removeEventListener('playing', this.#playbackStart);
      this.player.addEventListener('playing', this.#playbackStart);
      this.player.removeEventListener('pause', this.#playbackPaused);
      this.player.addEventListener('pause', this.#playbackPaused);
      this.player.removeEventListener('timeupdate', this.#oldCursorPositionHandler);
      this.player.addEventListener('timeupdate', this.#oldCursorPositionHandler);
      this.player.removeEventListener('durationchange', this.#durationHandler);
      this.player.addEventListener('durationchange', this.#durationHandler);
      this.player.removeEventListener('seeking', this.#seekHandler);
      this.player.addEventListener('seeking', this.#seekHandler);
      this.player.removeEventListener('seeked', this.#seek);
      this.player.addEventListener('seeked', this.#seek);
      this.player.removeEventListener('playing', this.#playbackResumed);
      this.player.addEventListener('playing', this.#playbackResumed);
      this.player.removeEventListener('ended', this.#playbackStopped);
      this.player.addEventListener('ended', this.#playbackStopped);

      // ADS
      this.player.ads.removeEventListener("adbegin", this.#setAdProps);
      this.player.ads.addEventListener("adbegin", this.#setAdProps);
      this.player.removeEventListener("playing", this.#adPlay);
      this.player.addEventListener("playing", this.#adPlay);
      this.player.ads.removeEventListener("adend", this.#adPlaybackStopped);
      this.player.ads.addEventListener("adend", this.#adPlaybackStopped);
      this.player.removeEventListener('play', this.#adPlaybackResumed);
      this.player.addEventListener('play', this.#adPlaybackResumed);

    });
  }
  #play = () => {
    this.player.removeEventListener('play', this.#play);
    if (this.#DEBUG) {
      console.log("media.play(" + this.#getCursorPosition() + ");")
    }
    this.#media.play(this.#getCursorPosition());
  }

  #getCursorPosition = (valueInSeconds) => {
    if (!valueInSeconds) {
      return Math.floor(this.player.currentTime * 1000);
    } else {
      return Math.floor(valueInSeconds * 1000);
    }
  }

  #bufferStart = (event) => {
    // player.removeEventListener('waiting', bufferStart);
    if (this.#DEBUG) {
      console.log("media.bufferStart(" + this.#getCursorPosition() + ");")
    }
    this.#media.bufferStart(this.#getCursorPosition());
  }

  #playbackStart = (event) => {
    this.#firstPlayDone = true;
    this.player.removeEventListener('playing', this.#playbackStart);
    if (this.#DEBUG) {
      console.log("media.playbackStart(" + this.#getCursorPosition(event.currentTime) + ");")
    }
    this.#media.playbackStart(event.currentTime);
  }

  #playbackPaused = (event) => {
    if (!this.#ended) {
      if (this.#didAdPlaybackStart) {
        if (this.#DEBUG) {
          console.log("adMedia.playbackPaused(" + this.#getCursorPosition() + ");")
        }
        this.#adMedia.playbackPaused(this.#getCursorPosition());
      } else {
        if (this.#DEBUG) {
          console.log("media.playbackPaused(" + this.#getCursorPosition() + ");")
        }
        this.#media.playbackPaused(this.#getCursorPosition());
      }

    }
  }

  #oldCursorPositionHandler = (event) => {
    if (!this.#seeking && !this.player.ads.playing) {
      this.#oldCursorPosition = this.player.currentTime;
    }
  }

  #durationHandler = (event) => {
    if (!this.player.ads.playing) {
      this.#duration = event.duration * 1000;
    }
  }

  #seekHandler = (event) => {
    this.#seeking = true;
  }

  #seek = (event) => {
    this.#seeking = false;
    if (this.#firstPlayDone) {
      const newCursorPosition = this.player.currentTime;
      if (newCursorPosition == this.#oldCursorPosition) {
        return; // useful to avoid seek(0,0) after a pre-roll
      }
      if (this.#DEBUG) {
        console.log("media.seek(" + this.#getCursorPosition(this.#oldCursorPosition) + "," + this.#getCursorPosition(newCursorPosition) + ");")
      }
      this.#media.seek(this.#getCursorPosition(this.#oldCursorPosition), this.#getCursorPosition(newCursorPosition));
    }
  }

  #playbackResumed = (event) => {
    if (this.#firstPlayDone && !this.#seeking && !this.player.ads.playing) {
      if (this.#DEBUG) {
        console.log("media.playbackResumed(" + this.#getCursorPosition() + ");")
      }
      this.#media.playbackResumed(this.#getCursorPosition());
    }
  }

  #playbackStopped = (event) => {
    if (this.#firstPlayDone) {
      this.#ended = true;
      if (this.#DEBUG) {
        console.log("media.playbackStopped(" + this.#getCursorPosition() + ");")
      }
      this.#media.playbackStopped(this.#getCursorPosition());
    }
  }

  #updateMedia = () => {
    this.#duration = this.#metadata["av_content_duration"] || this.player.duration;
    const properties = {
      av_content_id: this.#metadata["av_content_id"],
      av_content: this.#metadata["av_content"],
      av_content_type: this.#metadata["av_content_type"],
      av_content_duration: this.#duration,
      av_content_genre: this.#metadata["av_content_genre"],
      av_player: "THEOplayer Web SDK",
      av_player_version: window.THEOplayer && window.THEOplayer.version
    };
    if (this.#DEBUG) {
      console.log("calling media.setProps with", properties);
    }
    this.#media.setProps(properties);
  }

  #setAdProps = (event) => {
    this.#isGoogleIma = event.ad.integration && (event.ad.integration == "google-ima");
    this.#adMedia = new this.#tag.avInsights.Media(5,5);
    const ad = event.ad;
    const isPostroll = (this.#oldCursorPosition + 5 > (this.#duration/1000));
    const isPreroll = (this.#oldCursorPosition < 0.5);
    const adType = isPreroll ? ("preroll") : (isPostroll ? "postroll" : "midroll");
    const properties = {
      av_content_id : ad.creativeId,
      av_content : adType+"-"+ ad.creativeId,
      av_content_type : "video",
      av_ad_type : adType,
      av_content_linked : this.#media.getProps()["av_content_id"], // the ID of the main content
      av_content_duration : this.#getCursorPosition(ad.duration)
    };
    if (this.#DEBUG) {
      console.log("calling adMedia.setProps with", properties);
    }
    this.#adMedia.setProps(properties);
  }

  #adPlay = (event) => {
    if (this.player.ads.playing && !this.#didAdPlaybackStart) {
      if (this.#isGoogleIma) {
        this.#media.playbackPaused(this.#getCursorPosition(this.#oldCursorPosition));
        if (this.#DEBUG) {
          console.log("media.playbackPaused("+this.#getCursorPosition(this.#oldCursorPosition)+")");
        }
      }
      if (this.#DEBUG) {
        console.log("adMedia.play("+this.#getCursorPosition()+")");
        console.log("adMedia.playbackStart("+this.#getCursorPosition()+")");
      }
      this.#adMedia.play(this.#getCursorPosition());
      this.#adMedia.playbackStart(this.#getCursorPosition());
    }
    if (this.player.ads.playing) {
      this.#didAdPlaybackStart = true;
    }
  }
  #adPlaybackResumed = (event) => {
    if (this.#didAdPlaybackStart) {
      if (this.#DEBUG) {
        console.log("adMedia.playbackResumed(" + this.#getCursorPosition() + ");")
      }
      this.#adMedia.playbackResumed(this.#getCursorPosition());
    }
  }
  #adPlaybackStopped = (event) => {
    this.#didAdPlaybackStart = false;
    if (this.#DEBUG) {
      console.log("adMedia.playbackStopped("+this.#getCursorPosition(event.ad.duration)+")");
    }
    this.#adMedia.playbackStopped(this.#getCursorPosition(event.ad.duration));
  }

}
window.AVInsights = AVInsights;