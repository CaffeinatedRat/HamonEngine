/**
* Copyright \(c\) 2020-2023, CaffeinatedRat.
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

hamonengine.events = hamonengine.events || {};

(function () {
    /**
     * This class represents a frame within the storyboard.
     */
    hamonengine.events.frame = class extends hamonengine.math.datastructures.tree {
        constructor(options = {}) {
            super(options);

            this._name = options.name || '';
            this._frameState = FRAME_STATE.STOPPED;
            this._loadingState = FRAME_STATE.STOPPED;
            this._startFrameTime = 0;

            if (hamonengine.debug) {
                console.debug(`[hamonengine.events.frame.constructor] Name: ${this._name}`);
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the name of the frame.
         */
        get name() {
            return this._name;
        }
        /**
         * Sets the name of the frame.
         */
        set name(v) {
            this._name = v;
        }
        /**
         * Returns the state of the frame.
         */
        get frameState() {
            return this._frameState;
        }
        /**
         * Sets the state of the frame.
         */
        set frameState(v) {
            this._frameState = v;
        }
        /**
         * Returns the total time since the frame was started with respect to the engine.
         */
        get startFrameTime() {
            return this._startFrameTime;
        }
        /**
         * Returns true if the frame is loaded.
         */
        get isLoaded() {
            return this._loadingState === FRAME_STATE.LOADED;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the frame.
         */
        clone() {
            return new hamonengine.events.frame(this);
        }
        /**
         * Starts the current frame with the current total time with respect to the engine.
         * @returns {object} an instance of this frame, allowing chaining.
         */
        start() {
            if (this.frameState === FRAME_STATE.STOPPED) {
                this.frameState = FRAME_STATE.STARTING;
            }
        }
        /**
         * Stops the current frame.
         * @param {boolean} cancel the frame abruptly.
         * @param {string} reason the reason the frame was cancelled.
         * @returns {object} an instance of this frame, allowing chaining.
         */
        stop(cancel=false) {
            if (this.frameState !== FRAME_STATE.STOPPED) {
                //Determine if the frame is stopping or has to stop immediately.
                this.frameState = cancel ? FRAME_STATE.STOPPED : FRAME_STATE.STOPPING;
            }
        }
        /**
         * Pauses execution of the current frame.
         * @returns {object} an instance of this frame, allowing chaining.
         */
        pause() {
            if (this.frameState === FRAME_STATE.RUNNING) {
                this.frameState = FRAME_STATE.PAUSED;
            }
        }
        /**
         * Preloads any resource loading.
         * @param {boolean} loadDescendantFrames determines if the child frames should load resources at the same time.
         * @param {object} storyboard calling the load operation.
         * @return {object} a promise to complete resource loading.
         */
        async load(loadDescendantFrames, storyboard) {
            this._loadingState = FRAME_STATE.LOADING;
            const nodePromises = [];
            const parentNodePromise = this.onloadResources(storyboard);
            if ((parentNodePromise instanceof Promise)) {
                nodePromises.push(parentNodePromise);

                if (loadDescendantFrames) {
                    //Traverse all nodes and invoke the onloadResources method on all descendants waiting for this event.
                    let node = this.first;
                    while (node !== null) {
                        const nodePromise = node.load(loadDescendantFrames, storyboard);
                        if ((nodePromise instanceof Promise)) {
                            nodePromises.push(nodePromise);
                        }

                        node = node.next;
                    }
                }

                await Promise.all(nodePromises);
                this._loadingState = FRAME_STATE.LOADED;
            }
        }
        /**
         * Internal logic for clearing nodes.
         * Override this method so that we can invoke onRelease.
         * @private
         */
        __internalClear(clearAll) {
            super.__internalClear(clearAll);
            clearAll && this.onRelease();
        }
        /**
         * Returns an ancestor frame by the name.
         * If the node is not found then null is returned.
         * @param {string} name of the frame to search for.
         */
        findAncestorByName(name) {
            return hamonengine.events.frame.searchAncestorByPredicate(this.parent, node => node !== null && node.name.toLowerCase() !== name.toLowerCase());
        }
        /**
         * Returns a child frame by the name.
         * If the node is not found then null is returned.
         * @param {string} name of the frame to search for.
         * @returns the matching node found by name.
         */
        findChildByName(name) {
            return hamonengine.events.frame.searchByPredicate(this.first, node => node !== null && node.name.toLowerCase() !== name.toLowerCase());
        }
        /**
         * Handles the rendering and states of a frame.
         * @param {number} elapsedTimeInMilliseconds since the last frame.
         * @param {object} storyboard used to invoke this onFrame event.
         * @param {number} totalTimeInMilliseconds is the total time that has elapsed since the engine has started.
         */
        render(elapsedTimeInMilliseconds, storyboard, totalTimeInMilliseconds) {
            switch(this.frameState) {
                case FRAME_STATE.STARTING:
                    if (this._startFrameTime === 0) {
                        this._startFrameTime = totalTimeInMilliseconds;
                    }
                    this.onFrameStarting(elapsedTimeInMilliseconds, storyboard, totalTimeInMilliseconds);
                    break;

                case FRAME_STATE.RUNNING:
                    this.onFrame(elapsedTimeInMilliseconds, storyboard, totalTimeInMilliseconds);
                    break;

                case FRAME_STATE.STOPPING:
                    this.onFrameStopping(elapsedTimeInMilliseconds, storyboard, totalTimeInMilliseconds);
                    break;

                //NOTE: The Stopped/Cancelled event will not occur here since the Storyboard has stopped rendering the frame.
            }
        }
        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        /**
         * An event that occurs when attempting to load resources.
         * @param {object} storyboard calling the load operation.
         * @return {Object} a promise that the resource has loaded successfully.
         */
        async onloadResources(storyboard) {
        }
        /**
         * An onFrameStarting event that is triggered when frame is starting.
         * @param {number} elapsedTimeInMilliseconds since the last frame.
         * @param {object} storyboard used to invoke this onFrame event.
         * @param {number} totalTimeInMilliseconds is the total time that has elapsed since the engine has started.
         */
        onFrameStarting(elapsedTimeInMilliseconds, storyboard, totalTimeInMilliseconds) {
            //Unless overridden skip the starting frame.
            this.frameState = FRAME_STATE.RUNNING;
        }
        /**
         * An onFrame event that is triggered when this item is active.
         * @param {number} elapsedTimeInMilliseconds since the last frame.
         * @param {object} storyboard used to invoke this onFrame event.
         * @param {number} totalTimeInMilliseconds is the total time that has elapsed since the engine has started.
         */
        onFrame(elapsedTimeInMilliseconds, storyboard, totalTimeInMilliseconds) {
        }
        /**
         * An onFrameStopping event that is triggered when frame is stop.
         * @param {number} elapsedTimeInMilliseconds since the last frame.
         * @param {object} storyboard used to invoke this onFrame event.
         * @param {number} totalTimeInMilliseconds is the total time that has elapsed since the engine has started.
         */
        onFrameStopping(elapsedTimeInMilliseconds, storyboard, totalTimeInMilliseconds) {
            //Unless overridden skip the stopping frame.
            this.frameState = FRAME_STATE.STOPPED;
        }
        /**
         * Processes the current frame in the storyboard on an onProcessingFrame event.
         * @param {number} elapsedTimeInMilliseconds since the last frame.
         * @param {object} storyboard used to invoke this onFrame event.
         * @param {number} totalTimeInMilliseconds is the total time that has elapsed since the engine has started.
         */
        onProcessingFrame(elapsedTimeInMilliseconds, storyboard, totalTimeInMilliseconds) {
        }
        /**
         * An onRelease event that is triggered when a frame needs to release resources.
         */
        onRelease() {
        }
        /**
         * Processes keyboard events.
         * @param {object} storyboard used to invoke this onKeyEvent event.
         * @param {string} type of keyboard event such as 'up' or 'down' for keyup and keydown.
         * @param {string} keyCode of the key (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
         * @param {object} e KeyboardEvent (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a layer (canvas).
         */
        onKeyEvent(storyboard, type, keyCode, e, caller) {
        }
        /**
         * Processes mouse events.
         * @param {object} storyboard used to invoke this onMouseEvent event.
         * @param {string} type of mouse event such as: 'click', 'up', 'down', 'move', 'enter', 'leave'.
         * @param {object} v an instance of vector2 object that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a layer (canvas).
         */
        onMouseEvent(storyboard, type, v, e, caller) {
        }
        /**
         * Processes touch events.
         * @param {object} storyboard used to invoke this onTouchEvent event.
         * @param {string} type of touch event such as: 'start', 'move', 'end', 'cancel', 'click'.
         * @param {Array} touches an array of vector2 objects that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e TouchEvent (https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a layer (canvas).
         */
        onTouchEvent(storyboard, type, touches, e, caller) {
        }
    }
})();