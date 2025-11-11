English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU - Directional Lighting

This article is assumes you’ve read [the article on cameras](webgpu-cameras.html).

There are many ways to implement lighting. Probably the simplest is _directional lighting_.

Directional lighting assumes the light is coming uniformly from one direction. The sun on a clear day is often considered a directional light. It’s so far way that its rays can be considered to be hitting the surface of an object all in parallel.

Computing directional lighting is actually pretty simple. If we know what direction the light is traveling and we know what direction the surface of the object is facing we can take the _dot product_ of the 2 directions and it will give us the cosine of the angle between the 2 directions.

Here’s an example

drag the points

Drag the points around, if you get them exactly opposite of each other you’ll see the dot product is -1. If they are at the same spot exactly the dot product is 1.

How is that useful? Well if we know what direction the surface of our 3d object is facing and we know the direction the light is shining then we can just take the dot product of them and it will give us a number 1 if the light is pointing directly at the surface and -1 if they are pointing directly opposite.

rotate the direction

We can multiply our color by that dot product value and boom! Light!

One problem, how do we know which direction the surfaces of our 3d object are facing.

## Introducing Normals

I have no idea why they are called _normals_ but at least in 3D graphics a normal is the word for a unit vector that describes the direction a surface is facing.

Here are some normals for a cube and a sphere.

The lines sticking out of the objects represent normals for each vertex.

Notice the cube has 3 normals at each corner. That’s because you need 3 different normals to represent the way each face of the cube is um, … facing.

Here the normals are also colored based on their direction with positive x being red, up being green and positive z being blue.

So, let’s go add normals to our `F` from [our previous examples](webgpu-cameras.html) so we can light it. Since the `F` is very boxy and its faces are aligned to the x, y, or z axis it will be pretty easy. Things that are facing forward have the normal `0, 0, 1` (positive Z). Things that are facing away are `0, 0, -1`. (negative Z). Facing left is `-1, 0, 0` (negative X), Facing right is `1, 0, 0` (Positive X). Up is `0, 1, 0` (positive Y) and down is `0, -1, 0` (negative Y). While we’re at it we’ll get rid of the vertex colors since they’ll make it harder to see the lighting.

function createFVertices() {
  const positions = \[
    // left column
     -50,  75,  15,
     -20,  75,  15,
     -50, -75,  15,
     -20, -75,  15,

    // top rung
     -20,  75,  15,
      50,  75,  15,
     -20,  45,  15,
      50,  45,  15,

    // middle rung
     -20,  15,  15,
      20,  15,  15,
     -20, -15,  15,
      20, -15,  15,

    // left column back
     -50,  75, -15,
     -20,  75, -15,
     -50, -75, -15,
     -20, -75, -15,

    // top rung back
     -20,  75, -15,
      50,  75, -15,
     -20,  45, -15,
      50,  45, -15,

    // middle rung back
     -20,  15, -15,
      20,  15, -15,
     -20, -15, -15,
      20, -15, -15,
  \];

  const indices = \[
     0,  2,  1,    2,  3,  1,   // left column
     4,  6,  5,    6,  7,  5,   // top run
     8, 10,  9,   10, 11,  9,   // middle run

    12, 13, 14,   14, 13, 15,   // left column back
    16, 17, 18,   18, 17, 19,   // top run back
    20, 21, 22,   22, 21, 23,   // middle run back

     0,  5, 12,   12,  5, 17,   // top
     5,  7, 17,   17,  7, 19,   // top rung right
     6, 18,  7,   18, 19,  7,   // top rung bottom
     6,  8, 18,   18,  8, 20,   // between top and middle rung
     8,  9, 20,   20,  9, 21,   // middle rung top
     9, 11, 21,   21, 11, 23,   // middle rung right
    10, 22, 11,   22, 23, 11,   // middle rung bottom
    10,  3, 22,   22,  3, 15,   // stem right
     2, 14,  3,   14, 15,  3,   // bottom
     0, 12,  2,   12, 14,  2,   // left
  \];

-  const quadColors = \[
-      200,  70, 120,  // left column front
-      200,  70, 120,  // top rung front
-      200,  70, 120,  // middle rung front
-
-       80,  70, 200,  // left column back
-       80,  70, 200,  // top rung back
-       80,  70, 200,  // middle rung back
-
-       70, 200, 210,  // top
-      160, 160, 220,  // top rung right
-       90, 130, 110,  // top rung bottom
-      200, 200,  70,  // between top and middle rung
-      210, 100,  70,  // middle rung top
-      210, 160,  70,  // middle rung right
-       70, 180, 210,  // middle rung bottom
-      100,  70, 210,  // stem right
-       76, 210, 100,  // bottom
-      140, 210,  80,  // left
+  const normals = \[
+        0,   0,   1,  // left column front
+        0,   0,   1,  // top rung front
+        0,   0,   1,  // middle rung front
+
+        0,   0,  -1,  // left column back
+        0,   0,  -1,  // top rung back
+        0,   0,  -1,  // middle rung back
+
+        0,   1,   0,  // top
+        1,   0,   0,  // top rung right
+        0,  -1,   0,  // top rung bottom
+        1,   0,   0,  // between top and middle rung
+        0,   1,   0,  // middle rung top
+        1,   0,   0,  // middle rung right
+        0,  -1,   0,  // middle rung bottom
+        1,   0,   0,  // stem right
+        0,  -1,   0,  // bottom
+       -1,   0,   0,  // left
  \];

  const numVertices = indices.length;
-  const vertexData = new Float32Array(numVertices \* 4); // xyz + color
  const vertexData = new Float32Array(numVertices \* 6); // xyz + normal
-  const colorData = new Uint8Array(vertexData.buffer);

  for (let i = 0; i < indices.length; ++i) {
    const positionNdx = indices\[i\] \* 3;
    const position = positions.slice(positionNdx, positionNdx + 3);
    vertexData.set(position, i \* 6);

    const quadNdx = (i / 6 | 0) \* 3;
-    const color = quadColors.slice(quadNdx, quadNdx + 3);
-    colorData.set(color, i \* 16 + 12);
-    colorData\[i \* 16 + 15\] = 255;
+    const normal = normals.slice(quadNdx, quadNdx + 3);
+    vertexData.set(normal, i \* 6 + 3);
  }

  return {
    vertexData,
    numVertices,
  };
}

We need to change our pipeline to use these normals instead of the colors

  const pipeline = device.createRenderPipeline({
    label: '2 attributes',
    layout: 'auto',
    vertex: {
      module,
      buffers: \[
        {
-          arrayStride: (4) \* 4, // (3) floats 4 bytes each + one 4 byte color
+          arrayStride: (3 + 3) \* 4, // (3+3) floats 4 bytes each
          attributes: \[
            {shaderLocation: 0, offset: 0, format: 'float32x3'},  // position
-            {shaderLocation: 1, offset: 12, format: 'unorm8x4'},  // color
+            {shaderLocation: 1, offset: 12, format: 'float32x3'},  // normal
          \],
        },
      \],
    },

    ...

Now we need to make our shaders use the normals

In the vertex shader we just pass the normals through to the fragment shader

struct Uniforms {
  matrix: mat4x4f,
+  color: vec4f,
+  lightDirection: vec3f,
};

struct Vertex {
  @location(0) position: vec4f,
-  @location(1) color: vec4f,
+  @location(1) normal: vec3f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
-  @location(0) color: vec4f,
+  @location(0) normal: vec3f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.position = uni.matrix \* vert.position;
-  vsOut.color = vert.color;
+  vsOut.normal = vert.normal;
  return vsOut;
}

In the fragment shader we’ll do the math using the dot product of the reverse direction of the light and the normal.

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
-  return vsOut.color;
+  // Because vsOut.normal is an inter-stage variable 
+  // it's interpolated so it will not be a unit vector.
+  // Normalizing it will make it a unit vector again
+  let normal = normalize(vsOut.normal);
+
+  // Compute the light by taking the dot product
+  // of the normal to the light's reverse direction
+  let light = dot(normal, -uni.lightDirection);
+
+  // Lets multiply just the color portion (not the alpha)
+  // by the light
+  let color = uni.color.rgb \* light;
+  return vec4f(color, uni.color.a);
}

We need to add space to our uniform buffer for the color and light direction and make views for setting them.

\-  // matrix
-  const uniformBufferSize = (16) \* 4;
+  // matrix + color + light direction
+  const uniformBufferSize = (16 + 4 + 4) \* 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kMatrixOffset = 0;
+  const kColorOffset = 16;
+  const kLightDirectionOffset = 20;

  const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 16);
+  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
+  const lightDirectionValue =
      uniformValues.subarray(kLightDirectionOffset, kLightDirectionOffset + 3);

and we need to set them

  const settings = {
    rotation: degToRad(0),
  };

  ...

  function render() {
    ...


    const aspect = canvas.clientWidth / canvas.clientHeight;
    const projection = mat4.perspective(
        degToRad(60),
        aspect,
        1,      // zNear
        2000,   // zFar
    );

    const eye = \[100, 150, 200\];
    const target = \[0, 35, 0\];
    const up = \[0, 1, 0\];

    // Compute a view matrix
    const viewMatrix = mat4.lookAt(eye, target, up);

    // combine the view and projection matrixes
    const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);

    mat4.rotateY(viewProjectionMatrix, settings.rotation, matrixValue);

    colorValue.set(\[0.2, 1, 0.2, 1\]);  // green
    lightDirectionValue.set(vec3.normalize(\[-0.5, -0.7, -1\]));

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

Our camera/eye is at z = 200 and it’s looking at Z = 0. In other words it’s looking in the negative Z direction.

`normalize`, which we went over before, will make whatever values we put in there into a unit vector. The specific values for the light in the sample are `x = -0.5` which is negative `x` but since we’re looking in negative Z means the light is on the right pointing left. `y = -0.7` which is negative `y` means the light is above pointing down as down is -negative… `z = -1` which is negative `z` means the light is pointing the same direction as our camera. The relative values means the direction is mostly pointing into the scene and pointing more down then right.

And here it is

[click here to open in a separate window](/webgpu/lessons/../webgpu-lighting-directional.html)

If you rotate the F you might notice something. The F is rotating but the lighting isn’t changing. As the F rotates we want whatever part is facing the direction of the light to be the brightest.

To fix this we need to re-orient the normals as the object is re-oriented. Like we did for positions we can multiply the normals by some matrix. The most obvious matrix would be the `world` matrix. As it is right now we’re only passing in one matrix. Let’s change it to pass in 2 matrices. One called `world` which will be the world matrix. Another called `worldViewProjection` which will be what we’re currently passing in as `matrix`

struct Uniforms {
-  matrix: mat4x4f,
+  world: mat4x4f,
+  worldViewProjection: mat4x4f,
  color: vec4f,
  lightDirection: vec3f,
};

struct Vertex {
  @location(0) position: vec4f,
  @location(1) normal: vec3f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.position = uni.worldViewProjection \* vert.position;
-  vsOut.normal = vert.normal;

+  // Orient the normals and pass to the fragment shader
+  vsOut.normal = (uni.world \* vec4f(vert.normal, 0)).xyz;

  return vsOut;
}

...

Notice we are are passing in 0 for W when we multiple the normal by `uni.world`. That’s because normals are a direction so we don’t care about translation. By setting `w` to 0, all the translation will be multiplied by zero[\[1\]](#fn1).

We need to go update our uniform buffer and values views.

\-  const uniformBufferSize = (16 + 4 + 4) \* 4;
+  const uniformBufferSize = (16 + 16 + 4 + 4) \* 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
-  const kMatrixOffset = 0;
-  const kColorOffset = 16;
-  const kLightDirectionOffset = 20;
+  const kWorldOffset = 0;
+  const kWorldViewProjectionOffset = 16;
+  const kColorOffset = 32;
+  const kLightDirectionOffset = 36;

-  const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 16);
+  const worldValue = uniformValues.subarray(kWorldOffset, kWorldOffset + 16);
+  const worldViewProjectionValue = uniformValues.subarray(
      kWorldViewProjectionOffset, kWorldViewProjectionOffset + 16);
  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
  const lightDirectionValue =
      uniformValues.subarray(kLightDirectionOffset, kLightDirectionOffset + 3);

And we have to change the code that updates them

    // Compute a view matrix
    const viewMatrix = mat4.lookAt(eye, target, up);

    // Combine the view and projection matrixes
    const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);

-    mat4.rotateY(viewProjectionMatrix, settings.rotation, matrixValue);
+    // Compute a world matrix directly into worldValue
+    mat4.rotationY(settings.rotation, worldValue);

+    // Combine the viewProjection and world matrices
+    mat4.multiply(viewProjectionMatrix, worldValue, worldViewProjectionValue);

    colorValue.set(\[0.2, 1, 0.2, 1\]);  // green
    lightDirectionValue.set(vec3.normalize(\[-0.5, -0.7, -1\]));

and here’s that

[click here to open in a separate window](/webgpu/lessons/../webgpu-lighting-directional-world.html)

Rotate the F and notice which ever side is facing the light direction gets lit.

There is one problem which I don’t know how to show directly so I’m going to show it in a diagram. We’re multiplying the `normal` by the `world` matrix to re-orient the normals. What happens if we scale the world matrix? It turns out we get the wrong normals.

click to toggle normals

I’ve never bothered to understand the solution but it turns out you can get the inverse of the world matrix, transpose it, which means swap the columns for rows, and use that instead and you’ll get the right answer.

In the diagram above the purple sphere is unscaled. The red sphere on the left is scaled and the normals are being multiplied by the world matrix. You can see something is wrong. The blue sphere on the right is using the world inverse transpose matrix.

Click the diagram to cycle through different representations. You should notice when the scale is extreme it’s very easy to see the normals on the left (world) are **not** staying perpendicular to the surface of the sphere where as the ones on the right (worldInverseTranspose) are staying perpendicular to the sphere. The last mode makes them all shaded red. You should see the lighting on the 2 outer spheres is very different based on which matrix is used. It’s hard to tell which is correct which is why this is a subtle issue but based on the other visualizations it’s clear using the worldInverseTranspose is correct.

To implement this in our example let’s change the code like this. First we’ll update the shader. Technically we could just update the value of `world` but it’s best if we rename things so they’re named what they actually are otherwise it will get confusing. We could call it `worldInverseTranspose` but it’s common to call it a `normalMatrix` and since we really only care about how it orients the normal we really only need a 3x3 matrix.

struct Uniforms {
-  world: mat4x4f,
+  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
  color: vec4f,
  lightDirection: vec3f,
};

struct Vertex {
  @location(0) position: vec4f,
  @location(1) normal: vec3f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.position = uni.worldViewProjection \* vert.position;

  // Orient the normals and pass to the fragment shader
-  vsOut.normal = (uni.world \* vec4f(vert.normal, 0)).xyz;
+  vsOut.normal = uni.normalMatrix \* vert.normal;

  return vsOut;
}

Because we’re using a 3x3 matrix our normal calculation got slightly simpler.

And of course we need to update the JavaScript for the new shape of our uniforms.

\-  const uniformBufferSize = (16 + 16 + 4 + 4) \* 4;
+  const uniformBufferSize = (12 + 16 + 4 + 4) \* 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
-  const kWorldOffset = 0;
-  const kWorldViewProjectionOffset = 16;
-  const kColorOffset = 32;
-  const kLightDirectionOffset = 36;
+  const kNormalMatrixOffset = 0;
+  const kWorldViewProjectionOffset = 12;
+  const kColorOffset = 28;
+  const kLightDirectionOffset = 32;

-  const worldValue = uniformValues.subarray(kWorldOffset, kWorldOffset + 16);
+  const normalMatrixValue = uniformValues.subarray(
+      kNormalMatrixOffset, kNormalMatrixOffset + 12);
  const worldViewProjectionValue = uniformValues.subarray(
      kWorldViewProjectionOffset, kWorldViewProjectionOffset + 16);
  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
  const lightDirectionValue =
      uniformValues.subarray(kLightDirectionOffset, kLightDirectionOffset + 3);

Before we can compute our normal matrix we need a function to transpose a matrix

const mat4 = {
  ....
  transpose(m, dst) {
    dst = dst || new Float32Array(16);

    dst\[ 0\] = m\[ 0\];  dst\[ 1\] = m\[ 4\];  dst\[ 2\] = m\[ 8\];  dst\[ 3\] = m\[12\];
    dst\[ 4\] = m\[ 1\];  dst\[ 5\] = m\[ 5\];  dst\[ 6\] = m\[ 9\];  dst\[ 7\] = m\[13\];
    dst\[ 8\] = m\[ 2\];  dst\[ 9\] = m\[ 6\];  dst\[10\] = m\[10\];  dst\[11\] = m\[14\];
    dst\[12\] = m\[ 3\];  dst\[13\] = m\[ 7\];  dst\[14\] = m\[11\];  dst\[15\] = m\[15\];

    return dst;
  },
  ...

And we need a function to get a 3x3 matrix from a 4x4 matrix

const mat3 = {
  fromMat4(m, dst) {
    dst = dst || new Float32Array(12);

    dst\[0\] = m\[0\]; dst\[1\] = m\[1\];  dst\[ 2\] = m\[ 2\];
    dst\[4\] = m\[4\]; dst\[5\] = m\[5\];  dst\[ 6\] = m\[ 6\];
    dst\[8\] = m\[8\]; dst\[9\] = m\[9\];  dst\[10\] = m\[10\];

    return dst;
  },
};

Notice that a 3x3 matrix in WebGPU has each column padded. We covered this in [the article on memory layout](webgpu-memory-layout.html).

Now that we have these 2 functions we can compute and set the normal matrix.

    // Compute a view matrix
    const viewMatrix = mat4.lookAt(eye, target, up);

    // Combine the view and projection matrixes
    const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);

-    // Compute a world matrix directly into worldValue
-    mat4.rotationY(settings.rotation, worldValue);
-
-    // Combine the viewProjection and world matrices
-    mat4.multiply(viewProjectionMatrix, worldValue, worldViewProjectionValue);
+    // Compute a world matrix
+    const world = mat4.rotationY(settings.rotation);
+
+    // Combine the viewProjection and world matrices
+    mat4.multiply(viewProjectionMatrix, world, worldViewProjectionValue);
+
+    // Inverse and transpose it into the normalMatrix value
+    mat3.fromMat4(mat4.transpose(mat4.inverse(world)), normalMatrixValue);

Because the effect is subtle and because we aren’t scaling anything there’s no noticeable difference but at least now we’re prepared.

[click here to open in a separate window](/webgpu/lessons/../webgpu-lighting-directional-worldinversetranspose.html)

I hope this first step into lighting was clear. Next up [point lighting](webgpu-lighting-point.html).

* * *

1.  see the article on [matrix math](webgpu-matrix-math.html). [↩︎](#fnref1)
    

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU - Directional Lighting\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');