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

hamonengine.entities = hamonengine.entities || {};

(function () {
    /**
     * This class represents a shape object
     */
    hamonengine.entities.shapeObject = class extends hamonengine.entities.object2d {
        constructor(options = {}) {
            super(options);

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.entities.shapeObject) {
                options = {
                    shape: options._shape
                };
            }

            this._shape = options.shape || new hamonengine.geometry.rect();

            //Determines if the sprite rotates 0 or 180 (mirrors) when moving left or right.
            //Determines if the sprite rotates 90 or -90 when moving up and down.
            this._faceAxisOnMove = options.faceAxisOnMove !== undefined ? options.faceAxisOnMove : (OBJECT_FACE_DIRECTION.XAXIS | OBJECT_FACE_DIRECTION.YAXIS);

            //If the boundingShape is not defined then use the defined shape.
            this._hasBoundingShape = options.boundingShape;
            this._boundingShape = options.boundingShape || this._shape;

            //Determine if the direction basis used to determine which way the shape faces when mirroring or rotating.
            //By default the shape will always point towards +x, where mirroring it will point towards -x when moving horizontally.
            //By default the shape will always point towards -y (y is inverted on the canvas with 0 at the top, and height at the bottom), where rotating it will point towards +y when moving vertically.
            this._directionBasis = options.directionBasis || new hamonengine.math.vector2(-1, -1);

            this._mirroredState = false;

            if (hamonengine.debug) {
                !this._hasBoundingShape && console.debug(`[hamonengine.entities.shapeObject.constructor] BoundingShape not found, using shape dimensions.`);
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the shape.
         */
        get shape() {
            return this._shape;
        }
        /**
         * Assigns a new shape.
         */
        set shape(v) {
            this._shape = v;

            //If a boundingSahpe was not provided then generate a new one based on the defined shape.
            if (!this._hasBoundingShape) {
                this._boundingShape = this.shape;
            }
        }
        /**
         * Gets the faceAxisOnMove.
         */
        get faceAxisOnMove() {
            return this._faceAxisOnMove;
        }
        /**
         * Assigns the faceAxisOnMove.
         */
        set faceAxisOnMove(v) {
            this._faceAxisOnMove = v;
        }
        /**
         * Returns true if the shape is a polygon.
         */
        get isPolygon() {
            return this.shape instanceof hamonengine.geometry.polygon;
        }
        /**
         * Returns true if the shape is a rect.
         */
        get isRect() {
            return this.shape instanceof hamonengine.geometry.rect;
        }
        /**
         * Returns true if the shape is a lineSegment.
         */
        get isLine() {
            return this.shape instanceof hamonengine.geometry.lineSegment;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Resets the shape to it's original orientation.
         */
        reset() {
            this._mirroredState = false;
            return super.reset();
        }
        /**
         * Helper method for adding a new vertex to the shape.
         * NOTE: Adding a vertex to a rect object will automatically promote it to a polygon.
         * @param {number} x
         * @param {number} y
         */
        addVertex(x, y) {
            //Adding another vertext to a rect automatically promotes it to a polygon.
            (this.isPolygon ? this._shape : this._shape = this._shape.toPolygon()).addVertex(x, y);
            return this;
        }
        /**
         * Moves the object.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         * @param {Object} movementVector the movement vector to move the object. 
         */
        move(elapsedTimeInMilliseconds, movementVector = null) {
            super.move(elapsedTimeInMilliseconds, movementVector);

            if (this.isPolygon) {
                if ((this.faceAxisOnMove & OBJECT_FACE_DIRECTION.XAXIS) === OBJECT_FACE_DIRECTION.XAXIS) {
                    //Don't change the state unless there is a specific direction.
                    if (this.direction.x !== 0) {
                        this._mirroredState = this.direction.x === this._directionBasis.x;
                        this.theta = 0;
                    }
                }

                if ((this.faceAxisOnMove & OBJECT_FACE_DIRECTION.YAXIS) === OBJECT_FACE_DIRECTION.YAXIS) {
                    //Don't change the state unless there is a specific direction.
                    if (this.direction.y !== 0) {
                        this.theta = this.direction.y === this._directionBasis.y ? Math.PI_2 : -Math.PI_2;
                    }
                }
            }

            return this;
        }
        /**
         * 
         * @param {*} elapsedTimeInMilliseconds 
         * @returns 
         */
        transformShape(elapsedTimeInMilliseconds) {
            //Handle rotation & scale.
            this.theta = ((this.theta + (this.isHoldRotate * elapsedTimeInMilliseconds / 1000 * Math.PI / 4)) % Math.PI2);
            this.scale = (this.scale + (this.isHoldScale * elapsedTimeInMilliseconds / 1000 * 0.10));

            const translation = this.shape.translate(this.position);

            if (this.isPolygon) {
                const mirror = translation.mirror ? translation.mirror(this._mirroredState) : translation;
                const rotation = mirror.rotateAtCenter ? mirror.rotateAtCenter(this.theta) : mirror;
                return rotation.scaleAtCenter ? rotation.scaleAtCenter(new hamonengine.math.vector2(this.scale, this.scale)) : rotation;
            }

            return translation;
        }
        /**
         * Determines if this shape collides with the other shape.
         * @param {Object} shapeObject to evaluated based on the coordinates.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollision(shapeObject) {
            if (this.isSolid) {

                let direction = new hamonengine.math.vector2();
                if (shapeObject instanceof hamonengine.entities.shapeObject && shapeObject.isSolid) {
                    direction = shapeObject.position.subtract(this.position);
                    shapeObject = shapeObject.shape.translate(shapeObject.position);
                }

                return super.isCollision(shapeObject, direction);
            }

            return new hamonengine.math.vector2();
        }
        /**
         * Draws the sprite object.
         * @param {Object} layer to render the cell's objects to.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        render(layer, elapsedTimeInMilliseconds, { lineWidth = 2, color = 'blue', drawNormals = false } = {}) {
            if (this.shape) {
                layer.drawShape(this.transformShape(elapsedTimeInMilliseconds), 0, 0, { lineWidth, color, drawNormals });
            }
        }
    }
})();