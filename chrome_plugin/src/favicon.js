/*
 * Copyright 2011 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var link = document.querySelector('link[rel~=\'icon\']');
if (!link) {
	link = document.createElement('link');
	link.setAttribute('rel', 'shortcut icon');
	document.head.appendChild(link);
}
var faviconUrl = link.href || window.location.origin + '/favicon.ico';
function onImageLoaded() {
	var canvas = document.createElement('canvas');
	canvas.width = 16;
	canvas.height = 16;
	var context = canvas.getContext('2d');
	context.drawImage(img, 0, 0);
	context.globalCompositeOperation = 'source-in';
	context.fillStyle = '#d00';
	context.fillRect(0, 0, 16, 16);
	context.fill();
	link.type = 'image/x-icon';
	link.href = canvas.toDataURL();
}
var img = document.createElement('img');
img.addEventListener('load', onImageLoaded);
img.src = faviconUrl;