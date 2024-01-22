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

hamonengine.core = hamonengine.core || {};

(function () {

    const ENGINE_STATES = {
        STOPPED: 0,
        STARTED: 1,
        LOADING: 2,
        RUNNING: 3
    };

    const ENGINE_STATES_NAMES = [
        "STOPPED",
        "STARTED",
        "LOADING",
        "RUNNING"
    ];

    const PREVENT_DEFAULT_STATES = {
        NONE: 0,
        //Determines if all keys are blocked by default, where the application does not need to handle key event propagation.
        BLOCK_ALL_KEYS: 1,
        //Determines if the arrow keys are blocked by default, where the application does not need to handle key event propagation.
        BLOCK_ARROWS_KEYS: 2
    }

    const canvas_default_name = 'screen';
    const VERSION = '1.1.2';

    hamonengine.core.engine = class {
        constructor(options = {}) {

            console.log(`HamonEngine -- Using version: ${VERSION}`);

            //Options.
            this._syncFrames = options.syncFrames !== undefined ? options.syncFrames : false;
            this._showEngineSplashScreen = options.showEngineSplashScreen !== undefined ? options.showEngineSplashScreen : true;
            this._splashScreenWait = options.splashScreenWait !== undefined ? options.splashScreenWait : 500;
            this._allowDocumentEventBinding = options.allowDocumentEventBinding !== undefined ? options.allowDocumentEventBinding : false;
            this._captureTouchAsMouseEvents = options.captureTouchAsMouseEvents !== undefined ? options.captureTouchAsMouseEvents : true;
            this._awaitFontResources = options.awaitFontResources !== undefined ? options.awaitFontResources : true;
            this._handleResizingEvents = options.handleResizingEvents !== undefined ? options.handleResizingEvents : true;
            this._storyboard = options.storyboard;

            //Assign the engine if this one is not assigned.
            if (this._storyboard && !this._storyboard.engine) {
                this._storyboard.engine = this;
            }

            //Determines the prevent default & event propagation states.
            const blockArrowKeys = options.blockArrowKeys !== undefined ? options.blockArrowKeys : true;
            const blockAllKeys = options.blockAllKeys !== undefined ? options.blockAllKeys : false;
            this._preventDefaultState = 0 | (blockAllKeys ? PREVENT_DEFAULT_STATES.BLOCK_ALL_KEYS : PREVENT_DEFAULT_STATES.NONE) | (blockArrowKeys ? PREVENT_DEFAULT_STATES.BLOCK_ARROWS_KEYS : PREVENT_DEFAULT_STATES.NONE);

            //Add support for external elements.
            this._externalElements = options.externalElements ?? [];

            //Initialize internal states 
            this._state = ENGINE_STATES.STOPPED;
            this._startTimeStamp = 0;
            this._lastFrameTimeStamp = 0;
            this._animationId = 0;
            this._processingId = 0;

            //Add support for multiple screens that will house our canvas, and other drawing components.
            //Switching from Object properties to an array as most implementations will have only have a few screens at most and most access is linear iteration.
            this._screens = [];

            //Store all engine registered events for resource clean-up on stop.
            this._registeredEvents = [];

            //Try to detect all canvas if the feature is enabled and none are passsed in.
            const detectCanvas = options.detectCanvas !== undefined ? options.detectCanvas : true;
            const canvasCollection = options.canvas ?? [];

            // Map a canvas HTMLElement to a new screen or clone a screen if screens are provided as a parameter.
            const screenMapper = (screenOrCanvas, index) => screenOrCanvas instanceof hamonengine.graphics.screen
                ? screenOrCanvas
                : new hamonengine.graphics.screen({
                    engine: this,
                    name: (screenOrCanvas.getAttribute('name') ?? `${canvas_default_name}${index}`),
                    canvasId: (screenOrCanvas.getAttribute('id') ?? `${canvas_default_name}${index}`),
                    canvas: screenOrCanvas,
                    allowEventBinding: screenOrCanvas.dataset.alloweventbinding,
                    enableImageSmoothing: screenOrCanvas.dataset.enableimagesmoothing,
                    clipToViewPort: screenOrCanvas.dataset.cliptoviewport
                });

            if (detectCanvas && canvasCollection.length === 0) {
                hamonengine.debug && console.debug(`[hamonengine.core.engine.constructor] DetectCanvas: true.  Attempting to detect all canvas.`);
                const discoveredCanvas = Object.entries(document.getElementsByTagName('canvas'));
                discoveredCanvas.forEach(([key, value]) => {
                    this._screens.push(screenMapper(value, key));
                });
            }
            //If a collection of canvas objects are provided then use those instead.
            else {
                hamonengine.debug && console.debug(`[hamonengine.core.engine.constructor] DetectCanvas: false.  Using collection of options.canvas.`);
                for (let i = 0; i < canvasCollection.length; i++) {
                    this._screens.push(screenMapper(canvasCollection[i], i));
                };
            }

            this._resourcesLoaded = false;
            this._resizeObserver = null;

            //Log initialization values
            if (hamonengine.debug) {
                console.debug(`[hamonengine.core.engine.constructor] State: ${ENGINE_STATES_NAMES[this._state]}`);
                console.debug(`[hamonengine.core.engine.constructor] SyncFrames: ${this.syncFrames ? 'Enabled' : 'Disabled'}`);
                console.debug(`[hamonengine.core.engine.constructor] Engine splash screen: ${this._showEngineSplashScreen ? 'Enabled' : 'Disabled'}`);
                console.debug(`[hamonengine.core.engine.constructor] Splash screen wait time: ${this._splashScreenWait} milliseconds.`);
                console.debug(`[hamonengine.core.engine.constructor] Allow document event binding: ${this.allowDocumentEventBinding ? 'Enabled' : 'Disabled'}`);
                console.debug(`[hamonengine.core.engine.constructor] Capture touch as mouse events: ${this.captureTouchAsMouseEvents ? 'Enabled' : 'Disabled'}`);
                console.debug(`[hamonengine.core.engine.constructor] Block all default keys: ${this.blockByDefaultAllKeys ? 'Enabled' : 'Disabled'}`);
                console.debug(`[hamonengine.core.engine.constructor] Block arrow keys: ${this.blockByDefaultArrowKeys ? 'Enabled' : 'Disabled'}`);

                console.debug(`[hamonengine.core.engine.constructor] Await for font resources to complete loading: ${this._awaitFontResources ? 'Enabled' : 'Disabled'}`);

                this._storyboard && console.debug(`[hamonengine.core.engine.constructor] Storyboard Added: ${this._storyboard.name}`);

                console.debug(`[hamonengine.core.engine.constructor] Global States`);
                console.debug(`[hamonengine.core.engine.constructor] hamonengine.geometry.settings.collisionDetection.floor: ${hamonengine.geometry.settings.collisionDetection.floor}`);
                console.debug(`[hamonengine.core.engine.constructor] hamonengine.geometry.settings.collisionDetection.limit: ${hamonengine.geometry.settings.collisionDetection.limit}`);
                console.debug(`[hamonengine.core.engine.constructor] hamonengine.geometry.settings.coordinateSystem: ${hamonengine.geometry.settings.coordinateSystem}`);
                console.debug(`[hamonengine.core.engine.constructor] hamonengine.graphics.settings.globalInvertYAxis: ${hamonengine.graphics.settings.globalInvertYAxis ? 'true' : 'false'}`);
                console.debug(`[hamonengine.core.engine.constructor] hamonengine.graphics.settings.globalInvertXAxis: ${hamonengine.graphics.settings.globalInvertXAxis ? 'true' : 'false'}`);
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Returns all registered screens.
         */
        get screens() {
            return this._screens;
        }
        /**
         * Returns the primary screen.
         */
        get primaryScreen() {
            return this.screens.length === 1 ? this.screens[0] : this.getScreen(`${canvas_default_name}0`);
        }
        /**
         * Returns the primary layer.  Provides backwards support for previous implementations.
         */
        get primaryLayer() {
            return this.primaryScreen;
        }
        /**
         * Returns the primary storyboard.
         */
        get primaryStoryboard() {
            return this._storyboard;
        }
        /**
         * Returns true if the resource are loaded.
         */
        get resourcesLoaded() {
            return this._resourcesLoaded;
        }
        /**
         * Returns all external elements.
         */
        get externalElements() {
            return this._externalElements;
        }
        /**
         * Returns true if document event binding is allowed.
         */
        get allowDocumentEventBinding() {
            return this._allowDocumentEventBinding;
        }
        /**
         * Returns true if touch events are captured as mouse events.
         */
        get captureTouchAsMouseEvents() {
            return this._captureTouchAsMouseEvents;
        }
        /**
         * Toggles the ability to cature touch events as sync.
         */
        set captureTouchAsMouseEvents(v) {
            this._captureTouchAsMouseEvents = v;
        }
        /**
         * Returns true if all key events are blocked by default.
         */
        get blockByDefaultAllKeys() {
            return (this._preventDefaultState & PREVENT_DEFAULT_STATES.BLOCK_ALL_KEYS) === PREVENT_DEFAULT_STATES.BLOCK_ALL_KEYS;
        }
        /**
         * Toggles all key blocking by default.
         */
        set blockByDefaultAllKeys(v) {
            this._preventDefaultState = v ? (this._preventDefaultState | PREVENT_DEFAULT_STATES.BLOCK_ALL_KEYS) : (this._preventDefaultState ^ PREVENT_DEFAULT_STATES.BLOCK_ALL_KEYS);
        }
        /**
         * Returns true if only the arrow key events are blocked by default.
         */
        get blockByDefaultArrowKeys() {
            return (this._preventDefaultState & PREVENT_DEFAULT_STATES.BLOCK_ARROWS_KEYS) === PREVENT_DEFAULT_STATES.BLOCK_ARROWS_KEYS;
        }
        /**
         * Toggles arrow key blocking by default.
         */
        set blockByDefaultArrowKeys(v) {
            this._preventDefaultState = v ? (this._preventDefaultState | PREVENT_DEFAULT_STATES.BLOCK_ARROWS_KEYS) : (this._preventDefaultState ^ PREVENT_DEFAULT_STATES.BLOCK_ARROWS_KEYS);
        }
        /**
         * Returns true if the processing & drawing frames are sync'ed.
         * Warning: When enabled this can impact FPS performance.
         */
        get syncFrames() {
            return this._syncFrames;
        }
        /**
         * Assigns the sync value for processing & drawing frames together.
         * Warning: When enabled this can impact FPS performance.
         */
        set syncFrames(v) {
            this._syncFrames = v;
        }
        /**
         * Determines if the engine responds to an screen (canvas) resize event.
         */
        get handleResizingEvents() {
            return this._handleResizingEvents;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Returns the screen by name.
         * WARNING: Undefined will be returned if no screen matches the name.
         * @param {string} name of the screen.
         */
        getScreen(name) {
            return this.screens.find(screen => screen.name.toLowerCase().trim() === name.toLowerCase().trim());
        }
        /**
         * Preloads any resource loading.
         * @return {Object} a promise to complete resource loading.
         */
        async load() {
            hamonengine.debug && console.debug("[hamonengine.core.engine.load]");

            //Show the engine splash screen if enabled.
            !this._showEngineSplashScreen ? Promise.resolve() : await this.onShowEngineSplashScreen();

            //Show the loading splash screen if one exists.
            const loadingSplashScreenPromise = (this.onPreload && this.onPreload()) ? new Promise(resolve => setTimeout(() => resolve(), this._splashScreenWait)) : Promise.resolve();

            this._state = ENGINE_STATES.LOADING;
            console.log(`[hamonengine.core.engine.load] State: ${ENGINE_STATES_NAMES[this._state]}`);

            try {

                //Added a promise so the start can be delayed if designer so wishes to wait before starting the engine.
                const eventBindingPromise = this.onEventBinding();
                if (!(eventBindingPromise instanceof Promise)) {
                    throw 'onEventBinding is not returning a promise!  This event must return an unhandled promise.';
                }

                console.log("%c[hamonengine.core.engine.load] Engine is paused, waiting for event binding to resolve...", "color: yellow");
                await eventBindingPromise;
                console.log("%c[hamonengine.core.engine.load] Engine has resumed loading, event binding has completed.", "color: green");

                const loadingResourcePromises = [];
                const loadingResource = this.onloadResources();
                if (!(loadingResource instanceof Promise)) {
                    throw 'onloadResources is not returning a promise!  This event must return an unhandled promise.';
                }

                loadingResourcePromises.push(loadingResource);

                if (this.primaryStoryboard) {
                    const storyboardResource = this.primaryStoryboard.start();
                    if (!(storyboardResource instanceof Promise)) {
                        throw 'onloadResources is not returning a promise!  This event must return an unhandled promise.';
                    }
                    loadingResourcePromises.push(storyboardResource);
                }

                //Await for font resources but only if enabled.
                this._awaitFontResources && loadingResourcePromises.push(document.fonts.ready);

                console.log("%c[hamonengine.core.engine.load] Engine is paused, waiting for resources to resolve...", "color: yellow");
                await Promise.all(loadingResourcePromises);
                this._resourcesLoaded = true;
                console.log("%c[hamonengine.core.engine.load] Engine has resumed loading, resource loading completed.", "color: green");

                //Wait at the preload promise while the other events & resources are loading.
                console.log("%c[hamonengine.core.engine.load] Engine is paused, waiting for preload event to resolve...", "color: yellow");
                await loadingSplashScreenPromise;
                console.log("%c[hamonengine.core.engine.load] Preload completed.", "color: green");
            }
            catch (error) {
                console.error("[hamonengine.core.engine.load] Resources could not be loaded due to a failure! Stopping the engine.");
                console.error(error);
                this.stop({ reasons: `A critical error occured during resource loading.` });
            }

            //Allow chaining.
            return this;
        }
        /**
         * Starts the engine.
         */
        start() {
            hamonengine.debug && console.debug("[hamonengine.core.engine.start]");

            //Don't start the engine until we are in a loading state.
            if (this._state === ENGINE_STATES.LOADING) {
                this._state = ENGINE_STATES.STARTED;
                console.log(`[hamonengine.core.engine.start] State: ${ENGINE_STATES_NAMES[this._state]}`);

                //Start each available screen.
                for (let i = 0; i < this.screens.length; i++) {
                    this.screens[i].start();
                }

                this.onDraw(0);
            }

            //Allow chaining.
            return this;
        }
        /**
         * Stops the engine and releases resources.
         */
        stop({ reasons } = { reasons: 'Stopped By User' }) {
            hamonengine.debug && console.debug("[hamonengine.core.engine.stop]");

            //Relase the timing events
            window.cancelAnimationFrame(this._animationId);
            clearTimeout(this._processingId);
            this._processingId = this._animationId = this._startTimeStamp = this._lastFrameTimeStamp = 0;

            //Let everyone know the engine has stopped and for what reason.
            this.onStop(reasons);

            //Relase the DOM events registered by the engine.
            this._registeredEvents.forEach(({ name, element, functionSignature }) => element.removeEventListener(name, functionSignature));
            this._registeredEvents = [];

            //Clean up other resources.
            this.primaryStoryboard?.stop();
            this.screens.forEach(screen => {
                this.handleResizingEvents && screen && this._resizeObserver?.unobserve(screen?.canvas);
                screen?.release();
            });
            this._externalElements = this._screens = [];

            this._state = ENGINE_STATES.STOPPED;
            delete this._resizeObserver;
            console.log(`[hamonengine.core.engine.stop] State: ${ENGINE_STATES_NAMES[this._state]}`);

            //Allow chaining.
            return this;
        }
        //--------------------------------------------------------
        // Internal Events
        //--------------------------------------------------------
        /**
         * An internal event that occurs when attempting to load resources.
         * @return {Object} a promise that the resource has loaded successfully.
         */
        async onloadResources() {
            hamonengine.debug && console.debug("[hamonengine.core.engine.onloadResources]");
        }
        /**
         * Starts binding the events.
         */
        async onEventBinding() {
            const handleDOMBinding = () => {
                const touchEventMap = new Map();
                const bindEvents = (elementToBind, eventContainer) => {
                    const keyEvent = (type, e) => {
                        this.onKeyEvent(type, e.code, e, eventContainer);
                        //Handle default preventDefault logic
                        if (e) {
                            if (!this.blockByDefaultAllKeys) {
                                this.blockByDefaultArrowKeys && (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "ArrowUp" || e.code === "ArrowDown") && e.preventDefault();
                            }
                            else {
                                e.preventDefault();
                            }
                        }
                    }
                    const mouseEvent = (type, e) => {
                        this.onMouseEvent(type, new hamonengine.math.vector2(e.offsetX, e.offsetY), e, eventContainer);
                    }
                    const touchEvent = (type, e) => {
                        //Retain the current touch type so we can determine if the next event is a click.
                        const lasttouchevent = touchEventMap.has(eventContainer.name) ? touchEventMap.get(eventContainer.name) : '';
                        touchEventMap.set(eventContainer.name, type);

                        const position = eventContainer.position;
                        if (position) {
                            const touches = [];
                            for (let i = 0; i < e.touches.length; i++) {
                                touches.push(new hamonengine.math.vector2(e.touches[i].clientX - position.x, e.touches[i].clientY - position.y));
                            }
                            //Mimic the click event for touch.
                            const isClick = (type === 'end' && (lasttouchevent === 'start' || lasttouchevent === 'move'));
                            //Send both a touch as click event and the original event.
                            isClick && this.onTouchEvent('click', touches, e, eventContainer);
                            this.onTouchEvent(type, touches, e, eventContainer);

                            //If enabled, trigger the mouse event on a touch event.
                            if (this.captureTouchAsMouseEvents) {
                                //MDN's suggestion on mapping touch to click events.
                                //https://developer.mozilla.org/en-US/docs/Web/API/Touch_events#handling_clicks
                                //Map the touch events to mouse events before invoking the onMouseEvent.
                                type = (type === 'start') ? 'down' : type;
                                type = (type === 'end') ? 'up' : type;
                                //Capture only changedTouches as the touches collection will contain no coordinates.
                                const v = new hamonengine.math.vector2(e.changedTouches[0].clientX - position.x, e.changedTouches[0].clientY - position.y);

                                //Send both a mouse click and the original event.
                                isClick && this.onMouseEvent('click', v, e, eventContainer);
                                this.onMouseEvent(type, v, e, eventContainer);
                            }
                        }
                    };

                    //Helper method to store the DOM listeners to remove at another time.
                    const registerAndAddEventListener = (name, element, functionSignature) => {
                        element.addEventListener(name, functionSignature)
                        this._registeredEvents.push({ name, element, functionSignature });
                    };

                    registerAndAddEventListener('keyup', elementToBind, (e) => keyEvent('up', e));
                    registerAndAddEventListener('keydown', elementToBind, (e) => keyEvent('down', e));
                    registerAndAddEventListener('click', elementToBind, (e) => mouseEvent('click', e));
                    registerAndAddEventListener('mouseup', elementToBind, (e) => mouseEvent('up', e));
                    registerAndAddEventListener('mousedown', elementToBind, (e) => mouseEvent('down', e));
                    registerAndAddEventListener('mousemove', elementToBind, (e) => mouseEvent('move', e));
                    registerAndAddEventListener('mouseenter', elementToBind, (e) => mouseEvent('enter', e));
                    registerAndAddEventListener('mouseleave', elementToBind, (e) => mouseEvent('leave', e));
                    registerAndAddEventListener('touchstart', elementToBind, (e) => touchEvent('start', e), { passive: false });
                    registerAndAddEventListener('touchmove', elementToBind, (e) => touchEvent('move', e), { passive: false });
                    registerAndAddEventListener('touchend', elementToBind, (e) => touchEvent('end', e), { passive: false });
                    registerAndAddEventListener('touchcancel', elementToBind, (e) => touchEvent('cancel', e), { passive: false });

                    //We're done loading so remove this event.
                    window.removeEventListener("DOMContentLoaded", handleDOMBinding);
                };

                //Allow document event binding.
                this.allowDocumentEventBinding && bindEvents(document, this);

                //Allow support for external elements.
                this.externalElements.forEach(externalElement => bindEvents(externalElement, externalElement));

                //Determine if we're handling resizing events.
                if (this.handleResizingEvents) {
                    this._resizeObserver = new ResizeObserver(e => this.onScreenResize(this, e));
                }

                // If this is moved into the screens, then it is no longer a graphics based entity, but a graphics & input entity.
                if (this.screens.length === 1) {
                    this.primaryScreen.allowEventBinding && bindEvents(this.primaryScreen.canvas, this.primaryScreen);
                    this.handleResizingEvents && this._resizeObserver?.observe(this.primaryScreen.canvas);
                }
                else {
                    for (let i = 0; i < this.screens.length; i++) {
                        this.screens[i].allowEventBinding && bindEvents(this.screens[i].canvas, this.screens[i]);
                        this.handleResizingEvents && this._resizeObserver?.observe(this.screens[i].canvas);
                    }
                }
            }

            //Handle DOM Binding regardless of the state of the DOMContent loading state.
            if (window.document.readyState === "loading") {
                window.document.addEventListener("DOMContentLoaded", handleDOMBinding);
            }
            else {
                handleDOMBinding();
            }
        }
        /**
         * Shows the engine's splash screen.
         * @returns 
         */
        async onShowEngineSplashScreen() {
            if (this.primaryScreen) {
                const xOffset = this.primaryScreen.viewPort.width / 2;
                const yOffset = (this.primaryScreen.viewPort.height / 2) - 48;

                return new Promise((resolve, reject) => {
                    let track;
                    const internalDraw = () => {
                        const animationId = window.requestAnimationFrame(scopedTimestampInMS => {
                            //Draw the name of the engine.
                            this.primaryScreen.beginPainting({ enableFPSCounter: false });
                            this.primaryScreen.drawText(`波紋`, xOffset, yOffset, { font: 'bold 48px serif', textOffset: 'center', shadow: true, color: `rgb(255,${215},0)` });
                            this.primaryScreen.drawText(`Hamon`, xOffset, yOffset + 48, { font: 'bold 48px serif', textOffset: 'center', shadow: true, color: `rgb(255,${215},0)` });
                            this.primaryScreen.endPainting({ enableFPSCounter: false });

                            //Wait for the splash screen animation & music to complete.
                            if (scopedTimestampInMS < 1000 || (track?.isPlaying)) {
                                internalDraw();
                            }
                            else {
                                track?.release();
                                window.cancelAnimationFrame(animationId);
                                resolve();
                            }
                        });
                    };

                    //Only attempt to play music if it is supported.
                    if (hamonengine.support_resources) {
                        track = new hamonengine.audio.track({ src: hamonengine.resources.audio3 });
                        track.load().then(t => t.play());
                        internalDraw();
                    }
                    else {
                        internalDraw();
                    }
                });
            }
        }
        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        /**
         * Processes keyboard events.
         * @param {string} type of keyboard event such as 'up' or 'down' for keyup and keydown.
         * @param {string} keyCode of the key (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
         * @param {object} e KeyboardEvent (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a screens (canvas).
         */
        onKeyEvent(type, keyCode, e, caller) {
            this.primaryStoryboard?.onKeyEvent(type, keyCode, e, caller);
            hamonengine.debug && hamonengine.verbose && console.debug(`[hamonengine.core.engine.onKeyEvent] Type: '${type}' '${keyCode}'`);
        }
        /**
         * Processes mouse & touch events if captureTouchAsMouseEvents is set to true.
         * @param {string} type of mouse event such as: 'click', 'up', 'down', 'move', 'enter', 'leave'.
         * @param {object} v an instance of vector2 object that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a screens (canvas).
         */
        onMouseEvent(type, v, e, caller) {
            this.primaryStoryboard?.onMouseEvent(type, v, e, caller);
            hamonengine.debug && hamonengine.verbose && console.debug(`[hamonengine.core.engine.onMouseEvent] Type: '${type}' '${v.toString()}'`);
        }
        /**
         * Processes touch events.
         * @param {string} type of touch event such as: 'start', 'move', 'end', 'cancel', 'click'.
         * @param {Array} touches an array of vector2 objects that contain the x & y coordinates (see hamonengine.math.vector2).
         * @param {object} e TouchEvent (https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)
         * @param {object} caller that triggered the event that can be a HTMLElement, instance of the HamonEngine, or a screens (canvas).
         */
        onTouchEvent(type, touches, e, caller) {
            e && e.preventDefault();
            this.primaryStoryboard?.onTouchEvent(type, touches, e, caller);
            hamonengine.debug && hamonengine.verbose && console.debug(`[hamonengine.core.engine.onTouchEvent] Type: '${type}' '${e}'`);
        }
        /**
         * An event that is triggered when a screen (canvas) is resized.
         * @param {object} parent this always contains an instance of this engine.
         * @param {object} entries contains a reference to the ResizeObserverEntry object (https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry).
         */
        async onScreenResize(parent, entries) {
            for (let i = 0; i < entries.length; i++) {
                const screen = parent.screens.find(screen => screen.canvas === entries[i].target);
                if (screen) {
                    const newRect = new hamonengine.geometry.rect(entries[i].contentRect.x, entries[i].contentRect.y, entries[i].contentRect.width, entries[i].contentRect.height);
                    //Only spawn these events on dimension changes and when the element is not hidden (width & height = 0).
                    if (newRect.height > 0 && newRect.width > 0 && (screen.viewPort.width !== newRect.width || screen.viewPort.height !== newRect.height)) {
                        screen?.onScreenResize(newRect);
                        await parent.primaryStoryboard?.onScreenResize(newRect);
                    }
                }
            }
        }
        /**
         * A draw loop event that is triggered once the engine starts.
         * @param {?number} timestampInMilliseconds elapsed since the origin.  See DOMHighResTimeStamp.
         */
        onDraw(timestampInMilliseconds) {
            //Normalize the timestamp to prevent undefined or NaN.
            timestampInMilliseconds = (timestampInMilliseconds ?? 0);

            //Set the start timestamp when the engine first starts up.
            if (!this._startTimeStamp) {
                this._startTimeStamp = timestampInMilliseconds;
            }

            //Get the time elapsed since the engine started.
            const elapsedTimeInMilliseconds = timestampInMilliseconds - this._lastFrameTimeStamp;

            try {
                //Experimental processing frame.
                let processingComplete = false;
                this._processingId = setTimeout(() => {
                    this.onProcessingFrame(elapsedTimeInMilliseconds, timestampInMilliseconds);
                    processingComplete = true;
                }, 1);

                //NOTE: We need the scoped version of the timestamp argument to get the DOMHighResTimeStamp parameter.
                //If this parameter is removed then the timestamp will always be zero.
                this._animationId = window.requestAnimationFrame((scopedTimestampInMS) => {
                    this._state = ENGINE_STATES.RUNNING;
                    (!this.syncFrames || processingComplete) && (this.resourcesLoaded) && this.onFrame(elapsedTimeInMilliseconds, timestampInMilliseconds);
                    this.onDraw(scopedTimestampInMS);
                });
            }
            catch (exception) {
                this.stop();
                hamonengine.debug && console.debug(exception);
            }

            //Record the timestamp of the current frame.
            this._lastFrameTimeStamp = timestampInMilliseconds;
        }
        /**
         * An onFrame event that is triggered when a single frame is being rendered to the canvas.
         * @param {number} elapsedTimeInMilliseconds since the last frame.
         * @param {number} totalTimeInMilliseconds is the total time that has elapsed since the engine has started.
         */
        onFrame(elapsedTimeInMilliseconds, totalTimeInMilliseconds) {
            this.primaryStoryboard?.onFrame(elapsedTimeInMilliseconds, totalTimeInMilliseconds);
        }
        /**
         * An onProcessingFrame event that is triggered when a single frame is being processed before drawn.
         * @param {number} elapsedTimeInMilliseconds since the last frame.
         * @param {number} totalTimeInMilliseconds is the total time that has elapsed since the engine has started.
         */
        onProcessingFrame(elapsedTimeInMilliseconds, totalTimeInMilliseconds) {
            this.primaryStoryboard?.onProcessingFrame(elapsedTimeInMilliseconds, totalTimeInMilliseconds);
        }
        /**
         * An event that is triggered when the engine has been stopped.
         * @param {string} reasons as to why the engine stopped.
         */
        onStop(reasons) {
            //Goodnight
            if (this._showEngineSplashScreen && reasons === 'Stopped By User' && this.primaryScreen) {
                this.primaryScreen.fillLayerColor('#000000DD');
                this.primaryScreen.drawText('お やすみ', this.primaryScreen.viewPort.width / 2, this.primaryScreen.viewPort.height / 2, { font: 'bold 48px serif', textOffset: 'center', shadow: true, color: 'gold' });
                console.log("%c[hamonengine.core.engine.onStop] お やすみ GoodBye", "color: red");

                if (hamonengine.support_resources) {
                    const track = new hamonengine.audio.track({ src: hamonengine.resources.audio2 });
                    track.load().then(() => track.play());
                }
            }
        }
    }
})();