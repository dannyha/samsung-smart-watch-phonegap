cordova.define("net.trentgardner.cordova.galaxygear.GalaxyGear", function(require, exports, module) { 
var exec = cordova.require('cordova/exec'),
	service = "galaxygear";

exports.onConnect = function(win, fail) {
	exec(win, fail, service, "onConnect", []);
};

exports.onDataReceived = function(handle, win, fail) {
	exec(win, fail, service, "onDataReceived", [handle]);
};

exports.onError = function(handle, win, fail) {
	exec(win, fail, service, "onError", [handle]);
};

exports.sendData = function(handle, data, win, fail) {
	exec(win, fail, service, "sendData", [handle, data]);
};

});
