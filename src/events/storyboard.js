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
     * This class represents a storyboard object, which is a specialized root frame class.
     */
    hamonengine.events.storyboard = class extends hamonengine.events.frame {
        constructor(options = {}) {
            super(options);

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.events.storyboard) {
                options = {
                    engine: options._engine,
                    currentFrame: options._currentFrame,
                    loop: options._loop,
                    preloadAllFrames: options._preloadAllFrames
                };
            }

            this._engine = options.engine;
            this._currentFrame = options.currentFrame;
            this._loop = options.loop !== undefined ? options.loop : false;
            this._preloadAllFrames = options.preloadAllFrames !== undefined ? options.preloadAllFrames : false;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the current frame.
         */
        get currentFrame() {
            return this._currentFrame;
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
         * Returns the loop status.  If true the current frame will advance to the beginning of the current branch.
         */
        get loop() {
            return this._loop;
        }
        /**
         * Sets the loop status.  If true the current frame will advance to the beginning of the current branch.
         */
        set loop(v) {
            this._loop = v;
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
            //Use the topFrame if one doesn't exist.
            !this.currentFrame && this.goTop();
            await this.load(this._preloadAllFrames, this);
        }
        /**
         * Stops and clears the storyboard of all resources.
         */
        stop() {
            this.clear();
            this._currentFrame = null;
        }
        /**
         * Returns to the top frame, the frame ancestor frame before this one.
         * Always returns the first frame of the storyboard.
         */
        goTop() {
            //NOTE: Since the storyboard is derived from the frame/tree classes this means that the top node will always be this one, so we need to use the first node of the storyboard to be the true top.
            return (this._currentFrame = this.first);
        }
        /**
         * Traverses to the immediately parent frame and returns the new frame, otherwise null is returned.
         */
        goUp() {
            if (this.currentFrame && this.currentFrame.parent) {
                return (this._currentFrame = this.currentFrame.parent);
            }

            return null;
        }
        /**
         * Traverses to the immediately child frame and returns the new frame, otherwise null is returned.
         */
        goDown() {
            if (this.currentFrame && this.currentFrame.first) {
                return (this._currentFrame = this.currentFrame.first);
            }

            return null;
        }    
        /**
         * Traverses to the first frame on the current branch.
         * If traversal succeeds then the new frame is returned, otherwise null is returned.
         */
        goFirst() {
            const parent = this.goUp();
            if (parent && parent.first) {
                return (this._currentFrame = parent.first)
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
                    return (this._currentFrame = nextFrame);
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
                    return (this._currentFrame = prevFrame);
                }
            }

            return null;
        }
        /**
         * Jumps to the frame by the name and traversal path and returns the new frame, otherwise null is returned.
         * The dot notation is used to determine the traversal path allowing the storyboard to jump to any frame.
         * For example: root1.root1-node1.root1-node1-node3 will allow the storyboard to traverse to the 3rd node under node 1 under root 1.
         * @param {*} framePathAndName 
         */
        jump(framePathAndName) {
            //Find the rootNode.
            var node = storyboard;

            //Traverse through the rest of the tree to find the matching node by name.
            const pathTokens = framePathAndName.split('.');
            while (pathTokens.length > 0 && (node = node.findChildByName(pathTokens.shift()))) { };

            //Traverse the currentFrame and return it.
            return (this._currentFrame = node);
        }
        /**
         * Processes the current frame in the storyboard on an onFrame event.
         * @param {number} elapsedTimeInMilliseconds since the engine has started.
         */
        render(elapsedTimeInMilliseconds) {
            this.currentFrame && this.currentFrame.onAction(elapsedTimeInMilliseconds, this);
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
         * Processes keyboard events.
         * @param {string} type of keyboard event such as 'up' or 'down' for keyup and keydown.
         * @param {string} keyCode of the key (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
         * @param {object} e KeyboardEvent (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a layer (see hamonengine.graphics.layer).
         */
        onKeyEvent(type, keyCode, e, caller) {
            this.currentFrame && this.currentFrame.onKeyEvent(this, type, keyCode, e, caller);
        }
        /**
         * Processes mouse & touch events if captureTouchAsMouseEvents is set to true.
         * @param {string} type of mouse event such as: 'click', 'up', 'down', 'move', 'enter', 'leave'.
         * @param {object} v an instance of vector2 object that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a layer (see hamonengine.graphics.layer).
         */
        onMouseEvent(type, v, e, caller) {
            this.currentFrame && this.currentFrame.onMouseEvent(this, type, v, e, caller);
        }
        /**
         * Processes touch events.
         * @param {string} type of touch event such as: 'start', 'move', 'end', 'cancel', 'click'.
         * @param {Array} touches an array of vector2 objects that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e TouchEvent (https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a layer (see hamonengine.graphics.layer).
         */
        onTouchEvent(type, touches, e, caller) {
            this.currentFrame && this.currentFrame.onTouchEvent(this, type, touches, e, caller);
        }
    }
})();