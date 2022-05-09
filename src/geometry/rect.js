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
     * This class represents a rectangle polygon.
     */
    hamonengine.geometry.rect = class {
        constructor(x = 0, y = 0, width = 0, height = 0) {
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
         * Determines if this rect collides with the other shape.
         * NOTE: The shape must be of the type hamonengine.geometry.rect or hamonengine.geometry.polygon
         * @param {Object} shape to evaluated based on the coordinates.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollision(shape) {
            if (shape instanceof hamonengine.geometry.rect) {
                return this.isCollisionRect(shape);
            }
            else if (shape instanceof hamonengine.geometry.polygon) {
                //Allow the polygon object to handle the polygon collision logic.
                return shape.isCollision(this);
            }
            else if (shape instanceof hamonengine.geometry.vector2) {
                return this.isCollisionPoint(shape);
            }
            else if (shape instanceof hamonengine.geometry.lineSegment) {
                //Allow the line segment to handle its own collision logic.
                return shape.isCollision(this);
            }

            return new hamonengine.geometry.vector2(0, 0);
        }
        /**
         * Determines if this rect collides with another rect.
         * NOTE: The shape must be of the type hamonengine.geometry.rect
         * @param {Object} otherRect to evaluated based on the coordinates.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollisionRect(otherRect) {
            if (!(otherRect instanceof hamonengine.geometry.rect)) {
                console.warn(`[hamonengine.geometry.rect.isCollision] The otherRect parameter is not of type hamonengine.geometry.rect!`);
            }

            let mnimumOverlappingLength = NaN;
            let mtvAxis;

            // ---------------------------------------------
            // Check the X-Axis (Y-Axis Normal) collision.
            // ---------------------------------------------

            //A rect is an untransformed polygon with 4 set vertices.
            //Project this rect onto the normal of the x-axis, which would be the y-axis.
            const this_YAxisProjection = new hamonengine.geometry.interval(this.y, this.y + this.height);
            //Project otherRect onto the normal of the x-axis, which would be the y-axis.
            const other_YAxisProjection = new hamonengine.geometry.interval(otherRect.y, otherRect.y + otherRect.height);

            //Determine if projection1 & projection2 are overlapping.
            //An overlapping interval is one that is valid or is a interval.
            const overlappingYAxis = this_YAxisProjection.overlap(other_YAxisProjection);
            if (!overlappingYAxis.isLine) {
                //No collision has occurred so return an empty MTV.
                return new hamonengine.geometry.vector2();
            }

            //Check for containment.
            let overlappingYAxisLength = overlappingYAxis.length;
            if (this_YAxisProjection.contains(other_YAxisProjection) || other_YAxisProjection.contains(this_YAxisProjection)) {
                overlappingYAxisLength += this_YAxisProjection.getMinimumDistance(other_YAxisProjection);
            }

            //If we reach here then its possible that a collision has occurred but check all edges to verify.
            //Keep record of the shortest overlapping length in the event a collision occurs.
            if (isNaN(mnimumOverlappingLength) || overlappingYAxisLength < mnimumOverlappingLength) {
                mnimumOverlappingLength = overlappingYAxisLength;
                mtvAxis = hamonengine.geometry.vector2.Y_AXIS_NORMAL;
            }

            // ---------------------------------------------
            // Check the Y-Axis (X-Axis Normal) collision.
            // ---------------------------------------------

            //Project this rect onto the normal of the y-axis, which would be the x-axis.
            const this_XAxisProjection = new hamonengine.geometry.interval(this.x, this.x + this.width);

            //Project otherRect onto the normal of the y-axis, which would be the x-axis.
            const other_XAxisProjection = new hamonengine.geometry.interval(otherRect.x, otherRect.x + otherRect.width);

            //Determine if projection1 & projection2 are overlapping.
            //An overlapping interval is one that is valid or is a interval.
            const overlappingXAxis = this_XAxisProjection.overlap(other_XAxisProjection);
            if (!overlappingXAxis.isLine) {
                //No collision has occurred so return an empty MTV.
                return new hamonengine.geometry.vector2();
            }

            //Check for containment.
            let overlappingXAxisLength = overlappingXAxis.length;
            if (this_XAxisProjection.contains(other_XAxisProjection) || other_XAxisProjection.contains(this_XAxisProjection)) {
                overlappingXAxisLength += this_XAxisProjection.getMinimumDistance(other_XAxisProjection);
            }

            //If we reach here then its possible that a collision has occurred but check all edges to verify.
            //Keep record of the shortest overlapping length in the event a collision occurs.
            if (isNaN(mnimumOverlappingLength) || overlappingXAxisLength < mnimumOverlappingLength) {
                mnimumOverlappingLength = overlappingXAxisLength;
                mtvAxis = hamonengine.geometry.vector2.X_AXIS_NORMAL;
            }

            //Determine when the value is too small and should be treated as zero.
            //This SAT algorithm can generate an infinitesimally small values when dealing with multiple rect collisions.
            mnimumOverlappingLength = mnimumOverlappingLength < hamonengine.geometry.settings.collisionDetection.floor ? 0.0 : mnimumOverlappingLength;

            //Return an MTV.
            return mtvAxis.multiply(mnimumOverlappingLength);
        }
        /**
         * Determines if target point is contained of the current rect and returns a MTV (Minimum Translation Vector).
         * @param {Object} point to test.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollisionPoint(point) {

            const outsideDirection = new hamonengine.geometry.vector2();

            if ((point.x >= this.x && point.x <= this.right) && (point.y >= this.y && point.y <= this.bottom)) {
                const minX = point.x - this.x;
                const minX2 = this.right - point.x;
                outsideDirection.x = minX < minX2 ? minX : minX2;

                const minY = point.y - this.y;
                const minY2 = this.bottom - point.y;
                outsideDirection.y = minY < minY2 ? minY : minY2;
            }

            return outsideDirection;
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
                console.warn(`[hamonengine.geometry.rect.isContained] The rect parameter is not of type hamonengine.geometry.rect!`);
            }

            const outsideDirection = new hamonengine.geometry.vector2();

            const xOffset = position.x + rect.x;
            const yOffset = position.y + rect.y;
            if (xOffset < this.x) {
                hamonengine.debug && console.debug(`[hamonengine.geometry.rect.isContained] Outside -x: (${xOffset}, ${yOffset})`);
                outsideDirection.x = -1;
            }
            else if (position.x + rect.right > this.right) {
                hamonengine.debug && console.debug(`[hamonengine.geometry.rect.isContained] Outside +x: (${xOffset}, ${yOffset})`);
                outsideDirection.x = 1;
            }

            if (yOffset < this.y) {
                hamonengine.debug && console.debug(`[hamonengine.geometry.rect.isContained] Outside -y: (${xOffset}, ${yOffset})`);
                outsideDirection.y = -1;
            }
            else if (position.y + rect.bottom > this.bottom) {
                hamonengine.debug && console.debug(`[hamonengine.geometry.rect.isContained] Outside +y: (${xOffset}, ${yOffset})`);
                outsideDirection.y = 1;
            }

            return outsideDirection;
        }
        /**
         * Projects the rect onto the provided vector and returns a (hamonengine.geometry.interval}.
         * @param {object} unitVector (hamonengine.geometry.vector2) to project onto.
         */
        project(unitVector) {
            let min = 0, max = 0;
            const calcProjections = (vector) => {
                const dotProduct = unitVector.dot(vector);
                if (dotProduct < min) {
                    min = dotProduct;
                }
                else if (dotProduct > max) {
                    max = dotProduct;
                }
            }

            calcProjections(new hamonengine.geometry.vector2(this.x, this.y));
            calcProjections(new hamonengine.geometry.vector2(this.x + this.width, this.y));
            calcProjections(new hamonengine.geometry.vector2(this.x + this.width, this.y + this.height));
            calcProjections(new hamonengine.geometry.vector2(this.x, this.y + this.height));

            //Returns an interval that contains a min & max only.
            return new hamonengine.geometry.interval(min, max);
        }
    }
})();