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
         * @return {Object} a promise to complete resource loading.
         */
        async load() {
            const nodePromises = [];
            const parentNodePromise = this.onLoadResources();
            if ((parentNodePromise instanceof Promise)) {
                nodePromises.push(parentNodePromise);

                //Traverse all nodes and invoke the onloadResources method on all children waiting for this event.
                let node = this.first;
                while (node !== null) {
                    const nodePromise = node.load();
                    if ((nodePromise instanceof Promise)) {
                        nodePromises.push(nodePromise);
                    }

                    node = node.next;
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
        async onLoadResources() {
        }
        /**
         * An onAction event that is triggered when this item is active.
         * @param {number} elapsedTimeInMilliseconds since the engine has started.
         * @param {object} storyboard used to invoke this onAction event.
         * @param {object} engine
         */
        onAction(elapsedTimeInMilliseconds, storyboard, engine) {
        }
        /**
         * An onRelease event that is triggered when a frame needs to release resources.
         */
        onRelease() {
        }
    }
})();