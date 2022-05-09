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
     * This class represents a lineSegment.
     */
    hamonengine.geometry.lineSegment = class {
        constructor(x = 0, y = 0, x2 = 0, y2 = 0) {
            this.x = x;
            this.y = y;
            this.x2 = x2;
            this.y2 = y2;

            //Precache the direction vector.
            this._direction = new hamonengine.geometry.vector2(x2 - x, y2 - y);
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the length of the lineSegment.
         */
        get length() {
            return this._direction.length;
        }
        /**
         * Returns the middle point on the lineSegment.
         */
        get midPoint() {
            return this._direction.midPoint;
        }
        /**
         * Returns the slope of the lineSegment.
         */
        get slope() {
            return (this._direction.y) / (this._direction.x);
        }
        /**
         * Returns the normal of the lineSegment.
         */
        get normal() {
            return this._direction.normal(ROTATION_TYPE.CW);
        }
        /**
         * Returns a collection of normals to provide consistency with the other shapes.
         */
        get normals() {
            return [this.normal];
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the lineSegment.
         * @returns {Object} cloned lineSegment.
         */
        clone() {
            return new hamonengine.geometry.lineSegment(this.x, this.y, this.x2, this.y2);
        }
        /**
         * Outputs the lineSegment as a string.
         */
        toString() {
            return `({x1: ${this.x}, y1: ${this.y}}), ({x2: ${this.x2}, y2: ${this.y2}})`;
        }
        /**
         * Returns an array of vertices representing the lineSegment.
         * @return {object} an array of hamonengine.geometry.vector2
         */
        toVertices() {
            return [
                new hamonengine.geometry.vector2(this.x, this.y),
                new hamonengine.geometry.vector2(this.x2, this.y2)
            ];
        }
        /**
         * Transforms this lineSegment into a polygon object.
         * @return {object} an instance of hamonengine.geometry.polygon.
         */
        toPolygon() {
            return new hamonengine.geometry.polygon({
                vertices: this.toVertices()
            });
        }
        /**
         * Creates and returns a new instance of a translated lineSegment.
         * @param {Object} translateVector a translation vector (hamonengine.geometry.lineSegment) of where to move the lineSegment.
         * @returns {Object} translated lineSegment.
         */
        translate(translateVector) {
            //Normalize the translateVector.
            translateVector = translateVector || new hamonengine.geometry.vector2(0, 0);

            //Return a new instance of the lineSegment as to preserve the original.
            return new hamonengine.geometry.lineSegment(
                this.x + translateVector.x,
                this.y + translateVector.y,
                this.x2 + translateVector.x,
                this.y2 + translateVector.y
            );
        }
        /**
         * Determines if this lineSegment collides with another using SAT (Separating Axis Theorem) and returns a MTV (Minimum Translation Vector).
         * This vector is not a unit vector, it includes the direction and magnitude of the overlapping length.
         * NOTE: The shape must be of the type hamonengine.geometry.polygon, hamonengine.geometry.rect, hamonengine.geometry.lineSegment
         * @param {Object} shape to evaluated based on the coordinates.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollision(shape) {
            if (shape instanceof hamonengine.geometry.lineSegment) {
                return this.isCollisionLine(shape);
            }
            else if (shape instanceof hamonengine.geometry.rect) {
                return this.isCollisionRect(shape);
            }
            else if (shape instanceof hamonengine.geometry.polygon) {
                //return this.isCollisionPolygon(shape);
                return new hamonengine.geometry.vector2(0, 0);
            }

            return new hamonengine.geometry.vector2(0, 0);
        }
        /**
         * Determines if this lineSegment collides with the passed polygon.
         * NOTE: The shape must be of the type hamonengine.geometry.polygon
         * @param {Object} polygon to evaluated based on the coordinates.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollisionPolygon(polygon) {
            //Allow the polygon object to handle the polygon collision logic.
            return polygon.isCollision(this.toPolygon());
        }
        /**
         * Determines if this rect collides with this lineSegment.
         * NOTE: The shape must be of the type hamonengine.geometry.rect
         * @param {Object} rect to evaluated based on the coordinates.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollisionRect(rect) {
            if (!(rect instanceof hamonengine.geometry.rect)) {
                console.warn(`[hamonengine.geometry.lineSegment.isCollision] The rect parameter is not of type hamonengine.geometry.rect!`);
            }

            let mnimumOverlappingLength = NaN;
            let mtvAxis;

            const checkCollision = (thisProjection, otherProjection, normal) => {

                //Determine if projection1 & projection2 are overlapping.
                //An overlapping interval is one that is valid or is a interval.
                const overlappingAxis = thisProjection.overlap(otherProjection);
                if (!overlappingAxis.isLine) {
                    //No collision has occurred so return an empty MTV.
                    return false;
                }

                //Check for containment.
                let overlappingLength = overlappingAxis.length;
                if (thisProjection.contains(otherProjection) || otherProjection.contains(thisProjection)) {
                    overlappingLength += thisProjection.getMinimumDistance(otherProjection);
                }

                //If we reach here then its possible that a collision has occurred but check all edges to verify.
                //Keep record of the shortest overlapping length in the event a collision occurs.
                if (isNaN(mnimumOverlappingLength) || overlappingLength < mnimumOverlappingLength) {
                    mnimumOverlappingLength = overlappingLength;
                    mtvAxis = normal;
                }

                //Possible collision has occurred, keep checking other edges.
                return true;
            };

            // ---------------------------------------------
            // Check the rect X-Axis (Y-Axis Normal) collision.
            // ---------------------------------------------
            if (!checkCollision(this.project(hamonengine.geometry.vector2.Y_AXIS_NORMAL), new hamonengine.geometry.interval(rect.y, rect.y + rect.height), hamonengine.geometry.vector2.Y_AXIS_NORMAL)) {
                return new hamonengine.geometry.vector2();
            }

            // ---------------------------------------------
            // Check the rect Y-Axis (X-Axis Normal) collision.
            // ---------------------------------------------
            if (!checkCollision(this.project(hamonengine.geometry.vector2.X_AXIS_NORMAL), new hamonengine.geometry.interval(rect.x, rect.x + rect.width), hamonengine.geometry.vector2.X_AXIS_NORMAL)) {
                return new hamonengine.geometry.vector2();
            }

            const lineSegmentProjection = rect.project(this.normal);

            // ---------------------------------------------
            // Check the lineSegment X-Axis (Y-Axis Normal) collision.
            // ---------------------------------------------
            if (!checkCollision(lineSegmentProjection, new hamonengine.geometry.interval(rect.y, rect.y + rect.height), lineSegmentProjection)) {
                return new hamonengine.geometry.vector2();
            }

            // ---------------------------------------------
            // Check the lineSegment Y-Axis (X-Axis Normal) collision.
            // ---------------------------------------------
            if (!checkCollision(lineSegmentProjection, new hamonengine.geometry.interval(rect.x, rect.x + rect.width), lineSegmentProjection)) {
                return new hamonengine.geometry.vector2();
            }

            //Determine when the value is too small and should be treated as zero.
            //This SAT algorithm can generate an infinitesimally small values when dealing with multiple rect collisions.
            mnimumOverlappingLength = mnimumOverlappingLength < hamonengine.geometry.settings.collisionDetection.floor ? 0.0 : mnimumOverlappingLength;

            //Return an MTV.
            return mtvAxis.multiply(mnimumOverlappingLength);
        }
        /**
         * Determines if this lineSegment collides with the passed lineSegment.
         * NOTE: The shape must be of the type hamonengine.geometry.lineSegment
         * @param {Object} lineSegment to evaluated based on the coordinates.
         * @return {number} a COLLISION_TYPES
         */
        isCollisionLine(lineSegment) {
            if (!(lineSegment instanceof hamonengine.geometry.lineSegment)) {
                throw "Parameter lineSegment is not of type hamonengine.geometry.lineSegment.";
            }

            let mnimumOverlappingLength = NaN;
            let mtvAxis;

            const checkCollision = (thisProjection, otherProjection, normal) => {

                //Determine if projection1 & projection2 are overlapping.
                //An overlapping interval is one that is valid or is a interval.
                const overlappingAxis = thisProjection.overlap(otherProjection);
                if (!overlappingAxis.isLine) {
                    //No collision has occurred so return an empty MTV.
                    return false;
                }

                //Check for containment.
                let overlappingLength = overlappingAxis.length;
                if (thisProjection.contains(otherProjection) || otherProjection.contains(thisProjection)) {
                    overlappingLength += thisProjection.getMinimumDistance(otherProjection);
                }

                //If we reach here then its possible that a collision has occurred but check all edges to verify.
                //Keep record of the shortest overlapping length in the event a collision occurs.
                if (isNaN(mnimumOverlappingLength) || overlappingLength < mnimumOverlappingLength) {
                    mnimumOverlappingLength = overlappingLength;
                    mtvAxis = normal;
                }

                //Possible collision has occurred, keep checking other edges.
                return true;
            };


            // ---------------------------------------------
            // Check the other lineSegment's (l) axis/normal for collision.
            // ---------------------------------------------

            //Project this lineSegment and the target lineSegment onto other lineSegment's axis normal.
            const otherNormal = lineSegment.normal;
            let thisInterval = this.project(otherNormal);
            let otherInterval = lineSegment.project(otherNormal);


            if (!checkCollision(thisInterval, otherInterval, otherNormal)) {
                return new hamonengine.geometry.vector2();
            }

            // ---------------------------------------------
            // Check this lineSegment for collision.
            // ---------------------------------------------

            //Project this lineSegment and the target lineSegment onto this lineSegment's axis normal.
            const thisNormal = this.normal;
            thisInterval = this.project(thisNormal);
            otherInterval = lineSegment.project(thisNormal);

            if (!checkCollision(thisInterval, otherInterval, thisNormal)) {
                return new hamonengine.geometry.vector2();
            }

            //Determine when the value is too small and should be treated as zero.
            //This SAT algorithm can generate an infinitesimally small values when dealing with multiple rect collisions.
            mnimumOverlappingLength = mnimumOverlappingLength < hamonengine.geometry.settings.collisionDetection.floor ? 0.0 : mnimumOverlappingLength;

            //Return an MTV.
            return mtvAxis.multiply(mnimumOverlappingLength);
        }
        /**
         * Projects the lineSegment onto the provided vector and returns a (hamonengine.geometry.interval}.
         * @param {object} unitVector (hamonengine.geometry.vector2) to project onto.
         */
        project(unitVector) {
            let min = 0, max = 0;
            max = min = unitVector.dot({ x: this.x, y: this.y });
            const projection = unitVector.dot({ x: this.x2, y: this.y2 });
            if (projection < min) {
                min = projection;
            }
            else if (projection > max) {
                max = projection;
            }

            //Returns an interval that contains a min & max only.
            return new hamonengine.geometry.interval(min, max);
        }
    }
})();