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

(function() {
    /**
     * This class represents a 2d object.
     */
    hamonengine.entities.object2d = class {
        constructor(options={}) {
            //Object properties.
            this._name = options.name || '';
            this._boundingShape = options.boundingShape;
            this._width = options.width || 0;
            this._height = options.height || 0;
            this._zindex = options.zindex || 0;
            
            //Movement variables
            this._movementRate = options.movementRate || 0;
            this._position = options.position || new hamonengine.geometry.vector2();
            this._direction = options.direction || new hamonengine.geometry.vector2();

            //Transformation variables.
            this._theta = options.theta || 0.0;

            //Determine if the object is solid or transparent.
            this._isSolid = (options.isSolid === undefined) ? true : false;

            //Determine if the object is moveable.  If it is not, the movement process is excluded.
            this._isMoveable = (options.isMoveable === undefined) ? false : true;

            //Determine if the object is visible, it is visible by default.
            this._isVisible = (options.isVisible === undefined) ? true : false;

            console.debug(`[hamonengine.entities.object2d.constructor] Name: ${this.name}`);
            console.debug(`[hamonengine.entities.object2d.constructor] Starting Dimensions {Width: ${this.width}, Height: ${this.height}}`);
            console.debug(`[hamonengine.entities.object2d.constructor] Starting Direction: {x: ${this.direction.x}, y: ${this.direction.y}}`);
            console.debug(`[hamonengine.entities.object2d.constructor] Starting Position: {x: ${this.position.x}, y: ${this.position.y}}`);
            console.debug(`[hamonengine.entities.object2d.constructor] Starting Theta: ${this.theta}`);
            console.debug(`[hamonengine.entities.object2d.constructor] Movement Rate: ${this._movementRate}`);
            console.debug(`[hamonengine.entities.object2d.constructor] isSolid: ${this.isSolid}`);
            console.debug(`[hamonengine.entities.object2d.constructor] isMoveable: ${this.isMoveable}`);
            console.debug(`[hamonengine.entities.object2d.constructor] isVisible: ${this.isVisible}`);
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
        get isMoveable() {
            return this._isMoveable;
        }
        /**
         * Returns true if the object's state is solid.
         */
        get isSolid() {
            return this._isSolid;
        }
        /**
         * Returns true if the object is visible.
         */
        get isVisible() {
            return this._isVisible;
        }
        /**
         * Enables/Disables the visibility of the object.
         */
        set isVisible(v) {
            this._isVisible = v;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Moves the object.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         * @param {Object} movementVector the movement vector to move the object. 
         */
        move(elapsedTimeInMilliseconds, movementVector=null) {
            if (this.isMoveable) {
                //Calculate the movement vector if one is not passed.
                movementVector = movementVector || this.calcMove(elapsedTimeInMilliseconds);
                this.position.x += movementVector.x;
                this.position.y += movementVector.y;
            }
        }
        /**
         * Calculates the movement of the object, without moving it, based on its direction vector.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        calcMove(elapsedTimeInMilliseconds) {
            return new hamonengine.geometry.vector2(
                this._movementRate * this.direction.x * elapsedTimeInMilliseconds,
                this._movementRate * this.direction.y * elapsedTimeInMilliseconds
            );
        }
        /**
         * Determines if the object has collided with noather.
         * @param {Object} object to calculate the collision with.
         * @return {number} a COLLISION_TYPES 
         */
        isCollision(object) {
            const translatedShape = this.boundingShape.translate(this.position);
            return translatedShape.isCollision(object);
        }
        /**
         * Determines if the targetObject is contained in this object's bounding shape and returns a MTV (Minimum Translation Vector).
         * The direction is a normalized vector in the direction the targetObject is extending towards.
         * For example if the targetObject extends beyond the left side of this object then the x-cooridnate will be -1.
         * If the targetObject extends beyond the bottom side of this object then the y-cooridnate will be +1.
         * @param {*} targetObject to evaluate
         * @return {Object} a (hamonengine.geometry.vector2) that provides a direction of where the shape is outside.
         */
        isContained(targetObject) {
            return this.boundingShape.isContained(targetObject.position, targetObject.boundingShape);
        }
        /**
         * Draws the object at the specific location, width & height.
         * @param {Object} layer to render the cell's objects to.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         */
        render(layer, elapsedTimeInMilliseconds) {
            
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