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
    hamonengine.geometry.vector2 = class {
        constructor(x,y) {
            this.x = x || 0.0;
            this.y = y || 0.0;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the target vector.
         * @param {object} vector to be cloned.
         */
        static clone(vector) {
            return new hamonengine.geometry.vector2(vector.x, vector.y);
        }
        /**
         * Outputs the vector's coordinates as a string.
         */
        toString() {
            return `{x: '${this.x}', y: '${this.y}'}`;
        }
        /**
         * Returns the length of the vector.
         */
        length() {
            return Math.sqrt(Math.sqr(this.x) + Math.sqr(this.y)); 
        }
        /**
         * Returns the angle in radians from the origin.
         */
        theta() {
            return (Math.atan2(this.y, this.x) + Math.PI2) % Math.PI2;
        }
        /**
         * Normalizes the vector and returns a new instace of the vector.
         */
        normalize() {
            let l = this.length(); 
            return new hamonengine.geometry.vector2(this.x / l, this.y / l);
        }
        /**
         * Returns an instance of the mirrored vector across the x-axis.
         */
        mirror() {
            return new hamonengine.geometry.vector2(-this.x, this.y);
        }
        /**
         * Returns an instance of the flipped vector across the y-axis
         */
        flip() {
            return new hamonengine.geometry.vector2(this.x, -this.y);
        }
        /**
         * Adds v to the current vector and returns a new instance of the vector.
         */
        add(v) {
            return new hamonengine.geometry.vector2(this.x + v.x, this.y + v.y);
        }
        /**
         * Substracts v from the current vector and return a new instance of the vector.
         */
        subtract(v) {
            return new hamonengine.geometry.vector2(this.x - v.x, this.y - v.y);
        }
        /**
         * Multiples the current vector by a scalar value and returns a new instance of the vector.
         */
        multiplyScalar(s) {
            return new hamonengine.geometry.vector2(this.x * s, this.y * s);
        }
        /**
         * Multiples the current vector by vector v and returns a new instance of the vector.
         */
        multiplyVector(v) {
            return new hamonengine.geometry.vector2(this.x * v.x, this.y * v.y);
        }
        /**
         * Performs a dot product operation on the current vector and vector v and returns a scalar value.
         */
        dotProduct(v) {
            return (this.x * v.x) + (this.y * v.y);
        }
        /**
         * Performs a cross product operation on the current vector and vector v and returns a new instance of the vector.
         * NOTE: vresults = 0i + 0j + ((this.x * v.y) - (this.y * v.x))k, where k is the 3rd dimension not supported by 2-d vectors.
         * vresults = 0i +  ((this.x * v.y) - (this.y * v.x))j
         */
        crossProduct(v) {
            return new hamonengine.geometry.vector3(0, 0, (this.x * v.y) - (this.y * v.x)); 
        }
    }
})();