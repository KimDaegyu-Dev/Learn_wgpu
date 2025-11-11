English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU Perspective Projection

This article is the 6th in a series of articles that will hopefully teach you about 3D math. Each one builds on the previous lesson so you may find them easiest to understand by reading them in order.

1.  [Translation](webgpu-translation.html)
2.  [Rotation](webgpu-rotation.html)
3.  [Scaling](webgpu-scale.html)
4.  [Matrix Math](webgpu-matrix-math.html)
5.  [Orthographic Projection](webgpu-orthographic-projection.html)
6.  [Perspective Projection](webgpu-perspective-projection.html) ⬅ you are here
7.  [Cameras](webgpu-cameras.html)
8.  [Matrix Stacks](webgpu-matrix-stacks.html)
9.  [Scene Graphs](webgpu-scene-graphs.html)

In the last post we went over how to do 3D but that 3D didn’t have any perspective. It was using what’s called an “orthographic” view which has its uses but it’s generally not what people want when they say “3D”.

Instead we need to add perspective. Just what is perspective? It’s basically the feature that things that are further away appear smaller.

![](resources/perspective-example.svg)

Looking at the example above we see that things further away are drawn smaller. Given our current sample one easy way to make it so that things that are further away appear smaller would be to divide the clip space X and Y by Z.

Think of it this way: If you have a line from (10, 15) to (20,15) it’s 10 units long. In our current sample it would be drawn 10 pixels long. But if we divide by Z then for example if Z is 1

10 / 1 = 10
20 / 1 = 20
abs(10-20) = 10

it would be 10 pixels long, If Z is 2 it would be

10 / 2 = 5
20 / 2 = 10
abs(5 - 10) = 5

5 pixels long. At Z = 3 it would be

10 / 3 = 3.333
20 / 3 = 6.666
abs(3.333 - 6.666) = 3.333

You can see that as Z increases, as it gets smaller, we’ll end up drawing it smaller, and therefore it will appear further way. If we divide in clip space we might get better results because Z will be a smaller number (0 to +1). If we add a fudgeFactor to multiply Z before we divide we can adjust how much smaller things get for a given distance.

Let’s try it. First let’s change the vertex shader to divide by Z after we’ve multiplied it by our “fudgeFactor”.

struct Uniforms {
  matrix: mat4x4f,
+  fudgeFactor: f32,
};

struct Vertex {
  @location(0) position: vec4f,
  @location(1) color: vec4f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
-  vsOut.position = uni.matrix \* vert.position;
+  let position = uni.matrix \* vert.position;
+
+  let zToDivideBy = 1.0 + position.z \* uni.fudgeFactor;
+
+  vsOut.position = vec4f(
+      position.xy / zToDivideBy,
+      position.zw);

  vsOut.color = vert.color;
  return vsOut;
}

Note: By adding 1 we can set `fudgeFactor` to 0 and get a `zToDivideBy` that is equal to 1. This will let is compare when not dividing by Z because dividing by 1 does nothing.

We also need to update the code to let us set the fudgeFactor.

\-  // matrix
-  const uniformBufferSize = (16) \* 4;
+  // matrix, fudgeFactor, padding
+  const uniformBufferSize = (16 + 1 + 3) \* 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kMatrixOffset = 0;
+  const kFudgeFactorOffset = 16;

  const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 16);
+  const fudgeFactorValue = uniformValues.subarray(kFudgeFactorOffset, kFudgeFactorOffset + 1);

...

  const settings = {
    translation: \[canvas.clientWidth / 2 - 200, canvas.clientHeight / 2 - 75, -1000\],
    rotation: \[degToRad(40), degToRad(25), degToRad(325)\],
    scale: \[3, 3, 3\],
+    fudgeFactor: 0.5,
  };

...

  const gui = new GUI();
  gui.onChange(render);
  gui.add(settings.translation, '0', 0, 1000).name('translation.x');
  gui.add(settings.translation, '1', 0, 1000).name('translation.y');
  gui.add(settings.translation, '2', -1000, 1000).name('translation.z');
  gui.add(settings.rotation, '0', radToDegOptions).name('rotation.x');
  gui.add(settings.rotation, '1', radToDegOptions).name('rotation.y');
  gui.add(settings.rotation, '2', radToDegOptions).name('rotation.z');
  gui.add(settings.scale, '0', -5, 5).name('scale.x');
  gui.add(settings.scale, '1', -5, 5).name('scale.y');
  gui.add(settings.scale, '2', -5, 5).name('scale.z');
+  gui.add(settings, 'fudgeFactor', 0, 50);

...

  function render() {

    ...

    mat4.ortho(
        0,                   // left
        canvas.clientWidth,  // right
        canvas.clientHeight, // bottom
        0,                   // top
        1200,                // near
        -1000,               // far
        matrixValue,         // dst
    );
    mat4.translate(matrixValue, settings.translation, matrixValue);
    mat4.rotateX(matrixValue, settings.rotation\[0\], matrixValue);
    mat4.rotateY(matrixValue, settings.rotation\[1\], matrixValue);
    mat4.rotateZ(matrixValue, settings.rotation\[2\], matrixValue);
    mat4.scale(matrixValue, settings.scale, matrixValue);

+    fudgeFactorValue\[0\] = settings.fudgeFactor;

I also adjusted the `settings` to hopefully make it easy to see the results.

  const settings = {
-    translation: \[45, 100, 0\],
+    translation: \[canvas.clientWidth / 2 - 200, canvas.clientHeight / 2 - 75, -1000\],
    rotation: \[degToRad(40), degToRad(25), degToRad(325)\],
-    scale: \[1, 1, 1\],
+    scale: \[3, 3, 3\],
    fudgeFactor: 10,
  };

And here’s the result.

[click here to open in a separate window](/webgpu/lessons/../webgpu-perspective-projection-step-1-fudge-factor.html)

If it’s not clear drag the “fudgeFactor” slider from 10.0 to 0.0 to see what things used to look like before we added our divide by Z code.

![](resources/orthographic-vs-perspective.png)

orthographic vs perspective

It turns out WebGPU takes the x,y,z,w value we assign to `@builtin(position)` our vertex shader and divides it by w automatically.

We can prove this very easily by changing the shader and instead of doing the division ourselves, put `zToDivideBy` in `vsOut.position.w`.

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
  let position = uni.matrix \* vert.position;

  let zToDivideBy = 1.0 + position.z \* uni.fudgeFactor;

-  vsOut.position = vec4f(
-      position.xy / zToDivideBy,
-      position.zw);
+  vsOut.position = vec4f(position.xyz, zToDivideBy);

  vsOut.color = vert.color;
  return vsOut;
}

and see how it’s exactly the same.

[click here to open in a separate window](/webgpu/lessons/../webgpu-perspective-projection-step-2-gpu-divide-by-w.html)

Why is the fact that WebGPU automatically divides by W useful? Because now, using more matrix magic, we can just use yet another matrix to copy z to w.

A Matrix like this

1  0  0  0
0  1  0  0
0  0  1  0
0  0  1  0

will copy z to w. You can look at each of those rows as

x\_out = x\_in \* 1 +
        y\_in \* 0 +
        z\_in \* 0 +
        w\_in \* 0 ;
 
y\_out = x\_in \* 0 +
        y\_in \* 1 +
        z\_in \* 0 +
        w\_in \* 0 ;
 
z\_out = x\_in \* 0 +
        y\_in \* 0 +
        z\_in \* 1 +
        w\_in \* 0 ;
 
w\_out = x\_in \* 0 +
        y\_in \* 0 +
        z\_in \* 1 +
        w\_in \* 0 ;

which when simplified is

x\_out = x\_in;
y\_out = y\_in;
z\_out = z\_in;
w\_out = z\_in;

We can add the plus 1 we had before with this matrix since we know `w_in` is always 1.0.

1  0  0  0
0  1  0  0
0  0  1  0
0  0  1  1

that will change the W calculation to

w\_out = x\_in \* 0 +
        y\_in \* 0 +
        z\_in \* 1 +
        w\_in \* 1 ;

and since we know `w_in` = 1.0 then that’s really

w\_out = z\_in + 1;

Finally we can work our fudgeFactor back in if the matrix is this

1  0  0            0
0  1  0            0
0  0  1            0
0  0  fudgeFactor  1

which means

w\_out = x\_in \* 0 +
        y\_in \* 0 +
        z\_in \* fudgeFactor +
        w\_in \* 1 ;

and simplified that’s

w\_out = z\_in \* fudgeFactor + 1;

So, let’s modify the program again to just use matrices.

First let’s put the vertex shader back so it’s simple again

struct Uniforms {
  matrix: mat4x4f,
-  fudgeFactor: f32,
};

struct Vertex {
  @location(0) position: vec4f,
  @location(1) color: vec4f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
-  let position = uni.matrix \* vert.position;
-
-  let zToDivideBy = 1.0 + position.z \* uni.fudgeFactor;
-
-  vsOut.position = vec4f(
-      position.xy / zToDivideBy,
-      position.zw);
  vsOut position = uni.matrix \* vert.position;
  vsOut.color = vert.color;
  return vsOut;
}

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  return vsOut.color;
}

Next let’s make a function to make a Z → W matrix.

function makeZToWMatrix(fudgeFactor) {
  return \[
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, fudgeFactor,
    0, 0, 0, 1,
  \];
}

and we’ll change the code to use it.

\-    mat4.ortho(
+    const projection = mat4.ortho(
        0,                   // left
        canvas.clientWidth,  // right
        canvas.clientHeight, // bottom
        0,                   // top
        1200,                // near
        -1000,               // far
-        matrixValue,         // dst
    );
+    mat4.multiply(makeZToWMatrix(settings.fudgeFactor), projection, matrixValue);
    mat4.translate(matrixValue, settings.translation, matrixValue);
    mat4.rotateX(matrixValue, settings.rotation\[0\], matrixValue);
    mat4.rotateY(matrixValue, settings.rotation\[1\], matrixValue);
    mat4.rotateZ(matrixValue, settings.rotation\[2\], matrixValue);
    mat4.scale(matrixValue, settings.scale, matrixValue);

and note, again, it’s exactly the same.

[click here to open in a separate window](/webgpu/lessons/../webgpu-perspective-projection-step-3-perspective-z-to-w.html)

All that was basically just to show you that dividing by Z gives us perspective and that WebGPU conveniently does this divide by Z for us.

But there are still some problems. For example if you set Z to around -1100 you’ll see something like the animation below

What’s going on? Why is the F disappearing early? Just like WebGPU clips X and Y or +1 to -1 it also clips Z. Unlike X and Y, Z clips 0 to +1. What we’re seeing here is Z < 0 in clip space.

With with divide by W in place, our matrix math + the divide by W defines a _frustum_. The front of the frustum is Z = 0, the back is Z = 1. Anything outside of that is clipped.

> ## frustum
> 
> _noun_:
> 
> 1.  a cone or pyramid with the upper part cut off by a plane parallel to its base

I could go into detail about the math to fix it but [you can derive it](https://stackoverflow.com/a/28301213/128511) the same way we did 2D projection. We need to take Z, add some amount (translation) and scale some amount and we can make any range we want get remapped to the -1 to +1.

The cool thing is all of these steps can be done in 1 matrix. Even better, rather than a `fudgeFactor` we’ll decide on a `fieldOfView` and compute the right values to make that happen.

Here’s a function to build the matrix.

const mat4 = {
  ...
  perspective(fieldOfViewYInRadians, aspect, zNear, zFar, dst) {
    dst = dst || new Float32Array(16);

    const f = Math.tan(Math.PI \* 0.5 - 0.5 \* fieldOfViewYInRadians);
    const rangeInv = 1 / (zNear - zFar);

    dst\[0\] = f / aspect;
    dst\[1\] = 0;
    dst\[2\] = 0;
    dst\[3\] = 0;

    dst\[4\] = 0;
    dst\[5\] = f;
    dst\[6\] = 0;
    dst\[7\] = 0;

    dst\[8\] = 0;
    dst\[9\] = 0;
    dst\[10\] = zFar \* rangeInv;
    dst\[11\] = -1;

    dst\[12\] = 0;
    dst\[13\] = 0;
    dst\[14\] = zNear \* zFar \* rangeInv;
    dst\[15\] = 0;

    return dst;
  }

This matrix will do all our conversions for us. It will adjust the units so they are in clip space, it will do the math so that we can choose a field of view by angle and it will let us choose our Z-clipping space. It assumes there’s an _eye_ or _camera_ at the origin (0, 0, 0) and given a `zNear` and a `fieldOfView` it computes what it would take so that stuff at `zNear` ends up at `Z = 0` and stuff at `zNear` that is half of `fieldOfView` above or below the center ends up with `Y = -1` and `Y = 1` respectively. It computes what to use for X by just multiplying by the `aspect` passed in. We’d normally set this to the `width / height` of the display area. Finally, it figures out how much to scale things in Z so that stuff at zFar ends up at `Z = 1`.

Here’s a diagram of the matrix in action.

The matrix takes the space inside the frustum and converts that to clip space. `zNear` defines where things will get clipped in the front and `zFar` defines where things get clipped in the back. Set `zNear` to 23 and you’ll see the front of the spinning cubes get clipped. Set `zFar` to 24 and you’ll see the back of the cubes get clipped.

Let’s use this function in our example.

  const settings = {
    fieldOfView: degToRad(100),
    translation: \[canvas.clientWidth / 2 - 200, canvas.clientHeight / 2 - 75, -1000\],
    rotation: \[degToRad(40), degToRad(25), degToRad(325)\],
    scale: \[3, 3, 3\],
-    fudgeFactor: 10,
  };

  const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };

  const gui = new GUI();
  gui.onChange(render);
  gui.add(settings, 'fieldOfView', {min: 1, max: 179, converters: GUI.converters.radToDeg});
  gui.add(settings.translation, '0', 0, 1000).name('translation.x');
  gui.add(settings.translation, '1', 0, 1000).name('translation.y');
  gui.add(settings.translation, '2', -1400, 1000).name('translation.z');
  gui.add(settings.rotation, '0', radToDegOptions).name('rotation.x');
  gui.add(settings.rotation, '1', radToDegOptions).name('rotation.y');
  gui.add(settings.rotation, '2', radToDegOptions).name('rotation.z');
  gui.add(settings.scale, '0', -5, 5).name('scale.x');
  gui.add(settings.scale, '1', -5, 5).name('scale.y');
  gui.add(settings.scale, '2', -5, 5).name('scale.z');
-  gui.add(settings, 'fudgeFactor', 0, 50);

  ...

  function render() {
    ....

-    const projection = mat4.ortho(
-        0,                   // left
-        canvas.clientWidth,  // right
-        canvas.clientHeight, // bottom
-        0,                   // top
-        1200,                // near
-        -1000,               // far
-    );
-    mat4.multiply(makeZToWMatrix(settings.fudgeFactor), projection, matrixValue);
+    const aspect = canvas.clientWidth / canvas.clientHeight;
+    mat4.perspective(
+        settings.fieldOfView,
+        aspect,
+        1,      // zNear
+        2000,   // zFar
+        matrixValue,
+    );
    mat4.translate(matrixValue, settings.translation, matrixValue);
    mat4.rotateX(matrixValue, settings.rotation\[0\], matrixValue);
    mat4.rotateY(matrixValue, settings.rotation\[1\], matrixValue);
    mat4.rotateZ(matrixValue, settings.rotation\[2\], matrixValue);
    mat4.scale(matrixValue, settings.scale, matrixValue);

There’s just one problem left. This projection matrix assumes there’s a viewer at 0,0,0 and it assumes it’s looking in the negative Z direction and that positive Y is up. Our matrices up to this point have done things in a different way. We need to put the F, which is 150 units tall, 100 units wide, and 30 units thick, in some -Z position and it needs to be far enough away that it fits inside the frustum. The frustum we’ve defined above, with `zNear` = 1 will only show about 2.4 units from top to bottom when an object is 1 unit away so our F will be %98 off the screen.

Playing around with some numbers I came up with these settings.

  const settings = {
    fieldOfView: degToRad(100),
-    translation: \[canvas.clientWidth / 2 - 200, canvas.clientHeight / 2 - 75, -1000\],
-    rotation: \[degToRad(40), degToRad(25), degToRad(325)\],
-    scale: \[3, 3, 3\],
+    translation: \[-65, 0, -120\],
+    rotation: \[degToRad(220), degToRad(25), degToRad(325)\],
+    scale: \[1, 1, 1\],
  };

And, while we’re at it let’s adjust the UI settings to be more appropriate. Let’s also remove the scale to unclutter to UI a little.

  const gui = new GUI();
  gui.onChange(render);
  gui.add(settings, 'fieldOfView', {min: 1, max: 179, converters: GUI.converters.radToDeg});
-  gui.add(settings.translation, '0', 0, 1000).name('translation.x');
-  gui.add(settings.translation, '1', 0, 1000).name('translation.y');
-  gui.add(settings.translation, '2', -1400, 1000).name('translation.z');
+  gui.add(settings.translation, '0', -1000, 1000).name('translation.x');
+  gui.add(settings.translation, '1', -1000, 1000).name('translation.y');
+  gui.add(settings.translation, '2', -1400, -100).name('translation.z');
  gui.add(settings.rotation, '0', radToDegOptions).name('rotation.x');
  gui.add(settings.rotation, '1', radToDegOptions).name('rotation.y');
  gui.add(settings.rotation, '2', radToDegOptions).name('rotation.z');
-  gui.add(settings.scale, '0', -5, 5).name('scale.x');
-  gui.add(settings.scale, '1', -5, 5).name('scale.y');
-  gui.add(settings.scale, '2', -5, 5).name('scale.z');

Let’s also get rid of the grid since we’re no longer in “pixel space”.

:root {
  --bg-color: #fff;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #000;
  }
}
canvas {
  display: block;  /\* make the canvas act like a block   \*/
  width: 100%;     /\* make the canvas fill its container \*/
  height: 100%;
}

And here it is.

[click here to open in a separate window](/webgpu/lessons/../webgpu-perspective-projection-step-4-perspective.html)

We’re back to just a matrix multiply on our shader and we’re getting both a field of view and we’re able to choose our Z space.

Next up, [cameras](webgpu-cameras.html).

### Why did we move the F so far in Z (-120)?

In the other samples we had the F at (45, 100, 0) but in the last sample it's been moved to (-65, 0, -120). Why did it need to be moved so far away?

The reason is up until this last sample our `mat4.projection` function made a projection from pixels to clip space. That means the area we were displaying kinda of represented pixels. Using 'pixels' really doesn't make sense in 3D since it would only represent pixels at a specific distance from the camera.

In other words, with our new perspective projection matrix, if we tried to draw with the F with translation at 0,0,0 and rotation 0,0,0 it we'd get this

![](resources/f-big-and-wrong-side.svg)

The F has its top left front corner at the origin. The perspective projection matrix looks toward negative Z but our F is built in positive Z. The perspective projection matrix has positive Y up but our F is built with positive Z down.

Our new projection only sees what's in the blue frustum. With -zNear = 1 and with a field of view of 100 degrees then at Z = -1 the frustum is only 2.38 units tall and 2.38 \* aspect units wide. At Z = -2000 (-zFar) its 4767 units tall. Since our F is 150 units big and the view can only see 2.38 units when something is at `-zNear` we need to move it further away from the origin to see all of it.

Moving it -120 units in Z moves the F inside the frustum. We also rotated it to be right side up.

![](resources/f-right-side.svg)

not to scale

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU Perspective Projection\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');