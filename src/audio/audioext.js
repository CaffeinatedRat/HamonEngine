/**
* Copyright (c) 2020-2022, CaffeinatedRat.
* All rights reserved.
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*
* THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY
* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE AUTHOR AND CONTRIBUTORS BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

//波紋
'use strict';

hamonengine.audio = hamonengine.audio || {};

(function () {

    const AUDIO_STATES = {
        UNLOADED: 0,
        LOADING: 1,
        COMPLETE: 2,
        ERROR: 3,
        PLAYING: 4,
        STOPPED: 5,
        PAUSED: 6
    };

    const READY_STATES = {
        HAVE_NOTHING: 0,
        HAVE_METADATA: 1,
        HAVE_CURRENT_DATA: 2,
        HAVE_FUTURE_DATA: 3,
        HAVE_ENOUGH_DATA: 4
    }

    /**
     * This class represents an audio extension wrapper that provides helper methods for handling audio manipulation.
     */
    hamonengine.audio.audioext = class {
        constructor(options = {}) {
            //Handle copy-constructor operations.
            if (options instanceof hamonengine.audio.audioext) {
                options = {
                    audio: options._audio,
                    url: options._url,
                    eventBound: options._eventsBound,
                    resourceState: options._resourceState,
                    audioCtx: options._audioCtx,
                    gainNode: options._gainNode,
                    panNode: options._panNode,
                    mediaSource: options._mediaSource
                }
            }

            //Audio properties.
            this._audio = options.audio || new Audio();
            this._url = options.url || '';

            //Collect all of the fallback sources.  Although these sources can be used to load mutliple tracks.
            //According to MDN the source tag is a fallback mechanism if the browser cannot support the first audio type.
            //https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio#%3Caudio%3E_with_multiple_%3Csource%3E_elements
            this._fallbackSourceURLs = [];
            const sourceElements = this._audio.children;
            if (sourceElements.length > 0) {
                for (let i = 0; i < sourceElements.length; i++) {
                    this._fallbackSourceURLs.push(sourceElements[i].src);
                }
            }

            this._resourceState = options.resourceState || AUDIO_STATES.UNLOADED;
            this._playingState = AUDIO_STATES.STOPPED;

            this._mediaSource = options.mediaSource || null;
            this._audioCtx = options.audioCtx || new AudioContext();
            this._gainNode = options.gainNode || this._audioCtx.createGain();
            this._panNode = options.panNode || new StereoPannerNode(this._audioCtx, { pan: 0 });

            // Listening Delegate, can only be one.
            this._audioListenerDelegate = null;

            //Make sure events are only bound once.
            this._eventsBound = options.eventBound !== undefined ? options.eventBound : false;

            console.debug(`[hamonengine.audio.audioext.constructor] ResourceState: {${this._resourceState}}`);
            console.debug(`[hamonengine.audio.audioext.constructor] PlayingState: {${this._playingState}}`);
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the internal audio data of the type Audio.
         */
         get audio() {
            return this._audio;
        }
        /**
         * Get the context.
         */
         get context() {
            return this._audioCtx;
        }
        /**
         * Gets the audio's current src.
         */
        get src() {
            return this.audio.currentSrc;
        }
        /**
         * Determines if the audio is ready.
         */
        get isLoaded() {
            return this._resourceState === AUDIO_STATES.COMPLETE;
        }
        /**
         * Determines if the track is playing.
         */
        get isPlaying() {
            return this._playingState === AUDIO_STATES.PLAYING;
        }
        /**
         * Determines if the track is stopped.
         */
        get isStopped() {
            return this._playingState === AUDIO_STATES.STOPPED;
        }
        /**
         * Returns a collection of fallback source URLs.
         */
        get fallbackSourceURLs() {
            return this._fallbackSourceURLs;
        }
        /**
         * Returns true if the track is allowed to autoplay.
         */
        get autoplay() {
            return this.audio.autoplay;
        }
        /**
         * Assigns the autoplay value to determine if the audio element should be allowed to automatically play when the media is ready.
         */
        set autoplay(v) {
            this.audio.autoplay = v;
        }
        /**
         * Returns true if the track is allowed to loop.
         */
        get loop() {
            return this.audio.loop;
        }
        /**
         * Assigns the loop value to determine if the audio element should be allowed to loop after the track ends.
         */
        set loop(v) {
            this.audio.loop = v;
        }
        /**
         * Returns true if the track is allowed muted.
         */
        get muted() {
            return this.audio.muted;
        }
        /**
         * Assigns the mute value to determine if the audio element is muted.
         */
        set muted(v) {
            this.audio.muted = v;
        }
        /**
         * Returns the volume value of the audio element between 0.0-1.0
         */
        get volume() {
            return this._gainNode.gain.value;
        }
        /**
         * Assigns the volume value between 0.0-1.0.
         */
        set volume(v) {
            this._gainNode.gain.value = v > 1.0 ? 1.0 : v;
        }
        /**
         * Returns the audioListenerDelegate.
         * Only one delegate/listener can be assigned at a time.
         * This prevents concurrency issues from multiple entities from manipulating the audio extension object.
         */
        get audioListenerDelegate() {
            return this._audioListenerDelegate;
        }
        /**
         * Assigns the audioListenerDelegate.
         * Only one delegate/listener can be assigned at a time.
         * This prevents concurrency issues from multiple entities from manipulating the audio extension object.
         */
        set audioListenerDelegate(v) {
            this._audioListenerDelegate = v;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the audio extension object.
         */
        clone() {
            return new hamonengine.audio.audioext(this);
        }
        /**
         * Attempts to load the audio extension.
         * @param {string} src url of the track.
         * @return {Object} a promise to complete loading.
         */
        async load(src = '') {

            //Normalize the source if the argument is not passed.
            src = src || this._url;

            //Do nothing if the audio extension is already loaded and the source hasn't changed.
            if (this.isLoaded && src === this.audio.src) {
                return Promise.resolve(this);
            }

            //Handle statically loaded audio; those the DOM may have already loaded.
            if (src !== '') {
                this.audio.src = src;
                this.audio.load();
            }

            this._resourceState = AUDIO_STATES.LOADING;

            //Common success logic handling.
            const handleSuccess = () => {
                this._resourceState = AUDIO_STATES.COMPLETE;
                if (!this._mediaSource) {
                    this._mediaSource = this.context.createMediaElementSource(this._audio);
                    this._mediaSource.connect(this._gainNode).connect(this._panNode).connect(this.context.destination);
                }
                console.debug(`[hamonengine.audio.audioext.load] Audio '${this.src}' has loaded successfully.`);
                return Promise.resolve(this);
            };

            //Common failure logic handling.
            const handleFailure = (error) => {
                this._resourceState = AUDIO_STATES.ERROR;
                const audioPath = error && error.path && error.path.length > 0 && error.path[0].src || '';
                const errorMsg = `The audio '${audioPath}' could not be loaded.`;
                return Promise.reject(errorMsg);
            }

            //Bind events only once.
            if (!this._eventsBound) {
                this._eventsBound = true;

                //Handle errors and reject the promise.
                this.audio.addEventListener('error', error => handleFailure(error), false);
                this.audio.addEventListener('stalled', error => handleFailure(error), false);

                //Handle the track ending.
                this.audio.addEventListener('ended', () => this.onAudioEnd(), false);

                //Handle the completed metadata loading event.
                //this.audio.addEventListener('loadedmetadata', () => {}, false);

                this.audio.addEventListener('timeupdate', e => this.onAudioTimeUpdate(e), false);

                //Handle a situation where the DOM has completed the loading the data.
                if (this.audio.readyState === READY_STATES.HAVE_NOTHING) {
                    this.audio.addEventListener('loadeddata', () => handleSuccess(), false);
                }
                else {
                    handleSuccess();
                }
            }
        }
        /**
         * Starts or resumes playback.
         * @return {Object} a promise that playback has started.
         */
        async play() {
            if (!this.isPlaying) {
                
                if (this.context.state === 'suspended') {
                    await this.context.resume();
                }

                this._playingState = AUDIO_STATES.PLAYING;
                //this.audio.currentTime = startTime;
                return this.audio.play();
            }
        }
        /**
         * Pauses playback.
         */
        pause() {
            this.audio.pause();
            this._playingState = AUDIO_STATES.PAUSED;
        }
        /**
         * Stops and resets playback.
         * @param {object} options
         * @param {boolean} options.suspend determines if the playback should be suspended.
         * @return {Object} a promise that playback has stopped and has been suspended.
         */
        async stop({ suspend = true } = {}) {
            this.audio.pause();
            this._playingState = AUDIO_STATES.STOPPED;
            
            if (suspend) {
                return this.context.suspend();
            }
        }
        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        /**
         * An event that is triggered when the audio track ends not when stop is invoked.
         * Any assigned delegates will be invoked as well.
         */
        onAudioEnd() {
            this._playingState = AUDIO_STATES.STOPPED;
            this.audioListenerDelegate && this.audioListenerDelegate.onAudioEnd && this.audioListenerDelegate.onAudioEnd();
        }
        /**
         * An event that is triggered when the time update event occurs.
         */
        onAudioTimeUpdate(e) {
            if (this.audioListenerDelegate) {
                this.audioListenerDelegate.onAudioTimeUpdate && this.audioListenerDelegate.onAudioTimeUpdate(e);
                e.preventDefault();
            }
        }
    }
})();