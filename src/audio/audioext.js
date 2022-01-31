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
                    src: options._src,
                    loop: options._loop,
                    buffer: options._buffer,
                    resourceState: options._resourceState,
                    //Only the audio extension that uses a HTMLAudioElement will need to preserve the following items.
                    audioCtx: options._audio ? options._audioCtx : null,
                    gainNode: options._audio ? options._gainNode : null,
                    panNode: options._audio ? options._panNode : null,
                    mediaSource: options._audio ? options._mediaSource : null
                }
            }

            //Audio properties.
            this._loop = (options.loop !== undefined ? options.loop : false);
            this._src = options.src;

            //Optional HTMLAudioElement where the soure is NOT loaded dynamically.
            this._audio = options.audio;

            //Optional AudioBuffer used with the dynamically created MediaElementAudioSourceNode (this._mediaSource).
            this._buffer = options.buffer;

            //Collect all of the fallback sources.  Although these sources can be used to load mutliple tracks.
            //According to MDN the source tag is a fallback mechanism if the browser cannot support the first audio type.
            //https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio#%3Caudio%3E_with_multiple_%3Csource%3E_elements
            this._fallbackSourceURLs = [];
            if (this.audio) {
                const sourceElements = this.audio.children;
                if (sourceElements.length > 0) {
                    for (let i = 0; i < sourceElements.length; i++) {
                        this._fallbackSourceURLs.push(sourceElements[i].src);
                    }
                }
            }

            //State management
            this._resourceState = options.resourceState || AUDIO_STATES.UNLOADED;
            this._playingState = AUDIO_STATES.STOPPED;
            this._startTime = 0;

            //Predefined audio nodes and buffers.
            this._mediaSource = options.mediaSource;
            this._audioNodes = [];
            this._audioCtx = options.audioCtx || new AudioContext();
            this._gainNode = options.gainNode || this._audioCtx.createGain();
            this._panNode = options.panNode || new StereoPannerNode(this._audioCtx, { pan: 0 });

            // Listening Delegate, can only be one.
            this._audioListenerDelegate = null;

            if (hamonengine.debug) {
                console.debug(`[hamonengine.audio.audioext.constructor] ResourceState: {${this._resourceState}}`);
                console.debug(`[hamonengine.audio.audioext.constructor] PlayingState: {${this._playingState}}`);
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Get the context.
         */
        get context() {
            return this._audioCtx;
        }
        /**
         * An existing AudioBuffer if the audioext was loaded dynamically via a URL.
         * WARNING: This property can return null if the HTMLAudioElement is in use.
         */
        get buffer() {
            return this._buffer;
        }
        /**
         * An existing HTMLAudioElement if the audioext was constructed with an audio element.
         * WARNING: This property can return null if the AudioBuffer is in use.
         */
         get audio() {
            return this._audio;
        }
        /**
         * Gets the audio extension's src.
         */
        get src() {
            return this._src;
        }
        /**
         * Determines if the audio extension is ready.
         */
        get isLoaded() {
            return this._resourceState === AUDIO_STATES.COMPLETE;
        }
        /**
         * Determines if the audio extension is playing.
         */
        get isPlaying() {
            return this._playingState === AUDIO_STATES.PLAYING;
        }
        /**
         * Determines if the audio extension is stopped.
         */
        get isStopped() {
            return this._playingState === AUDIO_STATES.STOPPED;
        }
        /**
         * Determines if the audio extension is paused.
         */
        get isPaused() {
            return this._playingState === AUDIO_STATES.PAUSED;
        }
        /**
         * Returns a collection of fallback source URLs.
         */
        get fallbackSourceURLs() {
            return this._fallbackSourceURLs;
        }
        /**
         * Returns the duration of the audio extension.
         */
        get duration() {
            return this.audio ? this.audio.duration : ((this.buffer && this.buffer.duration) || 0);
        }
        /**
         * Returns the currentTime.
         */
        get currentTime() {
            return this.audio ? this.audio.currentTime : (this.isPlaying ? (this.context.currentTime - this._startTime) : 0);
        }
        /**
         * Returns true if the audio is allowed to loop.
         */
        get loop() {
            return this._loop;
        }
        /**
         * Assigns the loop value to determine if the audio should be allowed to loop after the audio ends.
         */
        set loop(v) {
            this._loop = v;

            //Set the HTMLAudioElement if valid and playing.
            if (this.audio) {
                this.audio.loop = v;
            }

            //Set the AudioBufferSourceNode if valid and playing.
            if (this._mediaSource) {
                this._mediaSource.loop = v;
            }
        }
        /**
         * Returns true if the audio is allowed muted.
         */
        get muted() {
            return this._gainNode.gain.value === 0;
        }
        /**
         * Assigns the mute value to determine if the audio element is muted.
         */
        set muted(v) {
            if (v) {
                this._preMutedVolume = this.volume;
                this.volume = 0;
            }
            else {
                if (this._preMutedVolume !== undefined) {
                    this.volume = this._preMutedVolume;
                    delete this._preMutedVolume;
                }
            }
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
         * @param {string} src url of the audio extension.
         * @return {Object} a promise to complete loading.
         */
        async load(src = '') {
            //Do nothing if the audio extension is already loaded.
            if (this.isLoaded) {
                return Promise.resolve(this);
            }

            //When dealing with HTMLAudioElement, get the source from the element and invoke the load method.
            if (this.audio) {
                src = src ? src : this.audio.src;
                this.audio.load();
            }
            else {
                src = src ? src : this.src;
            }

            this._resourceState = AUDIO_STATES.LOADING;

            //return new Promise((resolve, reject) => {

                //Common success logic handling.
                const handleSuccess = buffer => {
                    if (this.audio) {
                        //Only assign the MediaElementAudioSourceNode (this._mediaSource) if we are using an HTMLAudioElement.
                        //For HTMLAudioElements, only create this once and attach the nodes once.
                        //Attempting to disconnect or make new MediaElementAudioSourceNode (this._mediaSource) will throw an error as the HTMLAudioElement still exists in the DOM.
                        if (!this._mediaSource) {
                            this._mediaSource = this.context.createMediaElementSource(this.audio);
                            this._mediaSource.connect(this._gainNode).connect(this._panNode).connect(this.context.destination);
                            console.log(this._mediaSource.connect(this._gainNode).connect(this._panNode).connect(this.context.destination));
                        }
                    }
                    else {
                        //Assign the buffer that will be used for the AudioBufferSourceNode.
                        this._buffer = buffer;
                    }

                    //Assign the source url on successful load and completion state.
                    this._src = src;
                    this._resourceState = AUDIO_STATES.COMPLETE;

                    hamonengine.debug && console.debug(`[hamonengine.audio.audioext.load] Audio '${this.src}' has loaded successfully.`);
                    return Promise.resolve(this);
                };

                //Common failure logic handling.
                const handleFailure = error => {
                    this._resourceState = AUDIO_STATES.ERROR;
                    this._buffer = null;
                    const message = (error instanceof String) ? error : (error.statusText || error);
                    const errorMsg = `The audio '${src}' could not be loaded.  Due to '${message}'.`;
                    return Promise.reject(errorMsg);
                }

                //Attach events to the HTMLAudioElement if one exists.
                if (this.audio) {

                    //Handle errors and reject the promise.
                    this.audio.addEventListener('error', error => handleFailure(error), false);
                    this.audio.addEventListener('stalled', error => handleFailure(error), false);

                    //Handle the HTMLAudioElement ending.
                    this.audio.addEventListener('ended', () => this.onAudioEnd(), false);
                    //this.audio.addEventListener('timeupdate', e => this.onAudioTimeUpdate(e), false);

                    //Handle a situation where the DOM has completed the loading the data.
                    if (this.audio.readyState === READY_STATES.HAVE_NOTHING) {
                        this.audio.addEventListener('loadeddata', () => handleSuccess(), false);
                        return Promise.resolve(this);
                    }
                    else {
                        return handleSuccess();
                    }
                }
                //Otherwise the load the media dynamically, where the HTMLAudioElement is no longer used.
                else {
                    try {
                        const { data, status, statusText, event } = await connect.get(src, { responseType: 'arraybuffer' });
                        const buffer = await this.context.decodeAudioData(data);
                        return handleSuccess(buffer);
                    }
                    catch (error) {
                        return handleFailure(error);
                    }
                }
            //});
        }
        /**
         * Starts or resumes playback.
         * @return {Object} a promise that playback has started.
         */
        async play(begin, end) {
            if (!this.isPlaying) {

                this._startTime = this.context.currentTime;

                //Resume if the context has been suspended.
                if (this.context.state === 'suspended') {
                    await this.context.resume();
                }

                //Do not replay the audio if it was paused.
                if (this.isPaused) {
                    this._playingState = AUDIO_STATES.PLAYING;
                    return;
                }

                this._playingState = AUDIO_STATES.PLAYING;

                //For the HTMLAudioElement, simply set the currentTime and begin playing.
                //We cannot control the ending time with an HTMLAudioElement without hooking into the timeupdate event and monitoring the currentTime.
                if (this.audio) {
                    this.audio.currentTime = begin;
                    return this.audio.play();
                }
                //For the dynamically loaded method, we need to recreate the AudioBufferSourceNode.
                else {
                    //Per MDN, we need to recreate our buffer as the resource can only be used once and will be disposed of upon completion.
                    /*
                    https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
                    An AudioBufferSourceNode can only be played once; after each call to start(), you have to create a new node if you want to play the same sound again.
                    Fortunately, these nodes are very inexpensive to create, and the actual AudioBuffers can be reused for multiple plays of the sound.
                    Indeed, you can use these nodes in a "fire and forget" manner: create the node, call start() to begin playing the sound, and don't even bother to hold a reference to it.
                    It will automatically be garbage-collected at an appropriate time, which won't be until sometime after the sound has finished playing.
                    */
                    this._mediaSource = this.context.createBufferSource();
                    this._mediaSource.connect(this._gainNode).connect(this._panNode)
                    this._mediaSource.addEventListener('ended', (e) => this.onAudioEnd(e), false);

                    //Attach any extra nodes.
                    for(let i = 0; i < this._audioNodes.length; i ++) {
                        this._mediaSource.connect(this._audioNodes[i]);
                    }

                    this._mediaSource.connect(this.context.destination);

                    //Normalize the end
                    end = end || this.duration;

                    //Assign the buffer and start playing.
                    this._mediaSource.buffer = this.buffer;

                    //When looping with an AudioBufferSourceNode, the loopStart & loopEnd must be specified.
                    this._mediaSource.loop = this.loop;
                    if (this.loop) {
                        this._mediaSource.loopStart = begin;
                        this._mediaSource.loopEnd = end;
                        this._mediaSource.start(0, begin);
                    }
                    else {
                        this._mediaSource.start(0, begin, end - begin);
                    }

                    return Promise.resolve();
                }
            }
        }
        /**
         * Pauses playback.
         */
        async pause() {
            if (this.isPlaying) {
                this._playingState = AUDIO_STATES.PAUSED;
                return this.context.suspend();
            }
        }
        /**
         * Stops and resets playback.
         * @param {object} options
         * @param {boolean} options.suspend determines if the playback should be suspended.
         * @return {Object} a promise that playback has stopped and has been suspended.
         */
        async stop({ suspend = true } = {}) {
            this._playingState = AUDIO_STATES.STOPPED;

            //For the HTMLAudioElement, simply reset the time to zero and pause playing.
            if (this.audio) {
                this.audio.currentTime = 0;
                await this.audio.pause();
            }
            //Stop the AudioBufferSourceNode and set a special flag to this instance to determine that a user has stopped the playback.
            else {
                if (this._mediaSource) {
                    this._mediaSource.disconnect();
                    this._mediaSource.stop(0);
                    //Attach a temporary property to the AudioBufferSourceNode that indicates this mediasource was STOPPED by the user and not ended.
                    //This is needed as stopping the AudioBufferSourceNode, suspending the context, and then resuming the context will allow the original AudioBufferSourceNode to complete garbage collection and send out an onended event.
                    //An onended message sent to due a stop is problematic, as the audioext & track classes need the onAudioEnd event to fire only when the track has ended.
                    this._mediaSource._userStopped = true;
                    this._mediaSource = null;
                }
            }

            return suspend ? this.context.suspend() : Promise.resolve();
        }
        /**
         * Connects the current audioNode if one is provided.
         * @param {object} audioNode
         */
        connect(audioNode) {
            if (this._mediaSource && this._mediaSource instanceof HTMLAudioElement) {
                this._mediaSource.connect(audioNode)
            }

            this._audioNodes.push(audioNode);
            return audioNode;
        }
        /**
         * Disconnects the current audioNode if one is provided.
         * @param {object} audioNode
         */
        disconnect(audioNode) {
            if (this._mediaSource && this._mediaSource instanceof HTMLAudioElement) {
                this._mediaSource.disconnect(audioNode);
            }

            this._audioNodes = this._audioNodes.filter(node => node !== audioNode);
            return audioNode;
        }
        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        /**
         * An event that is triggered when the audio extension ends not when stop is invoked.
         * Any assigned delegates will be invoked as well.
         */
        onAudioEnd(e) {
            //Determine if the user has stopped the AudioBufferSourceNode rather than the source simply ending.
            const userStopped = (e && e.currentTarget && e.currentTarget._userStopped) || false;
            if (this._playingState === AUDIO_STATES.PLAYING && !userStopped && !this.loop) {
                this._playingState = AUDIO_STATES.STOPPED;
                this.audioListenerDelegate && this.audioListenerDelegate.onAudioEnd && this.audioListenerDelegate.onAudioEnd();
            }
        }
        /**
         * An event that is triggered when the time update event occurs.
         */
        //Deprecated as the AudioBufferSourceNode does not provide a timeupdate event.
        /*
        onAudioTimeUpdate(e) {
            if (this.audioListenerDelegate) {
                this.audioListenerDelegate.onAudioTimeUpdate && this.audioListenerDelegate.onAudioTimeUpdate(e);
                e.preventDefault();
            }
        }
        */
    }
})();