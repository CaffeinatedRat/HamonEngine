/**
* Copyright \(c\) 2020-2022, CaffeinatedRat.
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

hamonengine.geometry = hamonengine.geometry || {};

(function() {
    /**
     * This class represents a one-dimensional interval.
     */
    hamonengine.geometry.interval = class {
        constructor(min=0.0,max=0.0) {
            this.min=min;
            this.max=max;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the length of the interval.
         */
        get length() {
            return Math.abs(this.max - this.min);
        }
        /**
         * Returns true if the interval is valid, where the min & max are actual values not NaN.
         */
        get isLine() {
            return !isNaN(this.min) && !isNaN(this.max);
        }
        /** 
         * Returns true if the min & max values are equal and are actual values not NaN.
         */
        get isPoint() {
            return !isNaN(this.min) && !isNaN(this.max) && this.min === this.max;
        }
        /**
         * Returns the middle point on the interval.
         */
        get midPoint() {
            return (this.max - this.min) / 2;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the target interval.
         * @param {Object} interval to be cloned.
         */
        static clone(interval) {
            return new hamonengine.geometry.interval(interval.min, interval.max);
        }
        /**
         * Clones this interval.
         */
        clone() {
            return hamonengine.geometry.interval.clone(this);
        }
        /**
         * Outputs the interval as a string.
         */
        toString() {
            return `{min: '${this.min}', max: '${this.max}'}`;
        }
        /**
         * Returns an instance of the mirrored interval across a single axis.
         */
        mirror() {
            return new hamonengine.geometry.interval(this.max, this.min);
        }
        /**
         * Adds l to the current interval and returns a new instance of the interval.
         * @param {Object} l interval to add.
         */
        add(l) {
            return new hamonengine.geometry.interval(this.min + l.min, this.max + l.max);
        }
        /**
         * Substracts l from the current interval and return a new instance of the interval.
         * @param {Object} l interval to subtract.
         */
        subtract(l) {
            return new hamonengine.geometry.interval(this.min - l.min, this.max - l.max);
        }
        /**
         * Multiples the current interval by a scalar value and returns a new instance of the interval.
         * @param {Number} s scalar to multiply.
         */
        multiplyScalar(s) {
            return new hamonengine.geometry.interval(this.min * s, this.max * s);
        }
        /**
         * Returns the interval overlapping this interval and interval i.
         * @param {Object} i to overlap.
         * @returns {Object} overlapping interval.
         */
        overlap(i) {
            //Determine if the point is on the interval.
            //Note that the interval represents a single axis so the point will only be one dimensional.
            const isPointOnLine = (point,interval) => (point >= interval.min && point <= interval.max);

            let min = NaN;
            //Determine if minimum point occurs on the interval l
            if (isPointOnLine(this.min, i)) {
                min = this.min;
            }
            //Or determine if the minimum point occurs on the this interval.
            else if (isPointOnLine(i.min, this)) {
                min = i.min;
            }

            let max = NaN;
            //Determine if maximum point occurs on the interval l
            if (isPointOnLine(this.max, i)) {
                max = this.max;
            }
            //Or determine if the maximum point occurs on the this interval.
            else if (isPointOnLine(i.max, this)) {
                max = i.max;
            }

            //Return the overlapping interval.
            return new hamonengine.geometry.interval(min, max);
        }
        /**
         * Returns true if the interval i is contained within this interval.
         * @param {Object} i to test.
         * @returns {Boolean} true if interval i is contained within this interval.
         */
        contains(i) {
            return i.min >= this.min && i.max <= this.max;
        }
        /**
         * Returns orientation/direction of the interval l in relation to this interval.
         * If the interval l is to the right of this interval then +1 is returned.
         * If the interval l is to the left of this interval then -1 is returned.
         * If the interval l overlaps this interval then 0 is returned.
         * @param {Object} l 
         */
        getOrientation(l) {
            const tMidPoint = this.midPoint;
            const lMidPoint = l.midPoint;
            return lMidPoint === tMidPoint ? 0 : (lMidPoint < tMidPoint ? -1 : 1);
        }
        /**
         * Returns the distance between two midpoints.
         * @param {Object} l 
         */
        getDistance(l) {
            return Math.abs(this.midPoint - l.midPoint);
        }
    }
})();
