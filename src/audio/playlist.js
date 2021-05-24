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

    /**
     * This class represents an audio playlist (multitrack) object.
     */
    hamonengine.audio.playlist = class {
        constructor(options = {}) {
            //Handle copy-constructor operations.
            if (options instanceof hamonengine.audio.playlist) {
                options = {
                    //Make sure to copy the frames otherwise the old references will linger.
                    tracks: options._tracks.map(track => track.clone()),
                    index: options._index,
                    loop: options._loop,
                    autoplay: options._autoplay
                };
            }

            //Audio properties.
            this._name = options.name;
            this._tracks = options.tracks || [];
            this._index = options.index || 0;
            this._loop = options.loop || 0;
            this._autoplay = (options.autoplay !== undefined) ? options.autoplay : false;
            this._autoplayFilters = options.autoplayFilters || [];
            this._volume = 1.0;

            console.debug(`[hamonengine.audio.playlist.constructor] Name: ${this._name}`);
            console.debug(`[hamonengine.audio.playlist.constructor] Track Index: ${this._index}`);
            console.debug(`[hamonengine.audio.playlist.constructor] Loop: ${(this._loop ? 'true' : 'false')}`);
            console.debug(`[hamonengine.audio.playlist.constructor] Autoplay: ${(this._autoplay ? 'true' : 'false')}`);
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the playlist's name.
         */
        get name() {
            return this._name;
        }
        /**
         * Sets the audio playlist's name.
         */
        set name(v) {
            this._name = v;
        }
        /**
         * Returns the current track index.
         */
        get index() {
            return this._index;
        }
        /**
         * Assigns the current track index.
         */
        set index(v) {
            const index = (v % this._tracks.length);
            this._index = index < 0 ? this._tracks.length + index : index;
        }
        /**
         * Returns the current track.
         */
        get currentTrack() {
            return this._tracks[this.index];
        }
        /**
         * Returns true if the playlist is allowed to loop.
         */
        get loop() {
            return this._loop;
        }
        /**
         * Assigns the loop value to determine if the playlist should loop.
         */
        set loop(v) {
            this._loop = v;
        }
        /**
         * Returns the autoplay value where the entire playlist is played in its entirety.
         */
        get autoplay() {
            return this._autoplay;
        }
        /**
         * Assigns the autoplay value where the entire playlist is played in its entirety.
         */
        set autoplay(v) {
            this._autoplay = v;
        }
        /**
         * Returns the volume value of the audio element between 0.0-1.0
         */
         get volume() {
            return this._volume;
        }
        /**
         * Assigns the volume value between 0.0-1.0.
         */
        set volume(v) {
            this._volume = v;
        }        
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the playlist.
         */
        clone() {
            return new hamonengine.audio.playlist(this);
        }
        /**
         * Starts or resumes playlist playback.
         */
        play() {
            if (!this.currentTrack.isPlaying) {
                this.currentTrack.play();
                this.currentTrack.volume = this.volume;
            }
        }
        /**
         * Pauses playlist playback.
         */
         pause() {
            this.currentTrack.pause();
        }
        /**
         * Stops and resets playlist playback.
         */
        stop() {
            this.currentTrack.stop();
            this.index = 0;
        }
        /**
         * Advances to the next track.
         */
        next() {
            if (this.currentTrack.isPlaying) {
                this.currentTrack.stop();
                this.index++;
                this.currentTrack.play();
            }
            else {
                this.index++;
            }
        }
        /**
         * Recedes to the previous track.
         */
        prev() {
            if (this.currentTrack.isPlaying) {
                this.currentTrack.stop();
                this.index--;
                this.currentTrack.play();
            }
            else {
                this.index--;
            }
        }
        /**
         * Adds a new track.
         * @param {Object} track to add.
         */
        addTrack(track) {
            //Register the playlist as a listener to wait for events.
            track.register(this);
            this._tracks.push(track);
        }
        /**
         * Creates an autoplay fade filter where the track will fade before playing the next track.
         * NOTE: These filters only work when autoplay is enabled.
         * @param {number} fadeOutStart the percentage of the track's duration where fade out will start at the end of the track.  This is 1% by default.
         * @param {number} rateOfFade the rate at which the track will fade in milliseconds.  This field can be used to create a hard fast fadeout before the track ends.  The default is 0, where the rate will be calculated based on the reamining time & currenct volume.
         */
        static createAutoPlayFadeFilter({fadeOutStart = 0.01, rateOfFade = 0}={}) {
            return ({elapsedTime, remainingTime, currentTrack, nextTrack, playList }) => {
                const fadeOutStartInterval = (currentTrack.duration * fadeOutStart);

                if (remainingTime < fadeOutStartInterval) {

                    //Reduce the volume by the specified rate or the rate determined by the current volume and amount of time remaining.
                    const volume = rateOfFade > 0 ? (currentTrack.volume - rateOfFade) : (remainingTime / (currentTrack.volume * fadeOutStartInterval));

                    if (volume > 0) {
                        currentTrack.volume = volume;
                    }
                    else {
                        //When the volume has reached zero, stop the current track, advanced the playlist and play the next track.
                        currentTrack.stop({suspend: false});
                        playList.next();
                        playList.play();
                    }
                }
            }
        }
        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        /**
         * An event that is triggered when the track begins.
         */
        onTrackBegin({ track }) {
        }
        /**
         * An event that is triggered when the track ends.
         */
        onTrackEnd({ track }) {
            //Continue to the next track if autoplay is enabled.
            if (this.autoplay && track === this.currentTrack) {
                //If looping advanced to the next track to the beginning of the playlist.
                if (this.loop || this.index < this._tracks.length - 1) {
                    this.next();
                    this.play();
                }
                else {
                    this.index = 0;
                }
            }
        }
        /**
         * An event that is triggered on a track update.
         */
        onTrackUpdate({ track, elapsedTime, remainingTime }) {
            const nextTrack = this._tracks[(this.index + 1 % this._tracks.length)];
            for (let i = 0; i < this._autoplayFilters.length; i++) {
                this._autoplayFilters[i]({elapsedTime, remainingTime, currentTrack: track, nextTrack, playList: this });
            }
        }
    }
})();