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

///////////////////////////////////////////
// CONSTANTS & UTILITY FUNCTIONS
///////////////////////////////////////////
//Math.PI2 = Math.PI * 2;
Math.PI2 = 6.283185307179586476925286766559;
Math.PI3_2 = Math.PI * 3 / 2;
Math.PI_2 = Math.PI / 2;
Math.HalfPI = 1.5707963267948966192313216916398;
Math.QuarterPI = 4.7123889803846898576939650749193;
Math.maxInt32 = 2147483647;
Math.maxUInt32 = 4294967296;

/**
 * Uses a bitwise operation hack to round the number up.
 * This will only work with signed integers and will fail with values greater than ((2 ^ 32) / 2) - 1
 * @param {number} x to round
 * @return {number} rounded.
 */
Math.bitRound = (x) => ((0.5 + x) << 0);

/**
 * Truncates a value quickier than using Math.Round.  WARNING: This will only work with signed integers and will fail with values greater than ((2 ^ 32) / 2) - 1.</summary>
 * @param {number} x to truncate
 * @return {number} truncated value
 */
Math.truncate = (x) => ((x >= Math.maxInt32) ? Math.maxInt32 : (~~x));

/**
 * Square and return the number supplied.
 * @param {number} x value to square.
 * @return {number} squared value.
 */
Math.sqr = (x) => x * x;

/**
 * Convert degrees to radians.
 * @param {number} degrees to convert to radians.
 * @return {number} radian value.
 */
Math.toDegrees = (degrees) => (degrees * Math.PI / 180);

/**
 * Convert radians to degrees.
 * @param {number} radians to convert to degrees.
 * @return {number} degree value.
 */
Math.toRadians = (radians) => (radians * 180 / Math.PI);