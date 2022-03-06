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

    /**
     * This class represents an audio track object.
     */
    hamonengine.audio.track = class {
        constructor(options = {}) {
            //Handle copy-constructor operations.
            if (options instanceof hamonengine.audio.track) {
                options = {
                    name: options._name,
                    audioext: options._audioext.clone(),
                    src: options._src,
                    trackBegin: options._trackBegin,
                    trackEnd: options._trackEnd
                }
            }

            //Audio properties.
            this._name = options.name;
            this._audioext = options.audioext || new hamonengine.audio.audioext({
                audio: options.audio,
                src: options.src
            });

            //Contains the position of the track if contained in one file.
            this._trackBegin = options.trackBegin || 0;
            this._trackEnd = options.trackEnd;

            this._listenerPool = new listenerPool();

            if (hamonengine.debug) {
                console.debug(`[hamonengine.audio.track.constructor] Name: ${this._name}`);
                console.debug(`[hamonengine.audio.track.constructor] Track Begin: ${this._trackBegin}`);
                console.debug(`[hamonengine.audio.track.constructor] Track End: {${this._trackEnd}}`);
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the audio's current src.
         */
        get src() {
            return this._audioext.src;
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
            return this._audioext.context;
        }
        /**
         * Determines if the audio is ready.
         */
        get isLoaded() {
            return this._audioext.isLoaded;
        }
        /**
         * Determines if the track is playing.
         */
        get isPlaying() {
            return this._audioext.isPlaying;
        }
        /**
         * Returns the internal audio data of the type Audio.
         */
        //get audio() {
        //    return this._audioext.audio;
        //}
        /**
         * Returns the duration of the track.
         */
        get duration() {
            return (this._trackEnd || this._audioext.duration) - this._trackBegin;
        }
        /**
         * Returns a collection of fallback source URLs.
         */
        get fallbackSourceURLs() {
            return this._audioext.fallbackSourceURLs;
        }
        /**
         * Returns true if the track is allowed to autoplay.
         */
        get autoplay() {
            return this._audioext.autoplay;
        }
        /**
         * Assigns the autoplay value to determine if the audio element should be allowed to automatically play when the media is ready.
         */
        set autoplay(v) {
            this._audioext.autoplay = v;
        }
        /**
         * Returns true if the track is allowed to loop.
         */
        get loop() {
            return this._audioext.loop;
        }
        /**
         * Assigns the loop value to determine if the audio element should be allowed to loop after the track ends.
         */
        set loop(v) {
            this._audioext.loop = v;
        }
        /**
         * Returns true if the track is allowed muted.
         */
        get muted() {
            return this._audioext.muted;
        }
        /**
         * Assigns the mute value to determine if the audio element is muted.
         */
        set muted(v) {
            this._audioext.muted = v;
        }
        /**
         * Returns the volume value of the audio element between 0.0-1.0
         */
        get volume() {
            return this._audioext.volume;
        }
        /**
         * Assigns the volume value between 0.0-1.0.
         */
        set volume(v) {
            this._audioext.volume = v;
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
         * Registers a listener that will receive specific events.
         * @param {*} listener 
         */
        register(listener) {
            this._listenerPool.register(listener);
        }
        /**
         * Attempts to load the track.
         * @param {string} src url of the track.
         * @return {Object} a promise to complete loading.
         */
        async load(src = '') {
            return this._audioext.load(src);
        }
        /**
         * Starts or resumes playback.
         * @return {Object} a promise that playback has started.
         */
        async play() {
            this._audioext.audioListenerDelegate = this;
            return this._audioext.play(this._trackBegin, this._trackEnd);
        }
        /**
         * Pauses playback.
         */
        pause() {
            return this._audioext.pause();
        }
        /**
         * Stops and resets playback.
         * @param {object} options
         * @param {boolean} options.suspend determines if the playback should be suspended.
         * @return {Object} a promise that playback has stopped and has been suspended.
         */
        async stop({ suspend = true } = {}) {
            return this._audioext.stop({ suspend });
        }
        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        /**
         * An event that is triggered when the track begins.
         */
        onTrackBegin() {
            this._listenerPool.invoke('onTrackBegin', { track: this });
        }
        /**
         * An event that is triggered when the track ends not when stop is invoked.
         */
        onAudioEnd() {
            if (this.loop) {
                this.play();
            }
            else {
                this._listenerPool.invoke('onTrackEnd', { track: this });
            }
        }
        /**
         * An event that is triggered on a track update.
         */
        //Deprecated as the AudioBufferSourceNode does not provide a timeupdate event.
        /*
        onAudioTimeUpdate(e) {
            const trackEnd = this._trackEnd || this._audioext.duration;
            const remainingTime = trackEnd - this._audioext.currentTime;

            //End the track if the currentTime has exceeded the track's end time.
            if (remainingTime < 0) {
                this.stop({ suspend: false });
                e.preventDefault();
            }
            else {
                const elapsedTime = this._audioext.currentTime - this._trackBegin;
                this._listenerPool.invoke('onTrackUpdate', { track: this, elapsedTime, remainingTime });
            }
        }*/
    }
})();