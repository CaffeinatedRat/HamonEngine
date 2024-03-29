/**
* Copyright \(c\) 2020-2024, CaffeinatedRat.
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
     * This class represents a sprite object
     */
    hamonengine.entities.spriteObject = class extends hamonengine.entities.object2d {
        constructor(options = {}) {
            super(options);

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.entities.spriteObject) {
                options = {
                    sprite: options._sprite,
                    directionBasis: options._directionBasis
                };
            }

            this._sprite = options.sprite || new hamonengine.graphics.sprites.sprite();

            //Determines if the sprite rotates 0 or 180 (mirrors) when moving left or right.
            //Determines if the sprite rotates 90 or -90 when moving up and down.
            this._faceAxisOnMove = options.faceAxisOnMove !== undefined ? options.faceAxisOnMove : (OBJECT_FACE_DIRECTION.XAXIS | OBJECT_FACE_DIRECTION.YAXIS);

            //Determine if the direction basis used to determine which way the sprite faces when mirroring or rotating.
            //By default the sprite will always point towards +x, where mirroring it will point towards -x when moving horizontally.
            //By default the sprite will always point towards -y (y is inverted on the canvas with 0 at the top, and height at the bottom), where rotating it will point towards +y when moving vertically.
            this._directionBasis = options.directionBasis || new hamonengine.math.vector2(-1, -1);
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the sprite.
         */
        get sprite() {
            return this._sprite;
        }
        /**
         * Assigns a new sprite.
         */
        set sprite(v) {
            this._sprite = v;
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
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Moves the object.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         * @param {Object} movementVector the movement vector to move the object. 
         */
        move(elapsedTimeInMilliseconds, movementVector = null) {
            super.move(elapsedTimeInMilliseconds, movementVector);

            //Mirror the sprite based on the direction.
            if ((this.faceAxisOnMove & OBJECT_FACE_DIRECTION.XAXIS) === OBJECT_FACE_DIRECTION.XAXIS) {
                if (this.direction.x !== 0) {
                    //Reset the rotation when moving left or right.
                    this.sprite?.mirror(this.direction.x === this._directionBasis.x).rotate();
                }
            }

            //Rotate the sprite based on the direction so it looks like it is facing up or down.
            if ((this.faceAxisOnMove & OBJECT_FACE_DIRECTION.YAXIS) === OBJECT_FACE_DIRECTION.YAXIS) {
                if (this.direction.y !== 0) {
                    this.sprite?.rotate(this.direction.y === this._directionBasis.y ? Math.PI_2 : -Math.PI_2);
                }
            }

            return this;
        }
        /**
         * Resets the sprite to it's original orientation.
         */
        reset() {
            //Reset the rotation when moving left or right.
            return this.sprite?.rotate().mirror(false);
        }
        /**
         * Determines if this sprite object collides with the other sprite object.
         * @param {Object} spriteObject to evaluated based on the coordinates.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollision(spriteObject) {
            if (this.isSolid) {
                let direction = new hamonengine.math.vector2();
                if (spriteObject instanceof hamonengine.entities.shapeObject && spriteObject.isSolid) {
                    direction = spriteObject.position.subtract(this.position);
                    spriteObject = spriteObject.shape.translate(spriteObject.position);
                }

                return super.isCollision(spriteObject, direction);
            }

            return new hamonengine.math.vector2();
        }
        /**
         * Draws the sprite object.
         * @param {Object} layer to render the cell's objects to.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        render(layer, elapsedTimeInMilliseconds) {
            this.sprite?.draw(layer, elapsedTimeInMilliseconds, this.position.x, this.position.y, this.width, this.height);
        }
        /**
         * Releases resources.
         */
        release() {
            if (this.sprite) {
                this.sprite.release();
                delete this._sprite;
            }
        }
    }
})();