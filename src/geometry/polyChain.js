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
     * This class represents a Polygonal Chain that contains a collection of lineSegments (lines).
     * NOTE: A polygon should be used instead of a polyChain if it is a closed object and performance is perferred when rendering.
     */
    hamonengine.geometry.polyChain = class {
        constructor(options = {}) {

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.geometry.polyChain) {
                options = {
                    lines: options.lines
                }
            }

            this._lines = [];
            this._coords = [];
            this._normals = options.normals || [];
            this._dirty = DIRTY_FLAG.ALL;

            //Specialized logic to create one shared array for all coordinates for all lines to reduce duplicates.
            if (options.lines && options.lines.length > 0) {
                for (let i = 0; i < options.lines.length; i++) {
                    //Move the coordinates for each line into the shared coordinate array.
                    const previousLine = (options.lines.length > 0 ? options.lines[i - 1] : null);
                    options.lines[i].move(this._coords, previousLine);

                    //Maintain a reference for this line.
                    this._lines.push(options.lines[i]);
                }
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns a collection of line references.
         */
        get lines() {
            return this._lines;
        }
        /**
         * Returns a collection of normals to provide consistency with the other shapes.
         */
        get normals() {
            if (bitflag.isSet(this._dirty, DIRTY_FLAG.NORMAL)) {
                this._normals = this.lines.map(line => line.normal);
                bitflag.toggle(this._dirty, DIRTY_FLAG.NORMAL, false);
            }

            return this._normals;
        }
        /**
         * Returns the center of the lineSegment.
         */
        // get center() {
        //     return this._direction.midPoint;
        // }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the polyChain.
         * @returns {Object} cloned polyChain.
         */
        clone() {
            return new hamonengine.geometry.polyChain({ lines: this.lines });
        }
        /**
         * Outputs the polyChain as a string.
         */
        toString() {
            return this.lines.reduce((prevLine, currentLine) => `${prevLine.toString()}, ${currentLine.toString()}`);
        }
        /**
         * Returns an array of vertices representing the polyChain.
         * @return {object} an array of hamonengine.math.vector2
         */
        toVertices() {
            const vertices = [];
            for (let i = 0; i + 1 < this._coords.length; i += 2) {
                //Look ahead and exclude any duplicate vertices.
                const nextOffset = (i + 2) % this._coords.length;
                if ((this._coords[i] !== this._coords[nextOffset]) || (this._coords[i + 1] !== this._coords[nextOffset + 1])) {
                    vertices.push(new hamonengine.math.vector2(this._coords[i], this._coords[i + 1]));
                }
            }

            return vertices;
        }
        /**
         * Transforms this polyChain into a polygon object.
         * @return {object} an instance of hamonengine.geometry.polygon.
         */
        toPolygon() {
            return new hamonengine.geometry.polygon({ vertices: this.toVertices() });
        }
        /**
         * Adds a vertex to the polyChain.
         * @param {number} x
         * @param {number} y
         */
        addVertex(x, y) {
            //Find the offset and only update the coordinates if the point (vertex) being added is not a duplicate.
            const offset = this._coords.length >= 2 ? (this._coords.length - 2) : 0;
            if (this._coords[offset] !== x || this._coords[offset + 1] !== y) {
                this._coords.push(x);
                this._coords.push(y);
                this._dirty = DIRTY_FLAG.ALL;

                //Only add lines when we have more than one point in our polyChain.
                this._coords.length > 2 && this.lines.push(new hamonengine.geometry.lineSegment(0, 0, 0, 0, { coords: this._coords, offset }));
            }
        }
        /**
         * Adds a line to the polyChain.
         * If the line being added does not complete the polyChain a new one will be added, where the newline must share the endpoints with the previous line in the chain.
         * @param {object} line an instance of hamonengine.geometry.lineSegment.
         */
        addLine(line) {
            //Determine if this current lineSegment shares and endpoint with the previous one.
            let previousLine = (this.lines.length > 0 ? this.lines[this.lines.length - 1] : null);
            
            //If the new lineSegment does note share the same endpoints as the previousLine then create a bridgingLine.
            if (previousLine && !previousLine.sharesEndPoint(line)) {
                const bridgingLine = new hamonengine.geometry.lineSegment(previousLine.x2, previousLine.y2, line.x, line.y);
                bridgingLine.move(this._coords, previousLine);
                this.lines.push(bridgingLine);
                previousLine = bridgingLine;
            }

            line.move(this._coords, previousLine);

            //Maintain a reference for this line.
            this.lines.push(line);
            this._dirty = DIRTY_FLAG.ALL;
        }
        /**
         * Creates and returns a new instance of a translated polyChain.
         * @param {Object} translateVector a translation vector (hamonengine.math.vector2) of where to move the lineSegment.
         * @returns {Object} translated polyChain.
         */
        translate(translateVector) {
            //Normalize the translateVector.
            translateVector = translateVector || new hamonengine.math.vector2(0, 0);

            //Return a new instance of the polyChain as to preserve the original.
            return new hamonengine.geometry.polyChain({
                lines: this.lines.map(line => line.translate(translateVector))
            });
        }
        /**
         * Creates and returns a new instance of a rotated lineSegment.
         * @param {number} theta angle to rotate in radians.
         * @param {Object} offsetVector an offset vector (hamonengine.math.vector2) of where to rotate.
         * @returns {Object} rotated lineSegment.
         */
         rotate(theta, offsetVector) {
            //Normalize
            theta = theta || 0.0;
            offsetVector = offsetVector || new hamonengine.math.vector2(0, 0);

            //Precalculate the sin & cos values of theta.
            const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);

            //TODO: Performance evaluation
            //Return a new instance of the polyChain as to preserve the original.
            return new hamonengine.geometry.polyChain({
                lines: this.lines.map(line => line.rotate(theta, offsetVector, {sinTheta, cosTheta}))
            });
        }
        /**
         * Creates and returns a new instance of a rotated lineSegment around the center.
         * @param {number} theta angle to rotate in radians.
         * @returns {Object} rotated lineSegment.
         */
        // rotateAtCenter(theta) {
        //     return this.rotate(theta, this.center);
        // }
        /**
         * Creates and returns a new instance of a scaled lineSegment.
         * @param {Object} scaleVector a scale vector (hamonengine.math.vector2) to apply to the lineSegment.
         * @param {Object} offsetVector an offset vector (hamonengine.math.vector2) of where to scale.
         * @returns {Object} scaled lineSegment.
         */
        scale(scaleVector, offsetVector) {
            //Normalize.
            scaleVector = scaleVector || new hamonengine.math.vector2(0, 0);
            offsetVector = offsetVector || new hamonengine.math.vector2(0, 0);

            //If the x-axis (exclusively) or the y-axis is being flipped then reverse the order of vertices so the normals are generated correctly.
            const xFlipped = scaleVector.x < 0;
            const yFlipped = scaleVector.y < 0;

            //TODO: Performance evaluation
            //Return a new instance of the polyChain as to preserve the original.
            return new hamonengine.geometry.polyChain({
                lines: this.lines.map(line => line.scale(scaleVector, offsetVector, {xFlipped, yFlipped}))
            });
        }
        /**
         * Creates and returns a new instance of a scaled polygon around the center.
         * @param {Object} scaleVector a scale vector (hamonengine.math.vector2) to apply to the polygon.
         * @returns {Object} scaled polygon.
         */
        // scaleAtCenter(scaleVector) {
        //     return this.scale(scaleVector, this.center.subtract(this.center.multiplyVector(scaleVector)));
        // }
        /**
         * Determines if this polyChain collides with another using SAT (Separating Axis Theorem) and returns a MTV (Minimum Translation Vector).
         * This vector is not a unit vector, it includes the direction and magnitude of the overlapping length.
         * NOTE: The shape must be of the type hamonengine.geometry.polygon, hamonengine.geometry.rect.
         * @param {Object} shape to evaluated based on the coordinates.
         * @param {object} direction optional paramter used to help determine the direction of the MTV.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollision(shape, direction = new hamonengine.math.vector2()) {
            //Handle collisions detection with otherShapes.
            let correctionMTV = new hamonengine.math.vector2();
            for (let i = 0; i < this.lines.length; i++) {
                //Determine if this shape has collided with another.
                let mtv = shape.isCollision(this.lines[i], direction);
                if (mtv.length > 0) {
                    //Adjust the position of the moving object.
                    correctionMTV = correctionMTV.add(mtv);
                }
            }

            return correctionMTV;
        }
        /**
         * Calculates the dimensions of the polyChain and returns the max, min & center vectors.
         * The local maximum that contains the maximum x & y coordinates of the polyChain.
         * The local minimum that contains the minimum x & y coordinates of the polyChain.
         * The center vector that contains the center coordinates of the polyChain.
         * The minimum vertex of the polyChain.
         * The maximum vertex of the polyChain.
         * @param {Array<Object>} vertices a collection to generate the center from.
         * @returns {Object} a complex object that returns the min, max & center vectors (hamonengine.math.vector2).
         */
        //  static calcDimensions(vertices = []) {
        //     let minVertex = null, maxVertex = null;
        //     let xMax = NaN, xMin = NaN;
        //     let yMax = NaN, yMin = NaN;
        //     for (let i = 0; i < this._coords.length - 2; i+=2) {
        //         xMax = xMax > vertices[i].x ? xMax : vertices[i].x;
        //         xMin = xMin < vertices[i].x ? xMin : vertices[i].x;
        //         yMax = yMax > vertices[i+1].y ? yMax : vertices[i+1].y;
        //         yMin = yMin < vertices[i+1].y ? yMin : vertices[i+1].y;

        //         if (minVertex === null || (minVertex.x > vertices[i].x && minVertex.y > vertices[i+1].y)) {
        //             minVertex = vertices[i];
        //         }

        //         if (maxVertex === null || (maxVertex.x < vertices[i].x && maxVertex.y < vertices[i+1].y)) {
        //             maxVertex = vertices[i];
        //         }
        //     };

        //     return {
        //         max: new hamonengine.math.vector2(xMax, yMax),
        //         min: new hamonengine.math.vector2(xMin, yMin),
        //         center: new hamonengine.math.vector2(xMin + (xMax - xMin) / 2, yMin + (yMax - yMin) / 2),
        //         minVertex,
        //         maxVertex
        //     };
        // }        
    }
})();