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
         * Returns the length of the line.
         */
        get length() {
            return this._direction.length;
        }
        /**
         * Returns the middle point on the line.
         */
        get midPoint() {
            return this._direction.midPoint;
        }
        /**
         * Returns the slope of the line.
         */
        get slope() {
            return (this._direction.y) / (this._direction.x);
        }
        /**
         * Returns the normal of the line.
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
         * Clones the line.
         * @returns {Object} cloned line.
         */
        clone() {
            return new hamonengine.geometry.line(this.x, this.y, this.x2, this.y2);
        }
        /**
         * Outputs the line as a string.
         */
        toString() {
            return `({x1: ${this.x}, y1: ${this.y}}), ({x2: ${this.x2}, y2: ${this.y2}})`;
        }
        /**
         * Returns an array of vertices representing the line.
         * @return {object} an array of hamonengine.geometry.vector2
         */
        toVertices() {
            return [
                new hamonengine.geometry.vector2(this.x, this.y),
                new hamonengine.geometry.vector2(this.x2, this.y2)
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
        /**
         * Creates and returns a new instance of a translated line.
         * @param {Object} translateVector a translation vector (hamonengine.geometry.line) of where to move the line.
         * @returns {Object} translated line.
         */
        translate(translateVector) {
            //Normalize the translateVector.
            translateVector = translateVector || new hamonengine.geometry.vector2(0, 0);

            //Return a new instance of the line as to preserve the original.
            return new hamonengine.geometry.line(
                this.x + translateVector.x,
                this.y + translateVector.y,
                this.x2 + translateVector.x,
                this.y2 + translateVector.y
            );
        }
        /**
         * Determines if this line collides with another using SAT (Separating Axis Theorem) and returns a MTV (Minimum Translation Vector).
         * This vector is not a unit vector, it includes the direction and magnitude of the overlapping length.
         * NOTE: The shape must be of the type hamonengine.geometry.polygon, hamonengine.geometry.rect, hamonengine.geometry.line
         * @param {Object} shape to evaluated based on the coordinates.
         * @return {number} a COLLISION_TYPES
         */
        isCollision(shape) {
            if (shape instanceof hamonengine.geometry.line) {
                return this.isCollisionLine(shape);
            }
            else if (shape instanceof hamonengine.geometry.rect) {
                //return this.isCollisionRect(shape);
                return new hamonengine.geometry.vector2(0, 0);
            }
            else if (shape instanceof hamonengine.geometry.polygon) {
                //return this.isCollisionPolygon(shape);
                return new hamonengine.geometry.vector2(0, 0);
            }

            return new hamonengine.geometry.vector2(0, 0);
        }
        /**
         * Determines if this line collides with the passed polygon.
         * NOTE: The shape must be of the type hamonengine.geometry.polygon
         * @param {Object} polygon to evaluated based on the coordinates.
         * @return {number} a COLLISION_TYPES
         */
        isCollisionPolygon(polygon) {
            //Allow the polygon object to handle the polygon collision logic.
            return polygon.isCollision(this.toPolygon());
        }
        /**
         * Determines if this rect collides with this line.
         * NOTE: The shape must be of the type hamonengine.geometry.rect
         * @param {Object} rect to evaluated based on the coordinates.
         * @return {number} a COLLISION_TYPES
         */
        isCollisionRect(rect) {
            if (!(rect instanceof hamonengine.geometry.rect)) {
                console.warn(`[hamonengine.geometry.line.isCollision] The rect parameter is not of type hamonengine.geometry.rect!`);
            }

            /*
            let mnimumOverlappingLength = NaN;
            let mtvAxis;

            // ---------------------------------------------
            // Check the Y-Axis collision.
            // ---------------------------------------------

            //A rect is an untransformed polygon with 4 set vertices.
            //Project this rect onto the normal of the x-axis, which would be the y-axis.
            const this_YAxisProjection = new hamonengine.geometry.interval(this.y, this.y + this.height);
            //Project otherRect onto the normal of the x-axis, which would be the y-axis.
            const other_YAxisProjection = new hamonengine.geometry.interval(rect.y, rect.y + rect.height);

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
                const min = Math.abs(this_YAxisProjection.min - other_YAxisProjection.min);
                const max = Math.abs(this_YAxisProjection.max - other_YAxisProjection.max);
                overlappingYAxisLength += (min < max) ? min : max;
            }

            //If we reach here then its possible that a collision has occurred but check all edges to verify.
            //Keep record of the shortest overlapping length in the event a collision occurs.
            if (isNaN(mnimumOverlappingLength) || overlappingYAxisLength < mnimumOverlappingLength) {
                mnimumOverlappingLength = overlappingYAxisLength;
                mtvAxis = hamonengine.geometry.vector2.Y_AXIS_NORMAL;
            }

            // ---------------------------------------------
            // Check the X-Axis collision.
            // ---------------------------------------------

            //Project this rect onto the normal of the y-axis, which would be the x-axis.
            const this_XAxisProjection = new hamonengine.geometry.interval(this.x, this.x + this.width);

            //Project otherRect onto the normal of the y-axis, which would be the x-axis.
            const other_XAxisProjection = new hamonengine.geometry.interval(rect.x, rect.x + rect.width);

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
                const min = Math.abs(this_XAxisProjection.min - other_XAxisProjection.min);
                const max = Math.abs(this_XAxisProjection.max - other_XAxisProjection.max);
                overlappingXAxisLength += (min < max) ? min : max;
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

            */
        }
        /**
         * Determines if this line collides with the passed line.
         * NOTE: The shape must be of the type hamonengine.geometry.line
         * @param {Object} line to evaluated based on the coordinates.
         * @return {number} a COLLISION_TYPES
         */
        isCollisionLine(line) {
            if (!(line instanceof hamonengine.geometry.line)) {
                throw "Parameter line is not of type hamonengine.geometry.line.";
            }

            // ---------------------------------------------
            // Check the other line's (l) axis/normal for collision.
            // ---------------------------------------------

            //Project this polygon and the target polygon onto other line's axis normal.
            const otherNormal = line.normal;
            let thisInterval = this.project(otherNormal);
            let otherInterval = line.project(otherNormal);

            //Determine if one interval contains the other.
            //If neither interval contains the other than no collision has occurred.
            if (!thisInterval.contains(otherInterval) && !otherInterval.contains(thisInterval)) {
                //No collision has occurred so return an empty MTV.
                return new hamonengine.geometry.vector2();
            }

            //Find the shortest distance/value between thisInterval and the otherInterval, which is a point as this line was projected onto its own normal.
            //NOTE: otherInterval is a point, where both the min & max values are the same.
            let mindiff = Math.abs(otherInterval.min - thisInterval.min);
            let maxdiff = Math.abs(otherInterval.min - thisInterval.max);
            let otherShortestDistance = mindiff <= maxdiff ? mindiff : maxdiff;

            // ---------------------------------------------
            // Check this line for collision.
            // ---------------------------------------------

            //Project this polygon and the target polygon onto this line's axis normal.
            const thisNormal = this.normal;
            thisInterval = this.project(thisNormal);
            otherInterval = line.project(thisNormal);

            //Determine if one interval contains the other.
            //If neither interval contains the other than no collision has occurred.
            if (!thisInterval.contains(otherInterval) && !otherInterval.contains(thisInterval)) {
                //No collision has occurred so return an empty MTV.
                return new hamonengine.geometry.vector2();
            }

            //Find the shortest distance/value between thisInterval and the otherInterval, which is a point as this line was projected onto its own normal.
            //NOTE: otherInterval is a point, where both the min & max values are the same.
            mindiff = Math.abs(thisInterval.min - otherInterval.min);
            maxdiff = Math.abs(thisInterval.min - otherInterval.max);
            let thisShortestDistance = mindiff <= maxdiff ? mindiff : maxdiff;

            //Return the normal of the interval with the shortest distance.
            return (otherShortestDistance <= thisShortestDistance) ? otherNormal : thisNormal;
        }
        /**
         * Projects the line onto the provided vector and returns a (hamonengine.geometry.interval}.
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