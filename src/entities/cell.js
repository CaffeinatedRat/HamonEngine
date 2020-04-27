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

hamonengine.entities = hamonengine.entities || {};

(function() {
    hamonengine.entities.cell = class extends hamonengine.entities.object2d {
        constructor(options) {
            options = options || {};
            super(options);

            //Cells are stationary
            this._movementRate = 0;
            this._direction = new hamonengine.geometry.vector2();
            this._theta = 0;

            //Maintain a collection of child cells.
            this._children = [];

            //Maintain a collection of objects.
            this._objects = [];

            //Z-index sorter, using RHS, the z-axis is positive toward the camera.
            // Painter's Algorithm: We want to draw items ascending, with the lowest z-axis coordinate first.
            this._zIndexSorter = new hamonengine.math.sort({
                compareFunc: (a,b) => a === b ? 0 : (a.zIndex < b.zIndex ? -1 : 1)
            });
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns the children for this cell.
         */
        get children() {
            return this._children;
        }
        /**
         * Returns the objects for this cell.
         */
        get objects() {
            return this._objects;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Adds a child to the collection.
         * @param {object} child to add to the collection.
         */
        addChild(child) {
            this._children.push(child);
        }
        /**
         * Adds a child to the collection.
         * @param {object} object to add to the collection.
         */
        addObject(object) {
            this._objects.push(object);
        }
        /**
         * Adds a collection child to the collection.  This must be an array.
         * @param {object} objects to add to the collection.
         */
        addObjects(objects) {
            objects.forEach(object => {
                this._objects.push(object);
            });
        }
        /**
         * Processes all of the objects within the cell.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        process(elapsedTimeInMilliseconds) {
            if (this.objects) {

                //Keep a collection of collisions that have already occurred.
                //If we imagine each object as a point in undirected graph, then each edge is a computed collision.
                //If we detect a known collision edge then we can skip any redundant collision calculation.
                let collisionsEdges = new Set();
                this.objects.forEach((object)=> {

                    if (object.isMoveable) {
                        object.move(elapsedTimeInMilliseconds);
                        
                        //Determine if the object is outside of the cell and correct it if necessary.
                        if (this.isSolid) {

                            //Get the adjusted coordinates.
                            let adjustedPosition = hamonengine.geometry.vector2.clone(object.position);
                            let collisionVector = this.isObjectInside(object);
                            if (collisionVector.x < 0) {
                                adjustedPosition.x = this.boundingShape.x - object.boundingShape.x;
                            }
                            else if (collisionVector.x > 0) {
                                adjustedPosition.x = this.boundingShape.width - object.boundingShape.right;
                            }

                            if (collisionVector.y < 0) {
                                adjustedPosition.y = this.boundingShape.y - object.boundingShape.y;
                            }
                            else if (collisionVector.y > 0) {
                                adjustedPosition.y = this.boundingShape.height - object.boundingShape.bottom;
                            }

                            //Handle an environmental collision and stop processing if false is returned.
                            if (!object.onEnvironmentCollision(adjustedPosition, this)) {
                                return;
                            }
                        }
                    }

                    //Handle collision with siblings.
                    //TimeComplexity: All Cases -- O(n^2)
                    this.objects.forEach((siblingObject)=> {
                        //Ignore the current object.
                        if (object !== siblingObject) {

                            //Determine if we've already calculated the the collision between these two objects.
                            let edgeName = `${object.name}->${siblingObject.name}`;
                            
                            //Calculate the collision between two objects only once.
                            if (!collisionsEdges.has(edgeName)) {

                                //Determine if this object has collided with its sibling.
                                if (object.isObjectCollision(siblingObject) !== COLLISION_TYPES.NONE) {
                                    console.log(`${object.name} collides with: ${siblingObject.name}`);
                                }

                                collisionsEdges.add(edgeName);
                                //Since the edgeName is a directed edge, we need to create the inverse to create an undirected edge.
                                collisionsEdges.add(`${siblingObject.name}->${object.name}`);
                            }
                        }
                    });
                });
            }
        }
        /**
         * Renders all of the objects within the cell.
         * @param {object} layer to render the cell's objects to.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        render(layer, elapsedTimeInMilliseconds) {
            if (this.objects) {
                //Sort objects by their z-index to perform the painter's algorithm.
                this._zIndexSorter.quickSort(this._objects);
                this.objects && this.objects.forEach((object)=> {
                    object.render(layer, elapsedTimeInMilliseconds);
                });
            }
        }
    }
})();