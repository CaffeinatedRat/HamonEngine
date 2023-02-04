/**
* Copyright \(c\) 2020-2023, CaffeinatedRat.
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

hamonengine.events = hamonengine.events || {};

(function () {
    /**
     * This class represents a storyboard object, which is a specialized root frame class.
     */
    hamonengine.events.storyboard = class extends hamonengine.events.frame {
        constructor(options = {}) {
            super(options);

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.events.storyboard) {
                options = {
                    engine: options._engine,
                    currentFrame: options._currentFrame
                };
            }

            this._engine = options.engine;
            this._currentFrame = options.currentFrame
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        get currentFrame() {
            return this._currentFrame;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the storyboard.
         */
        clone() {
            return new hamonengine.events.storyboard(this);
        }
        /**
         * Preloads any resource loading.
         * @return {Object} a promise to complete resource loading.
         */
        async load() {
            await this.onloadResources();
            await this.currentFrame && this.currentFrame.load();
        }
        /**
         * Starts the current storyboard.
         */
        start(elapsedTimeInMilliseconds) {
            this.currentFrame && this.currentFrame.onAction(elapsedTimeInMilliseconds, this, this._engine);
        }
        /**
         * Stops the current storyboard and releases resources.
         */
        stop() {
            this.currentFrame && this.currentFrame.clear();
        }
        //--------------------------------------------------------
        // Internal Events
        //--------------------------------------------------------
        /**
         * An internal event that occurs when attempting to load resources.
         * @return {Object} a promise that the resource has loaded successfully.
         */
        async onloadResources() {
            hamonengine.debug && console.debug("[hamonengine.events.storyboard.onloadResources]");
        }
    }
})();