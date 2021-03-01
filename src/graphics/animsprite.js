/**
* Copyright (c) 2020-2021, CaffeinatedRat.
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

hamonengine.graphics = hamonengine.graphics || {};

(function() {

    /**
     * This class represents a graphical animated sprite object.
     */
    hamonengine.graphics.animsprite = class extends hamonengine.graphics.sprite {
        constructor(options={}) {
            super(options);
            //Handle copy-constructor operations.
            if (options instanceof hamonengine.graphics.animsprite) {
                options = {
                    //Make sure to copy the frames otherwise the old references will linger.
                    frames: options._frames.map(frame => frame.clone()),
                    animationRate: options._animationRate,
                    animationCycles: options._animationCycles
                };
            }

            this._frames = options.frames || [];
            this._animationRate = options.animationRate || 0;
            this._animationCycles = options.animationCycles || -1;

            this._index = 0;
            this._timeSinceLastFrame = 0;
            this._numberOfAnimationCycles = 0;
            this._enableAnimation = true;

            hamonengine.util.logger.debug(`[hamonengine.graphics.animsprite.constructor] Starting Animation Rate: ${this._animationRate}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.animsprite.constructor] Starting Animation Cycle: ${this._animationCycles}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.animsprite.constructor] Starting Index: ${this._index}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.animsprite.constructor] Starting Enable Animation: ${this._enableAnimation}`);
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the animation index.
         */
        get index() {
            return this._index;
        }
        /**
         * Sets the animation index.
         */
        set index(v) {
            this._index = (v % this._frames.length) || 0;
        }
        /**
         * Gets the animation rate in milliseconds.
         */
        get animationRate() {
            return this._animationRate;
        }
        /**
         * Sets the animation rate in milliseconds.
         */
        set animationRate(v) {
            this._animationRate = v;
        }
        /**
         * Gets the number of animation cycles.
         */
        get animationCycles() {
            return this._animationCycles;
        }
        /**
         * Sets the number of animation cycles.
         */
        set animationCycles(v) {
            this._animationCycles = v;
            this._enableAnimation = true;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the sprite.
         */
        clone() {
            return new hamonengine.graphics.animsprite(this);
        }
        /**
         * Starts the animation cycle.
         */
        start() {
            this._enableAnimation = true;
            this._numberOfAnimationCycles = 0;
        }
        /**
         * Stops & resets the animation cycle.
         */
        stop() {
            this._enableAnimation = false;
        }
        /**
         * Toggles the animation state without resetting the animation cycles.
         */
        pause() {
            this._enableAnimation = !this._enableAnimation;
        }
        /**
         * Adds a new frame.
         * @param {Object} frame to add.
         */
        addFrame(frame) {
            hamonengine.util.logger.debug("[hamonengine.graphics.animsprite.animsprite.addFrame]");
            this._frames.push(frame);
        }
        /**
         * Blends the sprite with the specific color with the specific blending operation.
         * @param {number} r red channel ranging from 0-255.
         * @param {number} g green channel ranging from 0-255.
         * @param {number} b blue channel ranging from 0-255.
         * @param {number} a alpha channel ranging from 0-255.
         * @param {number} blendingOps (BLENDING_OPS) blending operation to perform.
         */
        blendColor(r=0, g=0, b=0, a=0, blendingOps=BLENDING_OPS.REPLACE) {
            for(let i = 0 ; i < this._frames.length; i++) {
                this._frames[i].blendColor(r,g,b,a, blendingOps);
            }
        }
        /**
         * Adjusts the channels for each color.
         * @param {number} r red channel ranging from 0.0-1.0.
         * @param {number} g green channel ranging from 0.0-1.0.
         * @param {number} b blue channel ranging from 0.0-1.0.
         * @param {number} a alpha channel ranging from 0.0-1.0.
         */
        adjustColorChannel(r=1.0, g=1.0, b=1.0, a=1.0) {
            for(let i = 0 ; i < this._frames.length; i++) {
                this._frames[i].adjustColorChannel(r,g,b,a);
            }
        }
        /**
         * Draws the sprite at the specific location, width & height.
         * @param {Object} layer to draw upon.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         * @param {number} x coordinate to draw at.
         * @param {number} y cooridnate to draw at.
         * @param {?number} width the optional width of the sprite to scale.
         * @param {?number} height the option height of the sprite to scale.
         */
        draw(layer, elapsedTimeInMilliseconds, x, y, width=null, height=null) {

            //Timestamp accumulator.
            //Since the time elapsed since the lastframe may be smaller than our rate, we need to accumlate it.
            //NOTE: That the time elapsed between frames can be dramatically different between each frame if there is a disruption in the draw loop.
            //For example, if the animtation rate is 30ms but the current elapsed time is 15ms, then we are not ready to switch frames.
            const timeSinceLastFrame = this._timeSinceLastFrame + elapsedTimeInMilliseconds;
            
            //Determine if animation is enabled.
            if (this._enableAnimation) {
                
                //Based on the amount of time that has passed, determine the number of animation frames that have passed.
                const numberOfFrames = parseInt(timeSinceLastFrame / this.animationRate, 10);

                //Calculate the number of animation cycles have elapsed during this animation frame.
                const numberOfAnimationCycles = (this.index + numberOfFrames);

                //Calculate the number of animation cycles if this value is greater than -1.
                if (this.animationCycles > -1) {

                    //Number of animation cycles accumulator.
                    //Keep a count of the total number of animation cycles.
                    this._numberOfAnimationCycles += parseInt(numberOfAnimationCycles / this._frames.length, 10);

                    //Disable the animation if we have exceed the maxiumn number of animation cycles.
                    this._enableAnimation = (this._numberOfAnimationCycles <= this.animationCycles);
                }

                //Set the frame index and wrap it to the beginning if we run out of sprite frames.
                this.index = numberOfAnimationCycles % this._frames.length;
            }

            if (this._frames.length > 0) {
                const currentFrame = this._frames[this.index];
                //Apply any transformations.
                currentFrame.copyProperties(this);
                //Finally draw the sprite at the current frame index.
                currentFrame.draw(layer, elapsedTimeInMilliseconds, x, y, width || currentFrame.width , height || currentFrame.height);
            }

            //Reset the timestamp after this animation frame.
            this._timeSinceLastFrame = timeSinceLastFrame % this.animationRate;
        }
    }
})();