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

    const COLLISION_TYPES = {
        NONE: 0,
        EDGE: 1,
        INSIDE: 2
    };

    hamonengine.entities.object2d = class {
        constructor(options) {
            options = options || {};

            //Image properties.
            this._name = options.name || '';
            this._boundingBox = options.boundingBox;
            
            this._width = options.width;
            this._height = options.height;
            
            //Movement variables
            this._movementRate = options.movementRate || 0;
            this._position = options.position || new hamonengine.geometry.vector2();
            this._direction = options.direction || new hamonengine.geometry.vector2();

            //Transformation variables.
            this._theta = options.theta || 0.0;

            //Determine if the object is solid or transparent.
            this._isSolid = (options.isSolid === undefined) ? false : true; 

            hamonengine.util.logger.debug(`[hamonengine.entities.object2d.constructor] Starting Dimensions {Width: ${this.width}, Height: ${this.height}}`);
            hamonengine.util.logger.debug(`[hamonengine.entities.object2d.constructor] Starting Direction: {x: ${this.direction.x}, y: ${this.direction.y}}`);
            hamonengine.util.logger.debug(`[hamonengine.entities.object2d.constructor] Starting Position: {x: ${this.position.x}, y: ${this.position.y}}`);
            hamonengine.util.logger.debug(`[hamonengine.entities.object2d.constructor] Movement Rate: ${this._movementRate}`);
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the object's name.
         */
        get name() {
            return this._name;
        }
        /**
         * Returns the position as a vector2.
         */
        get position() {
            return this._position;
        }
        /**
         * Returns the direction as a vector2.
         */
        get direction () {
            return this._direction;
        }
        /**
         * Returns the angle of the sprite's rotation in radians.
         */
        get theta() {
            return this._theta || 0.0;
        }
        /**
         * Returns the width of the object.
         */
        get width () {
            return this._width;
        }
        /**
         * Returns the height of the object.
         */
        get height() {
            return this._height;
        }
        /**
         * Returns the bounding box for the object, used in collision detection.
         */
        get boundingBox() {
            //Load this on demand.
            //If the boundingbox was not defined on creation then create one by default, on demand, to use the width & height of the object2d.
            this._boundingBox = this._boundingBox || new hamonengine.geometry.rect({ x: 0, y: 0, width: this.width, height: this.height});
            return this._boundingBox;
        }
        /**
         * Returns true if the object's state is solid.
         */
        get isSolid() {
            return this._isSolid;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Moves the sprite.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        move(elapsedTimeInMilliseconds) {
            this.position.x += this._movementRate * this.direction.x * elapsedTimeInMilliseconds;
            this.position.y += this._movementRate * this.direction.y * elapsedTimeInMilliseconds;
        }
        /**
         * Determines if the x and y coordinates are inside the bounding box of the object and its current position.
         * @param {number} x 
         * @param {number} y 
         * @returns {number} a COLLISION_TYPES 
         */
        isCollision(x, y) {
            //Negate the position of the object.
            x -= this.position.x;
            y -= this.position.y;
            //Determine if the coordinates are in the bounding box.
            if (( x === 0 || x === this.boundingBox.width) && (y === 0 || y === this.boundingBox.height)) {
                hamonengine.util.logger.debug(`[hamonengine.entities.object2d.isCollision] EDGE: (${x}, ${y})`);
                return COLLISION_TYPES.EDGE;
            }
            if (x > 0 && x < this.boundingBox.width && y > 0 && y < this.boundingBox.height) {
                hamonengine.util.logger.debug(`[hamonengine.entities.object2d.isCollision] Inside: (${x}, ${y})`);
                return COLLISION_TYPES.INSIDE;
            }

            return COLLISION_TYPES.NONE;
        }
        /**
         * Draws the object at the specific location, width & height.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        render(elapsedTimeInMilliseconds) {

        }
    }
})();