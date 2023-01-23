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
    hamonengine.events.frame = class {
        constructor(options = {}) {

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.events.frame) {

                console.log(options._name);
                options = {
                    name: options._name,
                    parent: options._parent,
                    first: options._first,
                    last: options._last,
                    top: options._top
                };

                console.log(options);
            }

            //Normalize these values to null rather than undefined.
            this._parent = options.parent || null;
            this._first = options.first || null;
            this._last = options.last || null;
            this._top = options.top || null;

            this._name = options.name || '';
            this._next = null;
            this._prev = null;

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
        /*
         * Returns a the first child of the frame if one exists.
         */
        get first() {
            return this._first;
        }
        /*
         * Returns a the last child of the frame if one exists.
         */
        get last() {
            return this._last;
        }
        /*
         * Returns the next sibling.
         */
        get next() {
            return this._next;
        }
        /*
         * Assigns the next sibling.
         */
        set next(v) {
            this._next = v;
        }
        /*
         * Returns the previous sibling.
         */
        get prev() {
            return this._prev;
        }
        /*
         * Assigns the previous sibling.
         */
        set prev(v) {
            this._prev = v;
        }
        /**
         * Returns the parent frame.
         */
        get parent() {
            return this._parent;
        }
        /**
         * Returns the top level ancestor frame.
         */
        get top() {
            return this._top;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the frame.
         */
        clone({ parent, top } = {}) {

            //Find the top node.
            top = top ?? parent;

            //Clone a new frame.
            var newNode = new hamonengine.events.frame({
                name: this.name + '-cloned',
                parent: parent,
                top: top
            });

            let node = this.first
            while (node != null) {
                newNode.append(node.clone({ parent: newNode, top }));
                node = node.next;
            }

            return newNode;
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
         * Appends a new frame as the last child.
         * @param {*} frame to append.
         */
        append(frame) {
            //Handle ancestor nodes.
            //NOTE: The top node will be the one without a top property.
            frame._top = this.top ?? this;
            frame._parent = this;

            if (this.last) {
                frame._prev = this.last;
                this._last._next = frame;
                this._last = frame;
            }
            //There is no first or last child so append the frame as both.
            else {
                this._first = this._last = frame;
            }
        }
        /**
         * Prepends a new frame as the first child.
         * @param {*} frame to prepend.
         */
        prepend(frame) {
            //Handle ancestor nodes.
            //NOTE: The top node will be the one without a top property.
            frame._top = this.top ?? this;
            frame._parent = this;

            if (this.first) {
                frame._next = this.first;
                this._first._prev = frame;
                this._first = frame;
            }
            //There is no first or last child so append the frame as both.
            else {
                this._first = this._last = frame;
            }
        }
        /**
         * Internal logic for clearing nodes.
         * @private
         */
        __internalClear(clearAll) {
            let node = this.first;
            while (node !== null) {
                let nextNode = node.next;
                //Remove all references of the node.
                node._prev = node._next = node._parent = null;
                //Clear child nodes.
                clearAll && node.clear();
                node = nextNode;
            }

            //Clear first & last references
            this._first = this._last = null;
            clearAll && this.onRelease();
        }
        /**
         * Removes all descendants and invokes onRelease.
         */
        clear() {
            this.__internalClear(true);
        }
        /**
         * Removes only immediate children and does not invoke onRelease.
         */
        empty() {
            this.__internalClear(false);
        }
        /**
         * Returns an ancestor frame by the name.
         * If the node is not found then null is returned.
         * @param {string} name of the frame to search for.
         */
        findAncestorByName(name) {
            let node = this.parent;
            while (node !== null && node.name.toLowerCase() !== name.toLowerCase()) {
                node = node.parent;
            }

            return node;
        }
        /**
         * Traverses forward to find a node based on the predicate.
         * @param {*} node to begin traversing from.
         * @param {*} predicate used to determine the search conditions.
         * @returns the matching node.
         */
        static searchByPredicate(node, predicate) {
            while (predicate && predicate(node)) {
                node = node.next;
            }
            return node;
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
         * Returns a child frame by the index.
         * If the index is out of range then null is returned.
         * @param {number} index of the frame to retrieve.
         * @returns the matching node found by index.
         */
        findChildByIndex(index) {
            let currentIndex = 0;
            return hamonengine.events.frame.searchByPredicate(this.first, node => node !== null && index > 0 && currentIndex++ < index);
        }
        /**
         * Finds the last node
         * @param {*} node first node used to find the last.
         * @returns the last node.
         */
        static findLast(node) {
            return hamonengine.events.frame.searchByPredicate(node, node => node !== null && node.next !== null);
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
         * @param {object} parentFrame
         * @param {object} engine
         */
        onAction(elapsedTimeInMilliseconds, parentFrame, engine) {
        }
        /**
         * An onRelease event that is triggered when a frame needs to release resources.
         */
        onRelease() {
        }
    }
})();