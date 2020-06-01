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
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the target vector.
         * @param {object} vector to be cloned.
         */
        static clone(vector) {
            return new hamonengine.geometry.vector3(vector.x, vector.y, vector.z);
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
            let l = this.length; 
            return new hamonengine.geometry.vector3(this.x / l, this.y / l, this.z / l);
        }
        /**
         * Adds v to the current vector and returns a new instance of the vector.
         */
        add(v) {
            return new hamonengine.geometry.vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        }
        /**
         * Substracts v from the current vector and return a new instance of the vector.
         */
        subtract(v) {
            return new hamonengine.geometry.vector3(this.x - v.x, this.y - v.y, this.z - v.z);
        }
        /**
         * Multiples the current vector by a scalar value and returns a new instance of the vector.
         */
        multiplyScalar(s) {
            return new hamonengine.geometry.vector3(this.x * s, this.y * s, this.z * s);
        }
        /**
         * Multiples the current vector by vector v and returns a new instance of the vector.
         */
        multiplyVector(v) {
            return new hamonengine.geometry.vector3(this.x * v.x, this.y * v.y, this.z * v.z);
        }
        /**
         * Performs a dot product operation on the current vector and vector v and returns a scalar value.
         */
        dotProduct(v) {
            return (this.x * v.x) + (this.y * v.y) + (this.z * v.z);
        }
        /**
         * Performs a cross product operation on the current vector and vector v and returns a new instance of the vector.
         * NOTE: vresults = 0i + 0j + ((this.x * v.y) - (this.y * v.x))k, where k is the 3rd dimension not supported by 2-d vectors.
         * vresults = 0i +  ((this.x * v.y) - (this.y * v.x))j
         */
        crossProduct(v) {
            return new hamonengine.geometry.vector3((this.y * v.z - this.z * v.y), (v.x * this.z - this.x * v.z), (this.x * v.y - this.y * v.x));
        }
    }
})();