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
     * This class represents a rectangle polygon.
     */
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
         * Clones the rect.
         * @returns {Object} cloned rect.
         */
        clone() {
            return new hamonengine.geometry.rect(this.x, this.y, this.width, this.height);
        }        
        /**
         * Outputs the rect's coordinates as a string.
         */
        toString() {
            return `{x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height}}`;
        }
        /**
         * Transforms this rect into a polygon object.
         * @return {object} an instance of hamonengine.geometry.polygon.
         */
        toPolygon() {
            return new hamonengine.geometry.polygon({
                vertices: [
                    new hamonengine.geometry.vector2(this.x, this.y),
                    new hamonengine.geometry.vector2(this.x + this.width, this.y),
                    new hamonengine.geometry.vector2(this.x + this.width, this.y + this.height),
                    new hamonengine.geometry.vector2(this.x, this.y + this.height)
                ]
            });
        }
        /**
         * Creates and returns a new instance of a translated rect.
         * @param {Object} translateVector a translation vector (hamonengine.geometry.vector2) of where to move the rect.
         * @returns {Object} translated rect.
         */
        translate(translateVector) {
            //Normalize the translateVector.
            translateVector = translateVector || new hamonengine.geometry.vector2(0, 0);

            //Return a new instance of the rect as to preserve the original.
            return new hamonengine.geometry.rect(
                this.x + translateVector.x,
                this.y + translateVector.y,
                this.width,
                this.height
            );
        }  
        /**
         * Determines if the x and y coordinates are inside the bounding box of the object and its current position.
         * NOTE: The shape must be of the type hamonengine.geometry.rect or hamonengine.geometry.polygon
         * @param {Object} shape to evaluated based on the coordinates.
         * @return {number} a COLLISION_TYPES
         */        
        isCollision(shape) {
            if (shape instanceof hamonengine.geometry.rect) {
                return this.isCollisionRect(shape);
            }
            else if (shape instanceof hamonengine.geometry.polygon) {
                return this.isCollisionPolygon(shape);
            }

            return new hamonengine.geometry.vector2(0,0);
        }
        /**
         * Determines if the x and y coordinates are inside the bounding box of the object and its current position.
         * NOTE: The shape must be of the type hamonengine.geometry.rect
         * @param {Object} otherRect to evaluated based on the coordinates.
         * @return {number} a COLLISION_TYPES
         */
        isCollisionRect(otherRect) {
            if (!(otherRect instanceof hamonengine.geometry.rect)) {
                hamonengine.util.logger.warning(`[hamonengine.geometry.rect.isCollision] The otherRect parameter is not of type hamonengine.geometry.rect!`);
            }
           
            let overlappingLength = NaN;
            let mtvAxis;

            // ---------------------------------------------
            // Check the Y-Axis collision.
            // ---------------------------------------------

            //A rect is an untransformed polygon with 4 set vertices.
            //Project this rect onto the normal of the x-axis, which would be the y-axis.
            let this_YAxisProection = new hamonengine.geometry.line(this.y, this.y + this.height);
            //Project otherRect onto the normal of the x-axis, which would be the y-axis.
            let other_YAxisProection = new hamonengine.geometry.line(otherRect.y, otherRect.y + otherRect.height);

            //Determine if projection1 & projection2 are overlapping.
            //An overlapping line is one that is valid or is a line.
            let overlappingYAxis = this_YAxisProection.overlap(other_YAxisProection);
            if (!overlappingYAxis.isLine) {
                //Return an empty MTV.
                return new hamonengine.geometry.vector2();
            }
            
            //If we reach here then its possible that a collision may still occur.
            if(isNaN(overlappingLength) || overlappingYAxis.length < overlappingLength){
                overlappingLength = overlappingYAxis.length;
                mtvAxis = hamonengine.geometry.vector2.Y_AXIS_NORMAL;
            }

            // ---------------------------------------------
            // Check the X-Axis collision.
            // ---------------------------------------------

            //Project this rect onto the normal of the y-axis, which would be the x-axis.
            let this_XAxisProjection = new hamonengine.geometry.line(this.x, this.x + this.width);

            //Project otherRect onto the normal of the y-axis, which would be the x-axis.
            let other_XAxisProjection = new hamonengine.geometry.line(otherRect.x, otherRect.x + otherRect.width);

            //Determine if projection1 & projection2 are overlapping.
            //An overlapping line is one that is valid or is a line.
            let overlappingXAxis = this_XAxisProjection.overlap(other_XAxisProjection);
            if (!overlappingXAxis.isLine) {
                //Return an empty MTV.
                return new hamonengine.geometry.vector2();
            }
            
            //If we reach here then its possible that a collision may still occur.
            if(isNaN(overlappingLength) || overlappingXAxis.length < overlappingLength){
                overlappingLength = overlappingXAxis.length;
                mtvAxis = hamonengine.geometry.vector2.X_AXIS_NORMAL;
            }

            //Determine when the value is too small and should be treated as zero.
            //This SAT algorithm can generate an infinitesimally small values when dealing with multiple rect collisions.
            overlappingLength = overlappingLength < hamonengine.geometry.settings.collisionDetection.floor ? 0.0 : overlappingLength;

            //Return an MTV.
            return mtvAxis.multiply(overlappingLength);
        }
        /**
         * Determines if the x and y coordinates are inside the bounding box of the object and its current position.
         * NOTE: The shape must be of the type hamonengine.geometry.polygon
         * @param {Object} polygon to evaluated based on the coordinates.
         * @return {number} a COLLISION_TYPES
         */
        isCollisionPolygon(polygon) {          
            //Allow the polygon object to handle the polygon collision logic.
            return polygon.isCollision(this.toPolygon());
        }        
        /**
         * Determines if target rect is contained of the current rect and returns a MTV (Minimum Translation Vector).
         * For example if the shape extends beyond the left side of this shape then the x-cooridnate will be -1.
         * If the shape extends beyond the bottom side of this shape then the y-cooridnate will be +1.
         * @param {Object} position location of the shape being tested.
         * @param {Object} rect to evaluated based on the coordinates.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isContained(position, rect) {

            if (!(rect instanceof hamonengine.geometry.rect)) {
                hamonengine.util.logger.warning(`[hamonengine.geometry.rect.isContained] The rect parameter is not of type hamonengine.geometry.rect!`);
            }

            let outsideDirection = new hamonengine.geometry.vector2();

            let xOffset = position.x + rect.x;
            let yOffset = position.y + rect.y;
            if (xOffset < this.x) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isContained] Outside -x: (${xOffset}, ${yOffset})`);
                outsideDirection.x = -1;
            }
            else if (position.x + rect.right > this.right) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isContained] Outside +x: (${xOffset}, ${yOffset})`);
                outsideDirection.x = 1;
            }

            if (yOffset < this.y) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isContained] Outside -y: (${xOffset}, ${yOffset})`);
                outsideDirection.y = -1;
            }
            else if (position.y + rect.bottom > this.bottom) {
                hamonengine.util.logger.debug(`[hamonengine.geometry.rect.isContained] Outside +y: (${xOffset}, ${yOffset})`);
                outsideDirection.y = 1;
            }

            return outsideDirection;
        }
    }
})();