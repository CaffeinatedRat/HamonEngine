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
         * Preloads any resource loading.
         * @param {boolean} loadDescendantFrames determines if the child frames should load resources at the same time.
         * @return {Object} a promise to complete resource loading.
         */
        async load(loadDescendantFrames) {
            const nodePromises = [];
            const parentNodePromise = this.onloadResources();
            if ((parentNodePromise instanceof Promise)) {
                nodePromises.push(parentNodePromise);

                if (loadDescendantFrames) {
                    //Traverse all nodes and invoke the onloadResources method on all descendants waiting for this event.
                    let node = this.first;
                    while (node !== null) {
                        const nodePromise = node.load(loadDescendantFrames);
                        if ((nodePromise instanceof Promise)) {
                            nodePromises.push(nodePromise);
                        }

                        node = node.next;
                    }
                }

                await Promise.all(nodePromises);
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
        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        /**
         * An internal event that occurs when attempting to load resources.
         * @return {Object} a promise that the resource has loaded successfully.
         */
        async onloadResources() {
        }
        /**
         * An onAction event that is triggered when this item is active.
         * @param {number} elapsedTimeInMilliseconds since the engine has started.
         * @param {object} storyboard used to invoke this onAction event.
         * @param {object} engine instance of the engine that is running.
         */
        onAction(elapsedTimeInMilliseconds, storyboard, engine) {
        }
        /**
         * An onRelease event that is triggered when a frame needs to release resources.
         */
        onRelease() {
        }
        /**
         * Processes keyboard events.
         * @param {object} storyboard used to invoke this onAction event.
         * @param {object} engine instance of the engine that is running.
         * @param {string} type of keyboard event such as 'up' or 'down' for keyup and keydown.
         * @param {string} keyCode of the key (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
         * @param {object} e KeyboardEvent (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a layer (canvas).
         */
        onKeyEvent(storyboard, engine, type, keyCode, e, caller) {
        }
        /**
         * Processes mouse events.
         * @param {object} storyboard used to invoke this onAction event.
         * @param {object} engine instance of the engine that is running.
         * @param {string} type of mouse event such as: 'click', 'up', 'down', 'move', 'enter', 'leave'.
         * @param {object} v an instance of vector2 object that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a layer (canvas).
         */
        onMouseEvent(storyboard, engine, type, v, e, caller) {
        }
        /**
         * Processes touch events.
         * @param {object} storyboard used to invoke this onAction event.
         * @param {object} engine instance of the engine that is running.
         * @param {string} type of touch event such as: 'start', 'move', 'end', 'cancel', 'click'.
         * @param {Array} touches an array of vector2 objects that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e TouchEvent (https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a layer (canvas).
         */
        onTouchEvent(storyboard, engine, type, touches, e, caller) {
        }
    }
})();