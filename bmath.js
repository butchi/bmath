"use strict";
function first(arr) {
	return arr[0];
}

function last(arr) {
	return arr[arr.length-1];
}

function constantArray(c, len) {
	var retArr = new Array(len);
	var i;
	for(i=0; i<len; i++) {
		retArr[i] = c;
	}
	return retArr;
}

/*
[
  [1,2,3],
  [4,5,6]
]
*/

function transpose(arr) {
	var i, j;
	for(i=0; i<arr.length; i++) {
		var tmp = arr[i];
		for(j=0; j<arr[i].length; j++) {
			if(j==0) var retArr = new Array();
		}
	}
}
