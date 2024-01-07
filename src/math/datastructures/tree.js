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

hamonengine.math = hamonengine.math || {};
hamonengine.math.datastructures = hamonengine.math.datastructures || {};

(function () {
    /**
     * This class represents a general hierarchy tree that supports n nodes.
     */
    hamonengine.math.datastructures.tree = class {
        constructor(options = {}) {

            //Handle copy-constructor (clone) operations.
            if (options instanceof hamonengine.math.datastructures.tree) {

                //Find the top node.
                options.top = options.top ?? options.parent;

                //Clone all the descendants
                let node = options.first
                while (node != null) {
                    this.append(node.clone());
                    node = node.next;
                }
            }

            //Normalize these values to null rather than undefined.
            this._top = options.top || null;
            this._parent = options.parent || null;
            this._first = options.first || null;
            this._last = options.last || null;
            this._next = null;
            this._prev = null;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /*
         * Returns a the first child of the node if one exists.
         */
        get first() {
            return this._first;
        }
        /*
         * Returns a the last child of the node if one exists.
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
         * Returns the parent node.
         */
        get parent() {
            return this._parent;
        }
        /**
         * Returns the top level ancestor node.
         */
        get top() {
            return this._top;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the tree.
         */
        clone() {
            return new hamonengine.math.datastructures.tree(this);
        }
        /**
         * Appends a new node as the last child.
         * @param {*} node to append.
         */
        append(node) {
            //Handle ancestor nodes.
            //NOTE: The top node will be the one without a top property.
            node._top = this.top ?? this;
            node._parent = this;

            if (this.last) {
                node._prev = this.last;
                this._last._next = node;
                this._last = node;
            }
            //There is no first or last child so append the node as both.
            else {
                this._first = this._last = node;
            }
        }
        /**
         * Prepends a new node as the first child.
         * @param {*} node to prepend.
         */
        prepend(node) {
            //Handle ancestor nodes.
            //NOTE: The top node will be the one without a top property.
            node._top = this.top ?? this;
            node._parent = this;

            if (this.first) {
                node._next = this.first;
                this._first._prev = node;
                this._first = node;
            }
            //There is no first or last child so append the node as both.
            else {
                this._first = this._last = node;
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
                node._prev = node._next = node._parent = node._top = null;
                //Clear child nodes.
                clearAll && node.clear();
                node = nextNode;
            }

            //Clear first & last references
            this._first = this._last = null;
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
         * Returns a child node by the index.
         * If the index is out of range then null is returned.
         * @param {number} index of the node to retrieve.
         * @returns the matching node found by index.
         */
        findChildByIndex(index) {
            let currentIndex = 0;
            return hamonengine.events.node.searchByPredicate(this.first, node => node !== null && index > 0 && currentIndex++ < index);
        }
        /**
         * Traverses up to find a node based on the predicate.
         * @param {*} node to begin traversing from.
         * @param {*} predicate used to determine the search conditions.
         * @returns the matching node.
         */
        static searchAncestorByPredicate(node, predicate) {
            while (predicate && predicate(node)) {
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
         * Finds the last node
         * @param {*} node first node used to find the last.
         * @returns the last node.
         */
        static findLast(node) {
            return hamonengine.events.node.searchByPredicate(node, node => node !== null && node.next !== null);
        }
    }
})();