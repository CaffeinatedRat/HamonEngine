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

    const DIRTY_NORMAL = 0;
    const DIRTY_CENTER = 1;
    const DIRTY_EDGE = 2;
    const DIRTY_SHAPE = 3;
    const DIRTY_ALL = 15;

    hamonengine.geometry.polygon = class {
        constructor(options) {
            options = options || {};

            this._centerVector = null;

            //Internally use a vector2 object to hold our vertex and to utilize the various built-in helper methods.
            this._vertices = options.vertices || [];
            this._edges = [];
            this._normals = [];
            
            this._dirty = DIRTY_ALL;
            this._shapeType = SHAPE_TYPE.UNKNOWN;
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the vertices of this polygon.
         */
        get vertices() {
            return this._vertices;
        }
        /**
         * Returns the edges of this polygon.
         */
        get edges() {
            if (hamonengine.util.bitwise.isSet(this._dirty, DIRTY_EDGE)) {
                this._edges = hamonengine.geometry.polygon.calcEdges(this.vertices);
                hamonengine.util.bitwise.toggle(this._dirty, DIRTY_EDGE, false);
            }

            return this._edges;
        }
        /**
         * Returns the normals of this polygon.
         */
        get normals() {
            if (hamonengine.util.bitwise.isSet(this._dirty, DIRTY_NORMAL)) {
                this._normals = hamonengine.geometry.polygon.calcNormals(this.edges);
                hamonengine.util.bitwise.toggle(this._dirty, DIRTY_NORMAL, false);
            }

            return this._normals;
        }
        /**
         * Returns a center vector, which is the center of the polygon.
         */
        get center() {
            if (hamonengine.util.bitwise.isSet(this._dirty, DIRTY_CENTER)) {
                this._centerVector = hamonengine.geometry.polygon.calcCenter(this.vertices);
                hamonengine.util.bitwise.toggle(this._dirty, DIRTY_CENTER, false);
            }

            return this._centerVector;
        }
        /**
         * Returns the type of the shape, CONCAVE or CONVEX.
         */
        get shapeType() {
            if (hamonengine.util.bitwise.isSet(this._dirty, DIRTY_SHAPE)) {
                this._shapeType = hamonengine.geometry.polygon.calcShapeType(this.vertices);
                hamonengine.util.bitwise.toggle(this._dirty, DIRTY_SHAPE, false);
            }

            return this._shapeType;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Outputs the polygon's vertices as a string.
         */
        toString() {
            let vertexString = '';
            for (let i = 0; i < this._vertices.length; i++) {
                vertexString += `${vertexString !== '' ? ',' : ''}${this._vertices[i].toString()}`;
            };
            return `[${vertexString}]`;
        }
        /**
         * Adds a vertex to the polygon.
         * @param {number} x
         * @param {number} y
         */
        addVertex(x, y) {
            //Internally use a vector2 object to hold our vertex and to utilize the various built-in helper methods.
            this._vertices.push(new hamonengine.geometry.vector2(x,y));
            this._dirty = DIRTY_ALL;
        }
        /**
         * Creates and returns a new instance of a translated polygon.
         * @param {object} translateVector a translation vector (hamonengine.geometry.vector2) of where to move the polygon.
         * @returns {object} translated polygon.
         */
        translate(translateVector) {
            //Normalize the translateVector.
            translateVector = translateVector || new hamonengine.geometry.vector2(0, 0);

            let newVertices = [];
            for (let i = 0; i < this.vertices.length; i++) {
                newVertices.push(this.vertices[i].add(translateVector));
            };

            //Return a new instance of the polygon as to preserve the original.
            return new hamonengine.geometry.polygon({
                vertices: newVertices
            });
        }
        /**
         * Creates and returns a new instance of a rotated polygon.
         * @param {number} theta angle to rotate in radians.
         * @param {object} offsetVector an offset vector (hamonengine.geometry.vector2) of where to rotate.
         * @returns {object} rotated polygon.
         */
        rotate(theta, offsetVector) {
            //Precalculate the sin & cos values of theta.
            let sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);
            
            //Normalize the offset.
            offsetVector = offsetVector || new hamonengine.geometry.vector2(0, 0);

            //2d Rotation Matrix
            //x' = x * cos(θ) - y * sin(θ) = x*0 - y*1 = -y
            //y' = x * sin(θ) + y * cos(θ) = x*1 - y*0 = x
            let newVertices = [];
            for (let i = 0 ; i < this.vertices.length; i++) {
                //Adjust/translate the vertex based on the offset.
                let xOffset = this.vertices[i].x - offsetVector.x;
                let yOffset = this.vertices[i].y - offsetVector.y;

                //Perform the rotation on each vertex.
                x = (xOffset * cosTheta) - (yOffset * sinTheta);
                y = (xOffset * sinTheta) + (yOffset * cosTheta);
                
                //Restore the vertex's position.
                newVertices.push(new hamonengine.geometry.vector2(x + offsetVector.x, y + offsetVector.y));
            };

            //Return a new instance of the polygon as to preserve the original.
            return new hamonengine.geometry.polygon({
                vertices: newVertices
            });
        }
        /**
         * Creates and returns a new instance of a rotated polygon around the center.
         * @param {number} theta angle to rotate in radians.
         * @returns {object} rotated polygon.
         */
        rotateAtCenter(theta) {
            return this.rotate(theta, this.center)
        }
        /**
         * Creates and returns a new instance of a scaled polygon.
         * @param {object} scaleVector a scale vector (hamonengine.geometry.vector2) to apply to the polygon.
         * @returns {object} scaled polygon.
         */
        scale(scaleVector) {
            //Normalize the scaleVector.
            scaleVector = scaleVector || new hamonengine.geometry.vector2(0, 0);

            let newVertices = [];
            for (let i = 0; i < this.vertices.length; i++) {
                newVertices.push(this.vertices[i].multiplyVector(scaleVector));
            };

            //Return a new instance of the polygon as to preserve the original.
            return new hamonengine.geometry.polygon({
                vertices: newVertices
            });
        }
        /**
         * Calculates a series of edges from a collection of vertices.
         * @param {array} vertices a collection to generate edges from.
         * @returns {array} a collection of edges.
         */
        static calcEdges(vertices=[]) {
            let edges = [];
            for(let i = 0; i < vertices.length; i++) {
                let destination = vertices[(i + 1) % vertices.length];
                edges.push(destination.subtract(vertices[i]));
            }

            return edges;
        }
        /**
         * Calculate a series of normals from a collection of edges.
         * @param {array} edges a collection to generate normals from.
         * @returns {array} a collection of normals.
         */
        static calcNormals(edges=[]) {
            return edges.map(edge => edge.normal());
        }
        /**
         * Calculates the center of the polygon.
         * @param {array} vertices a collection to generate the center from.
         * @returns {object} a vector (hamonengine.geometry.vector2) containing the center of the polygon.
         */
        static calcCenter(vertices=[]) {
            let xMax = NaN, xMin = NaN;
            let yMax = NaN, yMin = NaN;
            for (let i = 0; i < vertices.length; i++) {
                xMax = xMax > vertices[i].x ? xMax : vertices[i].x;
                xMin = xMin < vertices[i].x ? xMin : vertices[i].x;
                yMax = yMax > vertices[i].y ? yMax : vertices[i].y;
                yMin = yMin < vertices[i].y ? yMin : vertices[i].y;
            };

            return new hamonengine.geometry.vector2((xMax - xMin) / 2, (yMax - yMin) / 2);
        }
        /**
         * Calculates and returns type of the shape whether it is convex or concave
         * @param {array} vertices a collection to generate the shape type from.
         * @returns {number} a value that determines (SHAPE_TYPE) whether concave or convex.
         */
        static calcShapeType(vertices=[]) {
            let signCounter = 0;
            for(let i = 0; i < vertices.length; i++) {
                
                //Get three vertices so we can generate two consective vectors in our polygon.
                //NOTE: These vertices are being stored as vectors, as to provide easy access to the vector help methods.
                let p1 = vertices[i];
                let p2 = vertices[(i + 1) % vertices.length];
                let p3 = vertices[(i + 2) % vertices.length];

                //Create our first two consecutive vectors (P1->P2, P2->P3).
                let v1 = p2.subtract(p1);
                let v2 = p3.subtract(p2);

                //Calculate the cross-product between our two vectors.
                //NOTE: Since these are 2d vectors, the results will be stored in the z-coordinate in a vector3 (hamonengine.geometry.vector3).
                signCounter += v2.crossProduct(v1).z > 0 ? 1 : -1;
            }

            //If the number of sign counter addes up to the number of vertices then the sign did not change.
            //Convex: If the sign was consistent for all calculated cross-product vectors.
            //Concave: If the sign differred for 1 or more cross-product vectors.
            return vertices.length === signCounter ? SHAPE_TYPE.CONVEX : SHAPE_TYPE.CONCAVE;
        }
    }
})();