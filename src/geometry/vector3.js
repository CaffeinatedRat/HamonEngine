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
     * This class represents a three-dimensional vector.
     */
    hamonengine.geometry.vector3 = class {
        constructor(x=0.0,y=0.0,z=0.0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the length of the vector.
         */
        get length() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
        /**
         * Returns the middle point on the vector3.
         */
         get midPoint() {
            return new hamonengine.geometry.vector3(this.x / 2, this.y / 2, this.z / 2);
        }
        /**
         * Returns the minimum coordinate.
         */
         get min() {
            const min = this.x < this.y ? this.x : this.y;
            return min < this.z ? min : this.z;
        }
        /**
         * Returns the maximum coordinate.
         */
         get max() {
            const max = this.x > this.y ? this.x : this.y;
            return max > this.z ? max : this.z;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the target vector.
         * @param {Object} vector to be cloned.
         */
        static clone(vector) {
            return new hamonengine.geometry.vector3(vector.x, vector.y, vector.z);
        }
        /**
         * Clones this vector3.
         */
        clone() {
            return hamonengine.geometry.vector3.clone(this);
        }
        /**
         * Outputs the vector's coordinates as a string.
         */
        toString() {
            return `{x: '${this.x}', y: '${this.y}', z: '${this.z}'}`;
        }
        /**
         * Normalizes and returns a unit vector.
         */
        normalize() {
            const l = this.length; 
            return (l > 0) ? new  hamonengine.geometry.vector3(this.x / l, this.y / l, this.z / l) : new hamonengine.geometry.vector3();
        }
        /**
         * Returns an inverted vector3.
         */
        invert() {
            return new hamonengine.geometry.vector2(-this.x, -this.y, -this.z);
        }
        /**
         * Adds v to the current vector and returns a new instance of the vector.
         * @param {Object} v vector3 to add.
         */
        add(v) {
            return new hamonengine.geometry.vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        }
        /**
         * Substracts v from the current vector and return a new instance of the vector.
         * @param {Object} v vector3 to subtract.
         */
        subtract(v) {
            return new hamonengine.geometry.vector3(this.x - v.x, this.y - v.y, this.z - v.z);
        }
        /**
         * Multiples the current vector by a scalar value and returns a new instance of the vector.
         * @param {Number} s scalar to multiply.
         */
        multiplyScalar(s) {
            return new hamonengine.geometry.vector3(this.x * s, this.y * s, this.z * s);
        }
        /**
         * Multiples the current vector by vector v and returns a new instance of the vector.
         * @param {Object} v vector3 to multiply.
         */
        multiplyVector(v) {
            return new hamonengine.geometry.vector3(this.x * v.x, this.y * v.y, this.z * v.z);
        }
        /**
         * Performs a dot product operation on the current vector and vector v and returns a scalar value.
         * @param {Object} v vector3
         */
        dot(v) {
            return (this.x * v.x) + (this.y * v.y) + (this.z * v.z);
        }
        /**
         * Performs a cross product operation on the current vector and vector v and returns a new instance of the vector.
         * NOTE: vresults = 0i + 0j + ((this.x * v.y) - (this.y * v.x))k, where k is the 3rd dimension not supported by 2-d vectors.
         * vresults = 0i +  ((this.x * v.y) - (this.y * v.x))j
         * @param {Object} v vector3
         */
        cross(v) {
            return new hamonengine.geometry.vector3((this.y * v.z - this.z * v.y), (v.x * this.z - this.x * v.z), (this.x * v.y - this.y * v.x));
        }
        /**
         * Determines if this vector is equal to the passed vector.
         * @param {object} v vector3 to test.
         */
        equals(v) {
            return this.x === v.x && this.y === v.y && this.z === v.z;
        }
    }

    //Constants
    hamonengine.geometry.vector3.X_AXIS_NORMAL = new hamonengine.geometry.vector3(1,0,0);
    hamonengine.geometry.vector3.Y_AXIS_NORMAL = new hamonengine.geometry.vector3(0,1,0);
    hamonengine.geometry.vector3.Z_AXIS_NORMAL = new hamonengine.geometry.vector3(0,0,1);
    
})();