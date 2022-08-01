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

    const DIRTY_NORMAL = 0;
    const DIRTY_DIMS = 1;
    const DIRTY_EDGE = 2;
    const DIRTY_SHAPE = 3;
    const DIRTY_ALL = 15;

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

            //Internally use a vector2 object to hold our vertex and to utilize the various built-in helper methods.
            this._lines = options.lines || [];
            this._normals = options.normals || [];
            this._dirty = DIRTY_ALL;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns a collection of lines that form this polyChain.
         */
        get lines() {
            return this._lines;
        }
        /**
         * Returns a collection of normals to provide consistency with the other shapes.
         */
        get normals() {

            if (bitflag.isSet(this._dirty, DIRTY_NORMAL)) {
                this._normals = this.lines.map(line => line.normal);
                bitflag.toggle(this._dirty, DIRTY_NORMAL, false);
            }

            return this._normals;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Clones the polyChain.
         * @returns {Object} cloned polyChain.
         */
        clone() {
            return new hamonengine.geometry.polyChain({lines: this.lines});
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
            //Remove redundant vertices
            const vertices = [];
            for(let i = 0; i < this.lines.length; i++) {
                vertices.push(new hamonengine.math.vector2(this.lines[i].x, this.lines[i].y));
            }

            //Add the final vertex.
            const lastLine = (this.lines.length > 0)  ? this.lines[this.lines.length - 1] : this.lines[0];
            vertices.push(new hamonengine.math.vector2(lastLine.x2, lastLine.y2));
            return vertices;
        }
        /**
         * Transforms this polyChain into a polygon object.
         * @return {object} an instance of hamonengine.geometry.polygon.
         */
        toPolygon() {
            return new hamonengine.geometry.polygon({
                vertices: this.toVertices()
            });
        }
        /**
         * Adds a vertex to the polyChain.
         * @param {number} x
         * @param {number} y
         */
         addVertex(x, y) {
            const {x2, y2} = (this.lines.length > 0) ? this.lines[this.lines.length-1] : {x2: 0, y2: 0};
            this.lines.push(new hamonengine.geometry.lineSegment(x2, y2, x, y));
            this._dirty = DIRTY_ALL;
        }
        /**
         * Adds a line to the polyChain.
         * If a line does not complete the chain then a new one will be created to bridge the gap between the last line and this new line.
         * @param {object} line an instance of hamonengine.geometry.rect.
         */
        addLine(line) {
            if (this.lines.length > 0) {
                //If the last line in our chain does not have the same x2 & y2 as x1 & y1 in our new line then complete the chain.
                const lastLine = this.lines[this.lines.length - 1];
                if (lastLine.x2 !== line.x && lastLine.y2 !== line.y) {
                    this.lines.push(new hamonengine.geometry.lineSegment(lastLine.x2, lastLine.y2, line.x, line.y));
                }
            }

            this.lines.push(line);
            this._dirty = DIRTY_ALL;
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
                let mtv = shape.isCollision(this.lines[i],direction);
                if (mtv.length > 0) {
                    //Adjust the position of the moving object.
                    correctionMTV = correctionMTV.add(mtv);
                }
            }

            return correctionMTV;
        }
    }
})();