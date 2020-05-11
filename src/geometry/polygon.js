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
    hamonengine.geometry.polygon = class {
        constructor(options) {
            options = options || {};
            this._vertices = options.vertices || [];
            this._edges = [];
            this._normals = [];
            this._dirtyEdges = true;
            this._dirtyNormals = true;
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
            if (this._dirtyEdges)
            {
                this._edges = hamonengine.geometry.polygon.calcEdges(this.vertices);
                this._dirtyEdges = false;
            }

            return this._edges;
        }
        /**
         * Returns the normals of this polygon.
         */
        get normals() {
            if (this._dirtyNormals)
            {
                this._normals = hamonengine.geometry.polygon.calcNormals(this.edges);
                this._dirtyNormals = false;
            }

            return this._normals;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Outputs the polygon's vertices as a string.
         */
        toString() {
            let vertexString = '';
            this._vertices.forEach(vertex => {
                vertexString += `${vertexString !== '' ? ',' : ''}${vertex.toString()}`;
            });
            return `[${vertexString}]`;
        }
        /**
         * Adds a vertex to the polygon.
         * @param {object} vertex
         */
        addVertex(vertex) {
            this._vertices.push(vertex);
            this._dirtyEdges = true;
            this._dirtyNormals = true;
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
    }
})();