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
    hamonengine.geometry.rect = class {
        constructor(x=0, y=0, width=0, height=0) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the calculated right value.
         */
        get right() {
            return this.x + this.width;
        }
        /**
         * Gets the calculated bottom value.
         */
        get bottom() {
            return this.y + this.height;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Outputs the rect's coordinates as a string.
         */
        toString() {
            return `{x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height}}`;
        }
        /**
         * Determines if the x and y coordinates are inside the bounding box of the object and its current position.
         * @param {number} x position coordinate
         * @param {number} y position coordinate
         * @return {number} a COLLISION_TYPES
         */
        isPointCollision(x, y) {
            //Determine if the coordinates are in the bounding box.
            if ((x === this.x || x === this.width) && (y === this.y || y === this.height)) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isCollision] EDGE: (${x}, ${y})`);
                return COLLISION_TYPES.EDGE;
            }
            
            if (x > this.x && x < this.width && y > this.y && y < this.height) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isCollision] INSIDE: (${x}, ${y})`);
                return COLLISION_TYPES.INSIDE;
            }

            return COLLISION_TYPES.NONE;
        }
        /**
         * Determines if target shape is outside of the current shape and returns a direction if the shape extends outside.
         * The direction is a normalized vector in the direction the shape is extending towards.
         * For example if the shape extends beyond the left side of this shape then the x-cooridnate will be -1.
         * If the shape extends beyond the bottom side of this shape then the y-cooridnate will be +1.
         * @param {object} position location of the shape being tested.
         * @param {object} shape to evaluated based on the coordinates.
         * @returns {object} a hamonengine.geometry.vector2 that contains the direction.
         */
        isShapeInside(position, shape) {

            let outsideDirection = new hamonengine.geometry.vector2();

            let xOffset = position.x + shape.x;
            let yOffset = position.y + shape.y;
            if (xOffset < this.x) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isShapeOutside] Outside -x: (${xOffset}, ${yOffset})`);
                outsideDirection.x = -1;
            }
            else if (position.x + shape.right > this.right) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isShapeOutside] Outside +x: (${xOffset}, ${yOffset})`);
                outsideDirection.x = 1;
            }

            if (yOffset < this.y) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isShapeOutside] Outside -y: (${xOffset}, ${yOffset})`);
                outsideDirection.y = -1;
            }
            else if (position.y + shape.bottom > this.bottom) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isShapeOutside] Outside +y: (${xOffset}, ${yOffset})`);
                outsideDirection.y = 1;
            }

            return outsideDirection;
        }
    }
})();