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
     * This class represents a 2d object.
     */
    hamonengine.entities.object2d = class {
        constructor(options = {}) {

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.entities.object2d) {
                options = {
                    name: options._name,
                    boundingShape: options._boundingShape,
                    width: options._width,
                    height: options._height,
                    zinddex: options._zindex,
                    movementRate: options._movementRate,
                    position: options._position,
                    direction: options._direction,
                    theta: options._theta,
                    scale: options._scale,
                    state: options._state
                };
            }

            //Object properties.
            this._name = options.name || '';
            this._boundingShape = options.boundingShape;
            this._width = options.width || 0;
            this._height = options.height || 0;
            this._zindex = options.zindex || 0;

            //Movement variables
            this._movementRate = options.movementRate || 0;
            this._position = options.position || new hamonengine.math.vector2();
            this._direction = options.direction || new hamonengine.math.vector2();
            this._transformDirection = options.transformDirection || new hamonengine.math.vector2();

            //Transformation variables.
            this._theta = options.theta || 0.0;
            this._scale = options.scale || 1.0;

            //Determines the state of the object whether it solid, moveable, and/or visible.
            if (options.state !== undefined) {
                this._state = options.state;
            }
            else {
                this._state = 0;
                this._state = this._state | (options.isSolid ? OBJECT_STATE_FLAG.SOLID : OBJECT_STATE_FLAG.NONE);
                this._state = this._state | (options.isMovable ? OBJECT_STATE_FLAG.MOVEABLE : OBJECT_STATE_FLAG.NONE);
                this._state = this._state | (options.isVisible ? OBJECT_STATE_FLAG.VISIBLE : OBJECT_STATE_FLAG.NONE);
            }

            if (hamonengine.debug) {
                console.debug(`[hamonengine.entities.object2d.constructor] Name: ${this.name}`);
                console.debug(`[hamonengine.entities.object2d.constructor] Starting Dimensions {Width: ${this.width}, Height: ${this.height}}`);
                console.debug(`[hamonengine.entities.object2d.constructor] Starting Direction: {x: ${this.direction.x}, y: ${this.direction.y}}`);
                console.debug(`[hamonengine.entities.object2d.constructor] Starting Position: {x: ${this.position.x}, y: ${this.position.y}}`);
                console.debug(`[hamonengine.entities.object2d.constructor] Starting Theta: ${this.theta}`);
                console.debug(`[hamonengine.entities.object2d.constructor] Movement Rate: ${this._movementRate}`);
                console.debug(`[hamonengine.entities.object2d.constructor] isSolid: ${this.isSolid}`);
                console.debug(`[hamonengine.entities.object2d.constructor] isMovable: ${this.isMovable}`);
                console.debug(`[hamonengine.entities.object2d.constructor] isVisible: ${this.isVisible}`);
            }
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
         * Assigns the position as a vector2.
         */
        set position(v) {
            this._position = v;
        }
        /**
         * Returns the direction as a vector2.
         */
        get direction() {
            return this._direction;
        }
        /**
         * Returns the angle of the object rotation in radians.
         */
        get theta() {
            return this._theta || 0.0;
        }
        /**
         * Assigns the angle of the object rotation in radians.
         */
        set theta(v) {
            this._theta = v;
        }
        /**
         * Returns the scalar scale of the object.
         */
        get scale() {
            return this._scale || 1.0;
        }
        /**
         * Assigns the scalar scale value.
         */
        set scale(v) {
            this._scale = v;
        }
        /**
         * Returns the width of the object.
         */
        get width() {
            return this._width;
        }
        /**
         * Returns the height of the object.
         */
        get height() {
            return this._height;
        }
        /**
         * Returns the z-index that can be used in evaluating depth for things such as a painter's algorithm.
         */
        get zIndex() {
            return this._zindex;
        }
        /**
         * Assigns the z-index that can be used in evaluating depth for things such as a painter's algorithm.
         */
        set zIndex(v) {
            this._zindex = v;
        }
        /**
         * Returns the bounding shape for the object, used in collision detection.
         */
        get boundingShape() {
            //Load this on demand.
            //If the boundingShape was not defined on creation then create one by default, on demand, to use the width & height of the object2d.
            this._boundingShape = this._boundingShape || new hamonengine.geometry.rect(0, 0, this.width, this.height);
            return this._boundingShape;
        }
        /**
         * Returns true if the object is moveable.
         */
        get isMovable() {
            return (this._state & OBJECT_STATE_FLAG.MOVEABLE) === OBJECT_STATE_FLAG.MOVEABLE;
        }
        /**
         * Returns true if the object's state is solid.
         */
        get isSolid() {
            return (this._state & OBJECT_STATE_FLAG.SOLID) === OBJECT_STATE_FLAG.SOLID;
        }
        /**
         * Returns true if the object is visible.
         */
        get isVisible() {
            return (this._state & OBJECT_STATE_FLAG.VISIBLE) === OBJECT_STATE_FLAG.VISIBLE;
        }
        /**
         * Enables/Disables the visibility of the object.
         */
        set isVisible(v) {
            this._state = v ? (this._state | OBJECT_STATE_FLAG.VISIBLE) : (this._state ^ OBJECT_STATE_FLAG.VISIBLE);
        }
        /**
         * A helper property that returns the hold state for rotating.
         */
        get isHoldRotate() {
            return this._transformDirection.x;
        }
        /**
         * A helper property that returns the hold state for scaling.
         */
        get isHoldScale() {
            return this._transformDirection.y;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Moves the object.
         * This method supports chaining.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         * @param {Object} movementVector the movement vector to move the object. 
         */
        move(elapsedTimeInMilliseconds, movementVector = null) {
            if (this.isMovable) {
                //Calculate the movement vector if one is not passed.
                movementVector = movementVector || this.calcMove(elapsedTimeInMilliseconds);
                this.position.x += movementVector.x;
                this.position.y += movementVector.y;
            }

            return this;
        }
        /**
         * Calculates the movement of the object, without moving it, based on its direction vector.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        calcMove(elapsedTimeInMilliseconds) {
            return new hamonengine.math.vector2(
                this._movementRate * this.direction.x * elapsedTimeInMilliseconds,
                this._movementRate * this.direction.y * elapsedTimeInMilliseconds
            );
        }
        /**
         * Determines if the object has collided with another and takes into account the position, rotation angle & scale.
         * @param {object} object object to test against.
         * @param {object} direction optional paramter used to help determine the direction of the MTV.
         * @returns {object} a MTV (Minimum Translation Vector) that determines where collision occurs and is not a unit vector.
         */
        isCollision(object, direction = new hamonengine.math.vector2()) {
            const translation = this.boundingShape.translate(this.position);
            const rotation = translation.rotateAtCenter ? translation.rotateAtCenter(this.theta) : translation;
            const scale = rotation.scaleAtCenter ? rotation.scaleAtCenter(new hamonengine.math.vector2(this.scale, this.scale)) : rotation;
            return scale.isCollision(object, direction);
        }
        /**
         * Determines if the targetObject is contained in this object's bounding shape and returns a MTV (Minimum Translation Vector).
         * The direction is a normalized vector in the direction the targetObject is extending towards.
         * For example if the targetObject extends beyond the left side of this object then the x-cooridnate will be -1.
         * If the targetObject extends beyond the bottom side of this object then the y-cooridnate will be +1.
         * @param {*} targetObject to evaluate
         * @return {Object} a (hamonengine.math.vector2) that provides a direction of where the shape is outside.
         */
        isContained(targetObject) {
            return this.boundingShape.isContained(targetObject.position, targetObject.boundingShape);
        }
        /**
         * A helper method for moving the object to the left continuously.
         * This method supports chaining.
         */
        holdLeft() {
            this.direction.x = -1;
            return this;
        }
        /**
         * A helper method for moving the object to the right continuously.
         * This method supports chaining.
         */
        holdRight() {
            this.direction.x = 1;
            return this;
        }
        /**
         * A helper method for moving the object to the up continuously.
         * This method supports chaining.
         */
        holdUp() {
            this.direction.y = -1;
            return this;
        }
        /**
         * A helper method for moving the object to the down continuously.
         * This method supports chaining.
         */
        holdDown() {
            this.direction.y = 1;
            return this;
        }
        /**
         * A helper method for stopping horizontal movement.
         * This method supports chaining.
         */
        releaseHorizontal() {
            this.direction.x = 0;
            return this;
        }
        /**
         * A helper method for stopping vertical movement.
         * This method supports chaining.
         */
        releaseVertical() {
            this.direction.y = 0;
            return this;
        }
        /**
         * A helper method for rotating.
         * This method supports chaining.
         * @param {boolean} state performs a scaling operation if true.
         * @param {number} direction to use when rotating where 1 is clockwise and -1 is counter-clockwise.
         */
        holdRotate(state, direction = 1) {
            this._transformDirection.x = state ? direction : 0;
            return this;
        }
        /**
         * A helper to reset rotating.
         * This method supports chaining.
         */
        resetRotate() {
            this._transformDirection.x = 0;
            this.theta = 0;
            return this;
        }
        /**
         * A helper method for scaling.
         * This method supports chaining.
         * @param {boolean} state performs a scaling operation if true.
         * @param {number} direction to use when scaling where 1 is to scale up and -1 is to scale down.
         */
        holdScale(state, direction = 1) {
            this._transformDirection.y = state ? direction : 0;
            return this;
        }
        /**
         * A helper to reset scaling.
         * This method supports chaining.
         */
        resetScale() {
            this._transformDirection.y = 0;
            this.scale = 1.0;
            return this;
        }
        /**
         * Resets the object orientation.
         */
        reset() {
            return this.resetRotate().resetScale().releaseHorizontal().releaseVertical();
        }
        /**
         * Outputs the objects as a string.
         */
        toString() {
            return `{name: '${this.name}', position: '${this.position}'}`;
        }
        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        /**
         * An event that is triggered when the object has a collision with its environment.
         * @param {Object} position a psotion vector that has been adjusted to keep the object within the environment.
         * @param {Object} environmentObject the collision is occuring within. 
         * @returns {boolean} false to halt all processing.
         */
        onEnvironmentCollision(position, environmentObject) {
            this._position = position;
            return true;
        }
        onObjectCollision(x, y, object) {

        }
    }
})();