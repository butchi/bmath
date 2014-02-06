"use strict";
/* 
 * 現在2次元配列を想定
 */
function arrayQ(arr) {
	var i;
	var tmpLen=arr[0].length;
	for(i=1; i<arr.length; i++) {
		if(arr[i].length !==tmpLen) return false;
		tmpLen = arr[i].length;
	}
	return true;
}

function first(arr) {
	return arr[0];
}

function last(arr) {
	return arr[arr.length-1];
}

function rest(arr) {
}

function most(arr) {
}

function take() {
}

function drop() {
}


function constantArray(c, len) {
	var retArr = new Array(len);
	var i;
	for(i=0; i<len; i++) {
		retArr[i] = c;
	}
	return retArr;
}

function append() {
}

function prepend() {
}

function insert() {
}

function delete_() {
}

function appendTo() {
}

function prependTo() {
}

function position() {
}

function length(arr) {
	return arr.length;
}

/*
 * 現在1次元～2次元配列を想定
 */
function dimensions(arr) {
	if(arrayQ(arr)) {
		if(arr.length==0) {
			return [0];
		} else if(!(arr[0] instanceof Array)) {
			return [arr.length, 1]
		} else {
			var x = arr[0].length;
			var y = arr.length;
			return [x, y];
		}
	} else {
		return false;
	}
}

function select_() {
}

function cases() {
}

function pick() {
}

function binLists() {
}

function flatten() {
}

function join() {
}

function union() {
}

function replacePart() {
}

function total() {
}

function accumulate() {
}

function differences() {
}

function max_() {
}

function min_() {
}

function sort_() {
}

function riffle() {
}

/*
[
  [1,2,3],
  [4,5,6]
]
*/

function transpose(arr) {
	/*
	var i, j;
	for(i=0; i<arr.length; i++) {
		var tmp = arr[i];
		for(j=0; j<arr[i].length; j++) {
			if(j==0) var retArr = new Array();
		}
	}
	*/
}
