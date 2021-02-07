/**
* Copyright (c) 2020-2021, CaffeinatedRat.
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
     * This class represents a two-dimensional vector.
     */
    hamonengine.geometry.vector2 = class {
        constructor(x = 0.0, y = 0.0) {
            this.x = x;
            this.y = y;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the length of the vector.
         */
        get length() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        /**
         * Returns the angle in radians from the origin.
         */
        get theta() {
            return (Math.atan2(this.y, this.x) + Math.PI2) % Math.PI2;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the target vector.
         * @param {Object} vector to be cloned.
         */
        static clone(vector) {
            return new hamonengine.geometry.vector2(vector.x, vector.y);
        }
        /**
         * Clones this vector2.
         */
        clone() {
            return hamonengine.geometry.vector2.clone(this);
        }
        /**
         * Outputs the vector's coordinates as a string.
         */
        toString() {
            return `{x: '${this.x}', y: '${this.y}'}`;
        }
        /**
         * Normalizes and returns a unit vector.
         */
        normalize() {
            const l = this.length;
            return (l > 0) ? new hamonengine.geometry.vector2(this.x / l, this.y / l) : new hamonengine.geometry.vector2();
        }
        /**
         * Creates a new instance of a unit vector normal from this vector.
         * @param {number} rotationType determines which direction the normal is calculated based on the ROTATION_TYPE.
         */
        normal(rotationType = ROTATION_TYPE.CCW) {
            const l = this.length;
            if (l > 0) {
                if (rotationType === ROTATION_TYPE.CCW) {
                    //Where θ = PI/2
                    //x' = x * cos(θ) - y * sin(θ) = x*0 - y*1 = -y
                    //y' = x * sin(θ) + y * cos(θ) = x*1 - y*0 = x
                    return new hamonengine.geometry.vector2(-this.y / l, this.x / l);
                }
                else {
                    //Where θ = -PI/2
                    //x' = x * cos(θ) - y * sin(θ) = x*0 - y*-1 = y
                    //y' = x * sin(θ) + y * cos(θ) = x*-1 - y*0 = -x
                    return new hamonengine.geometry.vector2(this.y / l, -this.x / l);
                }
            }
            return new hamonengine.geometry.vector2();
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
         * Returns an inverted vector2.
         */
        invert() {
            return new hamonengine.geometry.vector2(-this.x, -this.y);
        }
        /**
         * Adds v to the current vector and returns a new instance of the vector.
         * @param {Object} v vector2 to add.
         */
        add(v) {
            return new hamonengine.geometry.vector2(this.x + v.x, this.y + v.y);
        }
        /**
         * Substracts v from the current vector and return a new instance of the vector.
         * @param {Object} v vector2 to subtract.
         */
        subtract(v) {
            return new hamonengine.geometry.vector2(this.x - v.x, this.y - v.y);
        }
        /**
         * Multiples the current vector by a scalar value or a passed vector returns a new instance of the vector.
         * @param {any} vos a vector or scalar value.
         */
        multiply(vos) {
            return (vos instanceof hamonengine.geometry.vector2) ? this.multiplyVector(vos) : this.multiplyScalar(vos);
        }
        /**
         * Multiples the current vector by a scalar value and returns a new instance of the vector.
         * @param {Number} s scalar to multiply.
         */
        multiplyScalar(s) {
            return new hamonengine.geometry.vector2(this.x * s, this.y * s);
        }
        /**
         * Multiples the current vector by vector v and returns a new instance of the vector.
         * @param {Object} v vector2 to multiply.
         */
        multiplyVector(v) {
            return new hamonengine.geometry.vector2(this.x * v.x, this.y * v.y);
        }
        /**
         * Performs a dot product operation on the current vector and vector v and returns a scalar value.
         * @param {Object} v vector2
         */
        dot(v) {
            return (this.x * v.x) + (this.y * v.y);
        }
        /**
         * Performs a cross product operation on the current vector and vector v and returns a new instance of the vector.
         * NOTE: vresults = 0i + 0j + ((this.x * v.y) - (this.y * v.x))k, where k is the 3rd dimension not supported by 2-d vectors.
         * vresults = 0i +  ((this.x * v.y) - (this.y * v.x))j
         * @param {Object} v vector2
         */
        cross(v) {
            return new hamonengine.geometry.vector3(0, 0, (this.x * v.y) - (this.y * v.x));
        }
        /**
         * Determines if this vector is equal to the passed vector.
         * @param {object} v vector2 to test.
         */
        equals(v) {
            return this.x === v.x && this.y === v.y;
        }
    }

    //Constants
    hamonengine.geometry.vector2.X_AXIS_NORMAL = new hamonengine.geometry.vector2(1, 0);
    hamonengine.geometry.vector2.Y_AXIS_NORMAL = new hamonengine.geometry.vector2(0, 1);

})();