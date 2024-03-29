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

hamonengine.geometry = hamonengine.geometry || {};

(function () {
    /**
     * This class represents a one-dimensional interval.
     */
    hamonengine.geometry.interval = class {
        constructor(min = 0.0, max = 0.0) {
            this.min = min;
            this.max = max;
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
         * NOTE: DO NOT USE THIS TO DETERMINE IF THE INTERVAL IS A POINT.  Use isPoint instead.
         */
        get isLine() {
            return !isNaN(this.min) && !isNaN(this.max);
        }
        /** 
         * Returns true if the min & max values are equal and are actual values not NaN.
         */
        get isPoint() {
            return this.isLine && this.min === this.max;
        }
        /**
         * Returns the middle point on the interval.
         */
        get midPoint() {
            return this.isPoint ? this.min : ((this.max - this.min) / 2);
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

            // ---- Point & Point Logic ---- //
            //If both intervals are a point then compute the sub-interval based on if they are equal (overlap) or are indepedent.
            if (this.isPoint && i.isPoint) {
                return this.min === i.min ? new hamonengine.geometry.interval(0, 0) : new hamonengine.geometry.interval(NaN, NaN);
            }

            // ---- Point & Interval Logic ---- //
            //If any interval is a point then compute a sub-inteval based on the shortest length.
            if (this.isPoint || i.isPoint) {
                //Determine which is the interval i and the point p.
                let p = this;
                if (!this.isPoint) {
                    p = i;
                    i = this;
                }

                //Determine if the point p lines within the interval i.
                let min = NaN, max = NaN;
                if (i.contains(p)) {
                    //TODO: Verify that the p.min & i.min orientations are correct.
                    //If the point is closer to the i.min then compute the sub-interval {min: i.min, max: p}
                    if (p.min - i.min < i.max - p.min) {
                        min = i.min;
                        max = p.min;
                    }
                    //If the point is closer to the i.max then compute the sub-interval {min: p, max: i.max}
                    else {
                        min = p.min;
                        max = i.max;
                    }
                }

                return new hamonengine.geometry.interval(min, max);
            }

            // ---- Interval & Interval Logic ---- //
            //Calculate the shortest interval for overlapping lines.
            //Determine if both intervals overlap and take only the overlapping sub-interval.
            //If neither interval overlaps then an interval of [NaN, NaN] is returned.
            let min = NaN, max = NaN;
            if (!this.isPoint && !i.isPoint) {

                //Determine if the point is on the interval.
                //Note that the interval represents a single axis so the point will only be one dimensional.
                const isPointOnLine = (point, interval) => (point >= interval.min && point <= interval.max);

                //Determine if minimum point occurs on the interval i
                if (isPointOnLine(this.min, i)) {
                    min = this.min;
                }
                //Or determine if the minimum point occurs on the this interval.
                else if (isPointOnLine(i.min, this)) {
                    min = i.min;
                }

                //Determine if maximum point occurs on the interval i
                if (isPointOnLine(this.max, i)) {
                    max = this.max;
                }
                //Or determine if the maximum point occurs on the this interval.
                else if (isPointOnLine(i.max, this)) {
                    max = i.max;
                }
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
         * @param {Object} i to get an orientation.
         */
        getOrientation(i) {
            const tMidPoint = this.midPoint;
            const lMidPoint = i.midPoint;
            return lMidPoint === tMidPoint ? 0 : (lMidPoint < tMidPoint ? -1 : 1);
        }
        /**
         * Returns the distance between two midpoints.
         * @param {Object} i 
         */
        getDistance(i) {
            return Math.abs(this.midPoint - i.midPoint);
        }
        /**
         * Returns the minimum distance between two overlapping intervals.
         * @param {*} i
         */
        getMinimumDistance(i) {
            return this.getDistanceParams(i).min;
        }
        /**
         * Returns the maximum distance between two overlapping intervals.
         * @param {*} i
         */
        getMaximumDistance(i) {
            return this.getDistanceParams(i).max;
        }
        /**
         * Returns the minimum and maximum distances between two intervals.
         * @param {*} i
         */
        getDistanceParams(i) {
            const min = Math.abs(this.min - i.min);
            const max = Math.abs(this.max - i.max);
            return { min: (min < max) ? min : max, max: (min > max) ? min : max };
        }
        /**
         * Experimental: Gets the distance between the point and the line based on the direction specified.
         * @param {*} i 
         * @param {*} direction 
         * @returns 
         */
        getPointDistance(i, direction) {
            let p = this;
            if (!this.isPoint) {
                p = i;
                i = this;
            }

            return direction > 0 ? i.max - p.max : p.max - i.min;
        }
    }
})();
