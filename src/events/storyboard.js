/**
* Copyright \(c\) 2020-2024, CaffeinatedRat.
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
     * This class represents a storyboard object, which is a specialized root frame class.
     */
    hamonengine.events.storyboard = class extends hamonengine.events.frame {
        constructor(options = {}) {
            super(options);

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.events.storyboard) {
                options = {
                    engine: options._engine,
                    currentFrames: options._currentFrames,
                    loop: options._loop,
                    preloadAllFrames: options._preloadAllFrames,
                    allowFramesToComplete: options._allowFramesToComplete
                };
            }

            this._engine = options.engine;
            this._loop = options.loop !== undefined ? options.loop : false;
            this._preloadAllFrames = options.preloadAllFrames !== undefined ? options.preloadAllFrames : false;
            this._allowFramesToComplete = options.allowFramesToComplete !== undefined ? options.allowFramesToComplete : true;

            this._currentFrames = options._currentFrames || [];
            //Retain the last frame before transitioning to the next.
            this._lastFrame = null;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the current frame.
         */
        get currentFrame() {
            return this._currentFrames.first();
        }
        /**
         * Returns the current engine instance.
         */
        get engine() {
            return this._engine;
        }
        /**
         * A read-only assignment that will only assign the engine once.
         * All additional attempts to assign the engine will result in an exception.
         */
        set engine(v) {
            if (!this._engine) {
                this._engine = v;
                return;
            }

            throw `The engine has already been assigned for the storyboard: ${this.name}`;
        }
        /**
         * Returns the loop status.  If true the current frame will advance to the beginning of the current branch.  This is false by default.
         */
        get loop() {
            return this._loop;
        }
        /**
         * Sets the loop status.  If true the current frame will advance to the beginning of the current branch.  This is false by default.
         */
        set loop(v) {
            this._loop = v;
        }
        /**
         * Determines if the storyboard will allow a frame to complete.  By default this is true.
         * If this is true, the storyboard will not continue proceed to another frame until the current one is complete.
         * If this is false, the storyboard will cancel the current frame and proceed to another frame.
         */
        get allowFramesToComplete() {
            return this._allowFramesToComplete;
        }
        /**
         * Enables/disables the storyboard's ability to allow a frame to complete.  By default this is true.
         * If this is true, the storyboard will not continue proceed to another frame until the current one is complete.
         * If this is false, the storyboard will cancel the current frame and proceed to another frame.
         */
        set allowFramesToComplete(v) {
            this._allowFramesToComplete = v;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the storyboard.
         */
        clone() {
            return new hamonengine.events.storyboard(this);
        }
        /**
         * Preloads any resource loading.
         * @return {Object} a promise to complete resource loading.
         */
        async start() {
            super.start();
            //Use the topFrame if one doesn't exist.
            !this.currentFrame && this.goTop();
            await this.load(this._preloadAllFrames, this);
            //Start the current frame.
            this.currentFrame?.start();
        }
        /**
         * Stops and clears the storyboard of all resources.
         */
        stop() {
            super.stop();
            this.clear();
        }
        /**
         * Returns to the top frame, the frame ancestor frame before this one.
         * Always returns the first frame of the storyboard.
         */
        goTop() {
            //NOTE: Since the storyboard is derived from the frame/tree classes this means that the top node will always be this one, so we need to use the first node of the storyboard to be the true top.
            return this.setFrame(this.first);
        }
        /**
         * Traverses to the immediately parent frame and returns the new frame, otherwise null is returned.
         */
        goUp() {
            if (this.currentFrame?.parent) {
                return this.setFrame(this.currentFrame.parent);
            }

            return null;
        }
        /**
         * Traverses to the immediately child frame and returns the new frame, otherwise null is returned.
         */
        goDown() {
            if (this.currentFrame?.first) {
                return this.setFrame(this.currentFrame.first);
            }

            return null;
        }
        /**
         * Traverses to the first frame on the current branch.
         * If traversal succeeds then the new frame is returned, otherwise null is returned.
         */
        goFirst() {
            const parent = this.currentFrame ? this.currentFrame.parent : null;
            if (parent && parent.first) {
                return this.setFrame(parent.first);
            }

            return null;
        }
        /**
         * Traverses to the next frame in line and will start over at the first frame if loop is true.
         * If traversal succeeds then the new frame is returned, otherwise null is returned.
         */
        goNext() {
            if (this.currentFrame) {
                //Traverse to the next frame if one is still available.
                //If no next frame is available and loop is enabled then jump to the beginning frame.
                const nextFrame = (this.currentFrame.next || !this.loop) ? this.currentFrame.next : this.currentFrame.parent.first;
                if (nextFrame) {
                    return this.setFrame(nextFrame);
                }
            }

            return null;
        }
        /**
         * Traverses to the previous frame in line and will start over at the last frame if loop is true.
         * If traversal succeeds then the new frame is returned, otherwise null is returned.
         */
        goPrev() {
            if (this.currentFrame) {
                //Traverse to the previous frame if one is still available.
                //If no previous frame is available and loop is enabled then jump to the end frame.
                const prevFrame = (this.currentFrame.prev || !this.loop) ? this.currentFrame.prev : this.currentFrame.parent.last;
                if (prevFrame) {
                    return this.setFrame(prevFrame);
                }
            }

            return null;
        }
        /**
         * Jumps to the frame by the name and traversal path and returns the new frame, otherwise null is returned.
         * The dot notation is used to determine the traversal path allowing the storyboard to jump to any frame.
         * For example: root1.root1-node1.root1-node1-node3 will allow the storyboard to traverse to the 3rd node under node 1 under root 1.
         * @param {string} framePathAndName to find and jump to.
         */
        jump(framePathAndName) {
            //Find the rootNode.
            let node = this.top ?? this;

            //Traverse through the rest of the tree to find the matching node by name.
            const pathTokens = framePathAndName.split('.');
            while (pathTokens.length > 0 && (node = node.findChildByName(pathTokens.shift()))) { };

            //Traverse the currentFrame and return it.
            return this.setFrame(node);
        }
        /**
         * Sets the current frame and handles the rendering logic.
         * @param {*} newFrame to replace the existing current frame.
         */
        setFrame(newFrame) {
            //When setting a new frame if allow frames to complete is false or the frame state is STOPPED and is not the last one, then remove the frame instantly.
            const currentFrame = (!this.allowFramesToComplete || (this.currentFrame?.frameState === FRAME_STATE.STOPPED) || this._currentFrames.length > 1)
                ? this._currentFrames.shift()
                    : this.currentFrame;

            //If allow frames to complete is true then retrieve the current frame and signal it to stop.
            currentFrame?.stop(!this.allowFramesToComplete);

            //Add the new frame and start it.
            this._currentFrames.push(newFrame);

            //Do not start frames that are storyboards
            (!(newFrame instanceof hamonengine.events.storyboard)) && newFrame.start();
            return newFrame;
        }
        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        /**
         * An internal event that occurs when attempting to load resources.
         * @return {Object} a promise that the resource has loaded successfully.
         */
        async onloadResources() {
            hamonengine.debug && console.debug("[hamonengine.events.storyboard.onloadResources]");
        }
        /**
         * An event that occurs when an update event has occurred.
         * @param {object} storyboard calling the load operation.
         * @param {string} eventName of the update event.
         * @param {object} updateParams associated with the update event.
         * @return {Object} a promise that the resource has loaded successfully.
         */
        async onUpdateEvent(storyboard, eventName, updateParams) {
            hamonengine.debug && console.debug(`[hamonengine.events.storyboard.onUpdateEvent] eventName: '${eventName}'`);
        }
        /**
         * Processes the current frame in the storyboard on an onFrame event.
         * @param {number} elapsedTimeInMilliseconds since the last frame.
         * @param {number} totalTimeInMilliseconds is the total time that has elapsed since the engine has started.
         */
        onFrame(elapsedTimeInMilliseconds, totalTimeInMilliseconds) {
            //Remove stopped frame but not if it's the last one.
            if (this.currentFrame?.frameState === FRAME_STATE.STOPPED && this._currentFrames.length > 1) {
                this._lastFrame = this._currentFrames.shift();
            }

            //Render the proceeding frame.
            this.currentFrame?.render(elapsedTimeInMilliseconds, this, totalTimeInMilliseconds, this._lastFrame);
        }
        /**
         * Processes the current frame in the storyboard on an onProcessingFrame event.
         * @param {number} elapsedTimeInMilliseconds since the last frame.
         * @param {number} totalTimeInMilliseconds is the total time that has elapsed since the engine has started.
         */
        onProcessingFrame(elapsedTimeInMilliseconds, totalTimeInMilliseconds) {
            this.currentFrame?.onProcessingFrame(elapsedTimeInMilliseconds, this, totalTimeInMilliseconds, this._lastFrame);
        }
        /**
         * Processes keyboard events.
         * @param {string} type of keyboard event such as 'up' or 'down' for keyup and keydown.
         * @param {string} keyCode of the key (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
         * @param {object} e KeyboardEvent (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a screen (see hamonengine.graphics.screen).
         */
        onKeyEvent(type, keyCode, e, caller) {
            this.currentFrame?.onKeyEvent(this, type, keyCode, e, caller);
        }
        /**
         * Processes mouse & touch events if captureTouchAsMouseEvents is set to true.
         * @param {string} type of mouse event such as: 'click', 'up', 'down', 'move', 'enter', 'leave'.
         * @param {object} v an instance of vector2 object that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a screen (see hamonengine.graphics.screen).
         */
        onMouseEvent(type, v, e, caller) {
            this.currentFrame?.onMouseEvent(this, type, v, e, caller);
        }
        /**
         * Processes touch events.
         * @param {string} type of touch event such as: 'start', 'move', 'end', 'cancel', 'click'.
         * @param {Array} touches an array of vector2 objects that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e TouchEvent (https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a screen (see hamonengine.graphics.screen).
         */
        onTouchEvent(type, touches, e, caller) {
            this.currentFrame?.onTouchEvent(this, type, touches, e, caller);
        }
        /**
         * An event that is triggered when a screen (canvas) is resized.
         * @param {object} rect (hamonengine.geometry.rect) of the new screen dimensions.
         */
        async onScreenResize(rect) {
            if (hamonengine.debug && hamonengine.verbose) {
                console.debug(`[hamonengine.events.storyboard.onScreenResize] Name: '${this.name}', Dimensions: {${rect.toString()}}`);
            }
            await this.update(true, this, 'screenResize', {rect});
        }
    }
})();