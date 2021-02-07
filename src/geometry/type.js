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

const COORDINATE_SYSTEM = {
    LHS: 0,
    RHS: 1
}

const COLLISION_TYPES = {
    NONE: 0,
    EDGE: 1,
    INSIDE: 2
};

const SHAPE_TYPE = {
    UNKNOWN: 0,
    CONVEX: 1,
    CONCAVE: 2
}

const ROTATION_TYPE = {
    CW: 0,
    CCW: 1
}

hamonengine.geometry = hamonengine.geometry || {};
hamonengine.geometry.settings = hamonengine.geometry.settings || {
    collisionDetection: {
        //Indicates the lowest value that the collision detection algorithm will react to before treating the value as zero.
        floor: 0.01,
        //Indicates the collision detection limit.
        //This is not the limit of collisions that can occur but rather a suggested amount of recalculation done on a collection of objects when collision detection has occurred.
        //In the case where multiple objects collide, the generated MTV may push one object back into another object requiring a recalculation.
        limit: 15
    },
    //Default to the right-handed coordinate system.
    coordinateSystem: COORDINATE_SYSTEM.RHS
};
