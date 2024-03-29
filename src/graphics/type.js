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

const BLENDING_OPS = {
    REPLACE: 0,
    ADD: 1,
    MULTIPLY: 2,
    OR: 3,
    AND: 4,
    XOR: 5,
    DIFFERENCE: 6
};

const TEXT_DRAW_TYPE = {
    STROKE: 0,
    FILL: 1
}

const DIRTY_FLAG = {
    NORMAL: 0,
    DIMS: 1,
    EDGE: 2,
    SHAPE: 3,
    ALL: 15
}

hamonengine.graphics = hamonengine.graphics || {};
hamonengine.graphics.settings = hamonengine.graphics.settings || {
    //Controls the global axes invert logic.
    invertYAxis: null,
    invertXAxis: null,
     //Controls the global wrapping logic.
    wrapVertical: null,
    wrapHorizontal: null
};