
let removeGutter = String.prototype.removeGutter = function(){
	return this.replace(/[\t\n\r]/gm, '');
}

export {
	removeGutter,
}
