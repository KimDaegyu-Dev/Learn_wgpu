English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU Rotation

This article is the 2nd in a series of articles that will hopefully teach you about 3D math. Each one builds on the previous lesson so you may find them easiest to understand by reading them in order.

1.  [Translation](webgpu-translation.html)
2.  [Rotation](webgpu-rotation.html) ⬅ you are here
3.  [Scaling](webgpu-scale.html)
4.  [Matrix Math](webgpu-matrix-math.html)
5.  [Orthographic Projection](webgpu-orthographic-projection.html)
6.  [Perspective Projection](webgpu-perspective-projection.html)
7.  [Cameras](webgpu-cameras.html)
8.  [Matrix Stacks](webgpu-matrix-stacks.html)
9.  [Scene Graphs](webgpu-scene-graphs.html)

I’m going to admit right up front I have no idea if how I explain this will make sense but what the heck, might as well try.

First I want to introduce you to what’s called a “unit circle”. If you remember your junior high school math (don’t go to sleep on me!) a circle has a radius. The radius of a circle is the distance from the center of the circle to the edge. A unit circle is a circle with a radius of 1.0.

Here’s a unit circle. [\[1\]](#fn1)

Notice as you drag the blue handle around the circle the X and Y positions change. Those represent the position of that point on the circle. At the top Y is 1 and X is 0. On the right X is 1 and Y is 0.

If you remember from basic 3rd grade math if you multiply something by 1 it stays the same. So 123 \* 1 = 123. Pretty basic, right? Well, a unit circle, a circle with a radius of 1.0 is also a form of 1. It’s a rotating 1. So you can multiply something by this unit circle and in a way it’s kind of like multiplying by 1 except magic happens and things rotate.

We’re going to take that X and Y value from any point on the unit circle and we’ll multiply our vertex positions by them from [our previous example](webgpu-translation.html).

Here are the updates to our shader.

struct Uniforms {
  color: vec4f,
  resolution: vec2f,
  translation: vec2f,
+  rotation: vec2f,
};

struct Vertex {
  @location(0) position: vec2f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;

+  // Rotate the position
+  let rotatedPosition = vec2f(
+    vert.position.x \* uni.rotation.x - vert.position.y \* uni.rotation.y,
+    vert.position.x \* uni.rotation.y + vert.position.y \* uni.rotation.x
+  );

  // Add in the translation
-  let position = vert.position + uni.translation;
+  let position = rotatedPosition + uni.translation;

  // convert the position from pixels to a 0.0 to 1.0 value
  let zeroToOne = position / uni.resolution;

  // convert from 0 <-> 1 to 0 <-> 2
  let zeroToTwo = zeroToOne \* 2.0;

  // covert from 0 <-> 2 to -1 <-> +1 (clip space)
  let flippedClipSpace = zeroToTwo - 1.0;

  // flip Y
  let clipSpace = flippedClipSpace \* vec2f(1, -1);

  vsOut.position = vec4f(clipSpace, 0.0, 1.0);
  return vsOut;
}

And we update the JavaScript to add space to the new uniform value.

\-  // color, resolution, translation
-  const uniformBufferSize = (4 + 2 + 2) \* 4;
+  // color, resolution, translation, rotation, padding
+  const uniformBufferSize = (4 + 2 + 2 + 2) \* 4 + 8;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kColorOffset = 0;
  const kResolutionOffset = 4;
  const kTranslationOffset = 6;
+  const kRotationOffset = 8;

  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
  const resolutionValue = uniformValues.subarray(kResolutionOffset, kResolutionOffset + 2);
  const translationValue = uniformValues.subarray(kTranslationOffset, kTranslationOffset + 2);
+  const rotationValue = uniformValues.subarray(kRotationOffset, kRotationOffset + 2);

And we need some kind of UI. This isn’t a tutorial about making UIs so I’m just going to use one. First some HTML to give it a place to be

  <body>
    <canvas></canvas>
+    <div id="circle"></div>
  </body>

Then some CSS to put it somewhere

#circle {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 300px;
  background-color: var(--bg-color);
}

and finally the JavaScript to use it.

+import UnitCircle from './resources/js/unit-circle.js';

...

  const gui = new GUI();
  gui.onChange(render);
  gui.add(settings.translation, '0', 0, 1000).name('translation.x');
  gui.add(settings.translation, '1', 0, 1000).name('translation.y');

+  const unitCircle = new UnitCircle();
+  document.querySelector('#circle').appendChild(unitCircle.domElement);
+  unitCircle.onChange(render);

  function render() {
    ...

    // Set the uniform values in our JavaScript side Float32Array
    resolutionValue.set(\[canvas.width, canvas.height\]);
    translationValue.set(settings.translation);
+    rotationValue.set(\[unitCircle.x, unitCircle.y\]);

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

And here’s the result. Drag the handle on the circle to rotate or the sliders to translate.

[click here to open in a separate window](/webgpu/lessons/../webgpu-rotation-via-unit-circle.html)

Why does it work? Well, look at the math.

rotatedX = a\_position.x \* u\_rotation.x - a\_position.y \* u\_rotation.y;
rotatedY = a\_position.x \* u\_rotation.y + a\_position.y \* u\_rotation.x;

Let’s say you have a rectangle and you want to rotate it. Before you start rotating it, the top right corner is at 3.0, -9.0. Let’s pick a point on the unit circle 30 degrees clockwise from 3 o’clock.

The position on the circle there is x = 0.87, y = 0.50

 3.0 \* 0.87 - -9.0 \* 0.50 =  7.1
 3.0 \* 0.50 + -9.0 \* 0.87 = -6.3

That’s exactly where we need it to be

![](resources/rotation-drawing.svg)

The same for 60 degrees clockwise

The position on the circle there is 0.87 and 0.50

 3.0 \* 0.50 - -9.0 \* 0.87 =  9.3
 3.0 \* 0.87 + -9.0 \* 0.50 = -1.9

You can see that as we rotate that point clockwise, the X value gets bigger and the Y gets smaller. If we kept going past 90 degrees X would start getting smaller again and Y would start getting bigger. That pattern gives us rotation.

There’s another name for the points on a unit circle. They’re called the sine and cosine. So for any given angle we can just look up the sine and cosine like this.

function printSineAndCosineForAnAngle(angleInDegrees) {
  const angleInRadians = angleInDegrees \* Math.PI / 180;
  const s = Math.sin(angleInRadians);
  const c = Math.cos(angleInRadians);
  console.log('s =', s, 'c =', c);
}

If you copy and paste the code into your JavaScript console and type `printSineAndCosignForAngle(30)` you see it prints `s = 0.50 c = 0.87` (note: I rounded off the numbers)

If you put it all together you can rotate your vertex positions to any angle you desire. Just set the rotation to the sine and cosine of the angle you want to rotate to.

  ...
  const angleInRadians = angleInDegrees \* Math.PI / 180;
  rotation\[0\] = Math.cos(angleInRadians);
  rotation\[1\] = Math.sin(angleInRadians);

Let’s change things to just have an rotation setting.

\+  const degToRad = d => d \* Math.PI / 180;

  const settings = {
    translation: \[150, 100\],
+    rotation: degToRad(30),
  };

  const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };

  const gui = new GUI();
  gui.onChange(render);
  gui.add(settings.translation, '0', 0, 1000).name('translation.x');
  gui.add(settings.translation, '1', 0, 1000).name('translation.y');
+  gui.add(settings, 'rotation', radToDegOptions);

-  const unitCircle = new UnitCircle();
-  document.querySelector('#circle').appendChild(unitCircle.domElement);
-  unitCircle.onChange(render);

  function render() {
    ...

    // Set the uniform values in our JavaScript side Float32Array
    resolutionValue.set(\[canvas.width, canvas.height\]);
    translationValue.set(settings.translation);
-    rotationValue.set(\[unitCircle.x, unitCircle.y\]);
+    rotationValue.set(\[
+        Math.cos(settings.rotation),
+        Math.sin(settings.rotation),
+    \]);

Drag the sliders to translate or rotate.

[click here to open in a separate window](/webgpu/lessons/../webgpu-rotation.html)

I hope that made some sense. [Next up a simpler one. Scale](webgpu-scale.html).

### What are radians?

Radians are a unit of measurement used with circles, rotation and angles. Just like we can measure distance in inches, yards, meters, etc we can measure angles in degrees or radians.

You're probably aware that math with metric measurements is easier than math with imperial measurements. To go from inches to feet we divide by 12. To go from inches to yards we divide by 36. I don't know about you but I can't divide by 36 in my head. With metric it's much easier. To go from millimeters to centimeters we divide by 10. To go from millimeters to meters we divide by 1000. I \*\*can\*\* divide by 1000 in my head.

Radians vs degrees are similar. Degrees make the math hard. Radians make the math easy. There are 360 degrees in a circle but there are only 2π radians. So a full turn is 2π radians. A half turn is 1π radian. A 1/4 turn, ie 90 degrees is 1/2π radians. So if you want to rotate something 90 degrees just use `Math.PI * 0.5`. If you want to rotate it 45 degrees use `Math.PI * 0.25` etc.

Nearly all math involving angles, circles or rotation works very simply if you start thinking in radians. So give it try. Use radians, not degrees, except in UI displays.

* * *

1.  This unit circle has +Y going down to match our pixel space which is also Y down. WebGPU’s normal clip space is +Y up. As we went over in the previous article we’ve flipped Y in the shader. [↩︎](#fnref1)
    

English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文

*   Basics

*   [Fundamentals](/webgpu/lessons/webgpu-fundamentals.html)
*   [Inter-stage Variables](/webgpu/lessons/webgpu-inter-stage-variables.html)
*   [Uniforms](/webgpu/lessons/webgpu-uniforms.html)
*   [Storage Buffers](/webgpu/lessons/webgpu-storage-buffers.html)
*   [Vertex Buffers](/webgpu/lessons/webgpu-vertex-buffers.html)
*   Textures

*   [Textures](/webgpu/lessons/webgpu-textures.html)
*   [Loading Images](/webgpu/lessons/webgpu-importing-textures.html)
*   [Using Video](/webgpu/lessons/webgpu-textures-external-video.html)
*   [Cube Maps](/webgpu/lessons/webgpu-cube-maps.html)
*   [Storage Textures](/webgpu/lessons/webgpu-storage-textures.html)
*   [Multisampling / MSAA](/webgpu/lessons/webgpu-multisampling.html)

*   [Constants](/webgpu/lessons/webgpu-constants.html)
*   [Data Memory Layout](/webgpu/lessons/webgpu-memory-layout.html)
*   [Transparency and Blending](/webgpu/lessons/webgpu-transparency.html)
*   [Bind Group Layouts](/webgpu/lessons/webgpu-bind-group-layouts.html)
*   [Copying Data](/webgpu/lessons/webgpu-copying-data.html)
*   [Optional Features and Limits](/webgpu/lessons/webgpu-limits-and-features.html)
*   [Timing Performance](/webgpu/lessons/webgpu-timing.html)
*   [WGSL](/webgpu/lessons/webgpu-wgsl.html)
*   [How It Works](/webgpu/lessons/webgpu-how-it-works.html)
*   [Compatibility Mode](/webgpu/lessons/webgpu-compatibility-mode.html)

*   3D Math

*   [Translation](/webgpu/lessons/webgpu-translation.html)
*   [Rotation](/webgpu/lessons/webgpu-rotation.html)
*   [Scale](/webgpu/lessons/webgpu-scale.html)
*   [Matrix Math](/webgpu/lessons/webgpu-matrix-math.html)
*   [Orthographic Projection](/webgpu/lessons/webgpu-orthographic-projection.html)
*   [Perspective Projection](/webgpu/lessons/webgpu-perspective-projection.html)
*   [Cameras](/webgpu/lessons/webgpu-cameras.html)
*   [Matrix Stacks](/webgpu/lessons/webgpu-matrix-stacks.html)
*   [Scene Graphs](/webgpu/lessons/webgpu-scene-graphs.html)

*   Lighting

*   [Directional Lighting](/webgpu/lessons/webgpu-lighting-directional.html)
*   [Point Lighting](/webgpu/lessons/webgpu-lighting-point.html)
*   [Spot Lighting](/webgpu/lessons/webgpu-lighting-spot.html)

*   Techniques

*   2D

*   [Large Clip Space Triangle](/webgpu/lessons/webgpu-large-triangle-to-cover-clip-space.html)

*   3D

*   [Environment maps](/webgpu/lessons/webgpu-environment-maps.html)
*   [Skyboxes](/webgpu/lessons/webgpu-skybox.html)

*   Post Processing

*   [Basic CRT Effect](/webgpu/lessons/webgpu-post-processing.html)

*   Compute Shaders

*   [Compute Shader Basics](/webgpu/lessons/webgpu-compute-shaders.html)
*   [Image Histogram](/webgpu/lessons/webgpu-compute-shaders-histogram.html)
*   [Image Histogram Part 2](/webgpu/lessons/webgpu-compute-shaders-histogram-part-2.html)

*   Misc

*   [Resizing the Canvas](/webgpu/lessons/webgpu-resizing-the-canvas.html)
*   [Multiple Canvases](/webgpu/lessons/webgpu-multiple-canvases.html)
*   [Points](/webgpu/lessons/webgpu-points.html)
*   [WebGPU from WebGL](/webgpu/lessons/webgpu-from-webgl.html)
*   [Speed and Optimization](/webgpu/lessons/webgpu-optimization.html)
*   [Debugging and Errors](/webgpu/lessons/webgpu-debugging.html)
*   [Resources / References](/webgpu/lessons/webgpu-resources.html)
*   [WGSL Function Reference](/webgpu/lessons/webgpu-wgsl-function-reference.html)
*   [WGSL Offset Computer](/webgpu/lessons/resources/wgsl-offset-computer.html)

*   [github](https://github.com/webgpu/webgpufundamentals)
*   [Tour of WGSL](https://google.github.io/tour-of-wgsl/)
*   [WebGPU API Reference](https://gpuweb.github.io/types/)
*   [WebGPU Spec](https://www.w3.org/TR/webgpu/)
*   [WGSL Spec](https://www.w3.org/TR/WGSL/)
*   [WebGPUReport.org](https://webgpureport.org)
*   [Web3DSurvey.com](https://web3dsurvey.com/webgpu)

Questions? [Ask on stackoverflow](http://stackoverflow.com/questions/tagged/webgpu).

[Suggestion](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=suggested+topic&template=suggest-topic.md&title=%5BSUGGESTION%5D)? [Request](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=&template=request.md&title=)? [Issue](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=bug+%2F+issue&template=bug-issue-report.md&title=)? [Bug](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=bug+%2F+issue&template=bug-issue-report.md&title=)?

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU Rotation\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');