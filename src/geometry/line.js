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

(function () {

    /**
     * This class represents a line.
     */
    hamonengine.geometry.line = class {
        constructor(x = 0, y = 0, x2 = 0, y2 = 0) {

            //Handle special copy constructor operations.
            if (x instanceof hamonengine.geometry.vector2) {
                this._position = x.clone();
            }
            else {
                this._position = new hamonengine.geometry.vector2(x, y);
            }

            //Handle special copy constructor operations.
            if (y instanceof hamonengine.geometry.vector2) {
                this._direction = y.clone();
            }
            else {
                this._direction = new hamonengine.geometry.vector2(x2, y2);
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the position of the line or (x,y)
         */
        get position() {
            return this._position;
        }
        /**
         * Gets the direction or (x2, y2)
         */
        get direction() {
            return this._direction;
        }
        /**
         * Returns the length of the line.
         */
        get length() {
            return this.direction.subtract(this.position).length;
        }
        /**
         * Returns the middle point on the line.
         */
        get midPoint() {
            return this.direction.subtract(this.position).midPoint;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the line.
         * @returns {Object} cloned line.
         */
        clone() {
            return new hamonengine.geometry.line(this._position, this._direction);
        }
        /**
         * Outputs the line as a string.
         */
        toString() {
            return `({x1: ${this._position.x}, y1: ${this._position.y}}), ({x2: ${this._direction.x}, x2: ${this._direction.y}})`;
        }
        /**
         * Returns an array of vertices representing the line.
         * @return {object} an array of hamonengine.geometry.vector2
         */
         toVertices() {
            return [
                new hamonengine.geometry.vector2(this.position.x, this.position.y),
                new hamonengine.geometry.vector2(this.direction.x, this.direction.y)
            ];
        }
        /**
         * Transforms this line into a polygon object.
         * @return {object} an instance of hamonengine.geometry.polygon.
         */
        toPolygon() {
            return new hamonengine.geometry.polygon({
                vertices: this.toVertices()
            });
        }
    }
})();