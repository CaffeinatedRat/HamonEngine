/**
* Copyright (c) 2020, CaffeinatedRat.
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
     * This class represents a one-dimensional line.
     */
    hamonengine.geometry.line = class {
        constructor(min=0.0,max=0.0) {
            this.min=min;
            this.max=max;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the length of the line.
         */
        get length() {
            return (this.max - this.min);
        }
        /**
         * Returns true if the line is valid, where the min & max are actual values not NaN.
         */
        get isLine() {
            return !isNaN(this.min) && !isNaN(this.max);
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the target line.
         * @param {Object} line to be cloned.
         */
        static clone(line) {
            return new hamonengine.geometry.line(line.min, line.max);
        }
        /**
         * Clones this line.
         */
        clone() {
            return hamonengine.geometry.line.clone(this);
        }
        /**
         * Outputs the line's coordinates as a string.
         */
        toString() {
            return `{min: '${this.min}', max: '${this.max}'}`;
        }
        /**
         * Returns an instance of the mirrored line across the x-axis.
         */
        mirror() {
            return new hamonengine.geometry.line(this.max, this.min);
        }
        /**
         * Adds l to the current line and returns a new instance of the line.
         * @param {Object} l line to add.
         */
        add(l) {
            return new hamonengine.geometry.line(this.min + l.min, this.max + l.max);
        }
        /**
         * Substracts l from the current line and return a new instance of the line.
         * @param {Object} l line to subtract.
         */
        subtract(l) {
            return new hamonengine.geometry.line(this.min - l.min, this.max - l.max);
        }
        /**
         * Multiples the current line by a scalar value and returns a new instance of the line.
         * @param {Number} s scalar to multiply.
         */
        multiplyScalar(s) {
            return new hamonengine.geometry.line(this.min * s, this.max * s);
        }
        /**
         * Returns the line overlapping this line and line l.
         * NOTE: The line
         * @param {Object} l to overlap.
         */
        overlap(l) {
            //Determine if the point is on the line.
            let isPointOnLine = (point,line) => (point >= line.min && point <= line.max);

            let min = NaN;
            //Determine if minimum point occurs on the line l
            if (isPointOnLine(this.min, l)) {
                min = this.min;
            }
            //Or determin if the minimum point occurs on the this line.
            else if (isPointOnLine(l.min, this)) {
                min = l.min;
            }

            let max = NaN;
            //Determine if maximum point occurs on the line l
            if (isPointOnLine(this.max, l)) {
                max = this.max;
            }
            //Or determin if the maximum point occurs on the this line.
            else if (isPointOnLine(l.max, this)) {
                max = l.max;
            }

            //Return the overlapping line.
            return new hamonengine.geometry.line(min, max);
        }
    }
})();