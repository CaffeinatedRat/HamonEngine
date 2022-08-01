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
     * This class represents a lineSegment, which is similar to a vector2 but has the following differences:
     * 1) The initial point is not restricted to the origin (0,0).
     * 2) The class contains additional methods similar to the other shape classes (rect, polygon).
     * 3) The class contains a projection and collision routines.
     * 4) Line segments are boundary shapes where collision detection forces any other shape in the direction of the segment normal.
     */
    hamonengine.geometry.lineSegment = class {
        constructor(x = 0, y = 0, x2 = 0, y2 = 0) {
            this.x = x;
            this.y = y;
            this.x2 = x2;
            this.y2 = y2;

            //Precache the direction vector.
            this._direction = new hamonengine.math.vector2(x2 - x, y2 - y);
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
            return `({x1: ${this.x}, y1: ${this.y}}, {x2: ${this.x2}, y2: ${this.y2}})`;
        }
        /**
         * Returns an array of vertices representing the lineSegment.
         * @return {object} an array of hamonengine.math.vector2
         */
        toVertices() {
            return [
                new hamonengine.math.vector2(this.x, this.y),
                new hamonengine.math.vector2(this.x2, this.y2)
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
         * @param {Object} translateVector a translation vector (hamonengine.math.vector2) of where to move the lineSegment.
         * @returns {Object} translated lineSegment.
         */
        translate(translateVector) {
            //Normalize the translateVector.
            translateVector = translateVector || new hamonengine.math.vector2(0, 0);

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
         * NOTE: The shape must be of the type hamonengine.geometry.polygon, hamonengine.geometry.rect
         * @param {Object} shape to evaluated based on the coordinates.
         * @param {object} direction optional paramter used to help determine the direction of the MTV.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollision(shape, direction = new hamonengine.math.vector2()) {
            if (shape instanceof hamonengine.geometry.rect) {
                return this.isCollisionRect(shape, direction);
            }
            else if (shape instanceof hamonengine.geometry.polygon) {
                return this.isCollisionPolygon(shape, direction);
            }

            return new hamonengine.math.vector2(0, 0);
        }
        /**
         * Determines if this lineSegment collides with the passed polygon.
         * NOTE: The shape must be of the type hamonengine.geometry.polygon
         * @param {Object} polygon to evaluated based on the coordinates.
         * @param {object} direction optional paramter used to help determine the direction of the MTV.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollisionPolygon(polygon, direction = new hamonengine.math.vector2()) {
            if (!(polygon instanceof hamonengine.geometry.polygon)) {
                console.warn(`[hamonengine.geometry.lineSegment.isCollisionPolygon] The polygon parameter is not of type hamonengine.geometry.polygon!`);
            }

            const checkCollision = (thisProjection, otherProjection) => {
                //Determine if projection1 & projection2 are overlapping.
                //An overlapping interval is one that is valid or is a interval.
                const overlappingAxis = thisProjection.overlap(otherProjection);
                if (!overlappingAxis.isLine) {
                    //No collision has occurred so return an empty MTV.
                    return false;
                }

                //Possible collision has occurred, keep checking other edges.
                return true;
            };

            // ---------------------------------------------
            // Check the polygon collision with the lineSegment.
            // ---------------------------------------------
            //Test the Other Polygon: Iterate through each normal, which will act as an axis to project upon.
            let axes = polygon.normals;
            for (let i = 0; i < axes.length; i++) {
                //Project this polygon and the target polygon onto this axis normal.
                if (!checkCollision(this.project(axes[i]), polygon.project(axes[i]), axes[i])) {
                    return new hamonengine.math.vector2();
                }
            }

            // ---------------------------------------------
            // Check the lineSegment for collision with the polygon.
            // ---------------------------------------------
            const thisNormal = this.normal;
            const shapeProject = polygon.project(thisNormal);
            const lineProject = this.project(thisNormal);
            //Project this lineSegment and the target polygon onto this axis normal.
            if (!checkCollision(shapeProject, lineProject)) {
                return new hamonengine.math.vector2();
            }

            //For a lineSegment, the MTV's magnitude needs to be the length of the distance from the shape's furthest projected point (l.min or l.max) behind the lineSegment (p).
            //When projected onto thisNormal, the lineSegment will form a point (p) while the shape will form a line (l).
            //If the point (p) is contained within the line then we find the point on the line (l.min or l.max) behind the point (p) determined by the direction of the normal.
            let distance = shapeProject.getPointDistance(lineProject, thisNormal);

            //Determine when the value is too small and should be treated as zero.
            //This SAT algorithm can generate an infinitesimally small values when dealing with multiple rect collisions.
            distance = distance < hamonengine.geometry.settings.collisionDetection.floor ? 0.0 : distance;

            //Always return the lineSegment's normal.
            //This slightly simplifies collision detection and is how a lineSegment should behave.
            //Everything behind a lineSegment should be pushed out of it via its normal.
            return thisNormal.multiply(distance);
        }
        /**
         * Determines if this rect collides with this lineSegment.
         * NOTE: The shape must be of the type hamonengine.geometry.rect
         * @param {Object} rect to evaluated based on the coordinates.
         * @param {object} direction optional paramter used to help determine the direction of the MTV.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollisionRect(rect, direction = new hamonengine.math.vector2()) {
            if (!(rect instanceof hamonengine.geometry.rect)) {
                console.warn(`[hamonengine.geometry.lineSegment.isCollisionRect] The rect parameter is not of type hamonengine.geometry.rect!`);
            }

            const checkCollision = (thisProjection, otherProjection) => {
                //Determine if projection1 & projection2 are overlapping.
                //An overlapping interval is one that is valid or is a interval.
                const overlappingAxis = thisProjection.overlap(otherProjection);
                if (!overlappingAxis.isLine) {
                    //No collision has occurred so return an empty MTV.
                    return false;
                }

                //Possible collision has occurred, keep checking other edges.
                return true;
            };

            // ---------------------------------------------
            // Check the rect X-Axis (Y-Axis Normal) collision.
            // ---------------------------------------------
            const Y_AXIS_PROJECTION = new hamonengine.geometry.interval(rect.y, rect.y + rect.height);
            if (!checkCollision(this.project(hamonengine.math.vector2.Y_AXIS_NORMAL), Y_AXIS_PROJECTION)) {
                return new hamonengine.math.vector2();
            }

            // ---------------------------------------------
            // Check the rect Y-Axis (X-Axis Normal) collision.
            // ---------------------------------------------
            const X_AXIS_PROJECTION = new hamonengine.geometry.interval(rect.x, rect.x + rect.width);
            if (!checkCollision(this.project(hamonengine.math.vector2.X_AXIS_NORMAL), X_AXIS_PROJECTION)) {
                return new hamonengine.math.vector2();
            }

            // ---------------------------------------------
            // Check the lineSegment for collision with the rect.
            // ---------------------------------------------
            const thisNormal = this.normal;
            const shapeProject = rect.project(thisNormal);
            const lineProject = this.project(thisNormal);
            if (!checkCollision(shapeProject, lineProject)) {
                return new hamonengine.math.vector2();
            }

            //For a lineSegment, the MTV's magnitude needs to be the length of the distance from the shape's furthest projected point (l.min or l.max) behind the lineSegment (p).
            //When projected onto thisNormal, the lineSegment will form a point (p) while the shape will form a line (l).
            //If the point (p) is contained within the line then we find the point on the line (l.min or l.max) behind the point (p) determined by the direction of the normal.
            let distance = shapeProject.getPointDistance(lineProject, thisNormal);

            //Determine when the value is too small and should be treated as zero.
            //This SAT algorithm can generate an infinitesimally small values when dealing with multiple rect collisions.
            distance = distance < hamonengine.geometry.settings.collisionDetection.floor ? 0.0 : distance;

            //Always return the lineSegment's normal.
            //This slightly simplifies collision detection and is how a lineSegment should behave.
            //Everything behind a lineSegment should be pushed out of it via its normal.
            return thisNormal.multiply(distance);
        }
        /**
         * Projects the lineSegment onto the provided vector and returns a (hamonengine.geometry.interval}.
         * @param {object} unitVector (hamonengine.math.vector2) to project onto.
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