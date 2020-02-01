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

    hamonengine.entities.object2d = class {
        constructor(options) {
            options = options || {};

            //Image properties.
            this._name = options.name || '';
            this._boundingBox = options.boundingBox;
            
            this._width = options.width;
            this._height = options.height;
            this._movementRate = options.movementRate || 0;
            
            this._position = options.position || new hamonengine.geometry.vector2();
            this._direction = options.direction || new hamonengine.geometry.vector2();

            //Transformation variables.
            this._theta = options.theta || 0.0;

            hamonengine.util.logger.debug(`[hamonengine.entities.actor.constructor] Starting Dimensions {Width: ${this.width}, Height: ${this.height}}`);
            hamonengine.util.logger.debug(`[hamonengine.entities.actor.constructor] Starting Direction: {x: ${this.direction.x}, y: ${this.direction.y}}`);
            hamonengine.util.logger.debug(`[hamonengine.entities.actor.constructor] Starting Position: {x: ${this.position.x}, y: ${this.position.y}}`);
            hamonengine.util.logger.debug(`[hamonengine.entities.actor.constructor] Movement Rate: ${this._movementRate}`);
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
            //If the boundingbox was not defined on creation then create one by default, on demand, to use the width & height of the actor.
            this._boundingBox = this._boundingBox || new hamonengine.geometry.rect({ x: 0, y: 0, width: this.width, height: this.height});
            return this._boundingBox;
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
         * Determins if the x and y coordinates are inside the bounding box of the object and its current position.
         * @param {*} x 
         * @param {*} y 
         */
        isCollision(x, y) {
            //Negate the position of the object.
            x -= this.position.x;
            y -= this.position.y;
            //Determine if the coordinates are in the bounding box.
            return x >= 0 && x <= this._boundingBox.width && y >= 0 && y <= this._boundingBox.height;
        }
        /**
         * Draws the sprite at the specific location, width & height.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        render(elapsedTimeInMilliseconds) {

        }
    }
})();