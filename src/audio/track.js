/**
* Copyright (c) 2020-2021, CaffeinatedRat.
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
        ERROR: 3
    };

    const READY_STATES = {
        HAVE_NOTHING: 0,
        HAVE_METADATA: 1,
        HAVE_CURRENT_DATA: 2,
        HAVE_FUTURE_DATA: 3,
        HAVE_ENOUGH_DATA: 4
    }

    /**
     * This class represents an audio track object.
     */
    hamonengine.audio.track = class {
        constructor(options = {}) {
            //Handle copy-constructor operations.
            if (options instanceof hamonengine.audio.track) {
                options = {
                    audio: options._audio && options._audio.clone()
                }
            }

            //Audio properties.
            this._name = options.name;
            this._audio = options.audio || new Audio();

            //Contains the position of the track if contained in one file.
            this._trackBegin = options.trackBegin || 0;
            this._trackEnd = options.trackEnd;

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

            //Create the audiocontext and connect it to the audio element.
            this._state = AUDIO_STATES.UNLOADED;

            this._audioCtx = new AudioContext();
            this._gainNode = this._audioCtx.createGain();
            this._panNode = new StereoPannerNode(this._audioCtx, { pan: 0 });

            this._mediaSource = this._audioCtx.createMediaElementSource(this._audio);
            this._mediaSource.connect(this._gainNode).connect(this._panNode);

            hamonengine.util.logger.debug(`[hamonengine.audio.track.constructor] Name: ${this._name}`);
            hamonengine.util.logger.debug(`[hamonengine.audio.track.constructor] Track Begin: ${this._trackBegin}`);
            hamonengine.util.logger.debug(`[hamonengine.audio.track.constructor] Track End: {${this._trackEnd}}`);
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the audio's current src.
         */
        get src() {
            return this._audio.currentSrc;
        }
        /**
         * Gets the audio element's name.
         */
        get name() {
            return this._name;
        }
        /**
         * Sets the audio element's name.
         */
        set name(v) {
            this._name = v;
        }
        /**
         * Get the context.
         */
        get context() {
            return this._audioCtx;
        }
        /**
         * Determines if the audio is ready.
         */
        get isLoaded() {
            return this._state === AUDIO_STATES.COMPLETE;
        }
        /**
         * Returns the internal audio data of the type Audio.
         */
        get audio() {
            return this._audio;
        }
        /**
         * Returns the duration of the track.
         */
        get duration() {
            return (this._trackEnd || 0) - this._trackBegin;
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
            return this._audio.autoplay;
        }
        /**
         * Assigns the autoplay value to determine if the audio element should be allowed to automatically play when the media is ready.
         */
        set autoplay(v) {
            this._audio.autoplay = v;
        }
        /**
         * Returns true if the track is allowed to loop.
         */
        get loop() {
            return this._audio.loop;
        }
        /**
         * Assigns the loop value to determine if the audio element should be allowed to loop after the track ends.
         */
        set loop(v) {
            this._audio.loop = v;
        }
        /**
         * Returns true if the track is allowed muted.
         */
        get muted() {
            return this._audio.muted;
        }
        /**
         * Assigns the mute value to determine if the audio element is muted.
         */
        set muted(v) {
            this._audio.muted = v;
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
            this._gainNode.gain.value = v;
        }

        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the sprite.
         */
        clone() {
            return new hamonengine.audio.track(this);
        }
        /**
         * Attempts to load the track.
         * @param {string} src url of the track.
         * @return {Object} a promise to complete loading.
         */
        async load(src = '') {

            //Handle statically loaded audio; those the DOM may have already loaded.
            if (src !== '') {
                this.audio.src = src;
                this.audio.load();
            }

            this._state = AUDIO_STATES.LOADING;
            return new Promise((resolve, reject) => {
                if (this.audio.readyState === READY_STATES.HAVE_NOTHING) {
                    //Handle a successful loading event and resolve the promise.
                    this.audio.addEventListener('loadeddata', () => {

                        this._state = AUDIO_STATES.COMPLETE;
                        this._mediaSource.connect(this._audioCtx.destination);
                        //Set the initial track position.
                        this.audio.currentTime = this._trackBegin;

                        //Find the end of the track if one doesn't exist.
                        if (!this._trackEnd) {
                            this._trackEnd = this.audio.duration;
                        }

                        hamonengine.util.logger.debug(`[hamonengine.audio.track.load] Audio '${src}' has loaded successfully.`);
                        resolve();
                    }, false);

                    //Handle errors and reject the promise.
                    this.audio.addEventListener('error', (error) => {
                        this._state = AUDIO_STATES.ERROR;
                        const audioPath = error && error.path && error.path.length > 0 && error.path[0].src || '';
                        const errorMsg = `The audio '${audioPath}' could not be loaded.`;
                        reject(errorMsg);
                    }, false);

                    //Handle the timeupdate if our track end position is less than the duration.
                    if (this._trackEnd !== this.audio.duration) {
                        this.audio.addEventListener('timeupdate', (e) => {
                            if (this.audio.currentTime >= this._trackEnd) {
                                this.stop();
                                e.preventDefault();
                            }
                        }, false);
                    }
                }
                else {
                    this._state = AUDIO_STATES.COMPLETE;
                    this._mediaSource.connect(this._audioCtx.destination);
                    //Set the initial track position.
                    this.audio.currentTime = this._trackBegin;

                    resolve();
                }
            });
        }
        /**
         * Starts or resumes playback.
         */
        play() {
            if (this._audioCtx.state === 'suspended') {
                this._audioCtx.resume();
            }
            return this.audio.play();
        }
        /**
         * Pauses playback.
         */
        pause() {
            this.audio.pause();
        }
        /**
         * Stops and resets playback.
         */
        stop() {
            this.audio.pause();
            this.audio.currentTime = this._trackBegin;
        }
    }
})();