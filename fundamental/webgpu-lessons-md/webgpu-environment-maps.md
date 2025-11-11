English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU Environment Maps (reflections)

This article continues from [the article on cube maps](webgpu-cube-maps.html). This article also uses concepts covered in [the article on lighting](webgpu-lighting-directional.html). If you have not read those articles already you might want to read them first.

An _environment map_ represents the environment of the objects you’re drawing. If the you’re drawing an outdoor scene it would represent the outdoors. If you’re drawing people on a stage it would represent the venue. If you’re drawing an outer space scene it would be the stars. We can implement an environment map with a cube map if we have 6 images that show the environment from a point in space in the 6 directions of the cubemap.

Here’s an environment map from the lobby of the Leadenhall Market in London.

![](../resources/images/leadenhall_market/pos-x.jpg)

positive x

![](../resources/images/leadenhall_market/neg-x.jpg)

negative x

![](../resources/images/leadenhall_market/pos-y.jpg)

positive y

![](../resources/images/leadenhall_market/pos-z.jpg)

positive z

![](../resources/images/leadenhall_market/neg-z.jpg)

negative z

![](../resources/images/leadenhall_market/neg-y.jpg)

positive y

[Leadenhall Market](https://polyhaven.com/a/leadenhall_market), CC0 by: [Andreas Mischok](https://www.artstation.com/andreasmischok)

Based on [the code in the previous article](webgpu-cube-maps.html) let’s load those 6 images instead of the canvases we generated. From [the article on importing textures](webgpu-importing-textures.html) we had these two function. One to load an image and another to create a texture from an image.

  async function loadImageBitmap(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
  }

  async function createTextureFromImage(device, url, options) {
    const imgBitmap = await loadImageBitmap(url);
    return createTextureFromSource(device, imgBitmap, options);
  }

Let’s add and one to load multiple images

\+  async function createTextureFromImages(device, urls, options) {
+    const imgBitmaps = await Promise.all(url.map(loadImageBitmap));
+    return createTextureFromSource(device, imgBitmaps, options);
+  }

  async function createTextureFromImage(device, url, options) {
-    const imgBitmap = await loadImageBitmap(url);
-    return createTextureFromSource(device, imgBitmap, options);
+    return createTextureFromImages(device, \[url\], options);
  }

While we were at it we also changed the existing function to use the new one. Now we can use the new one to load the six images.

\-  const texture = await createTextureFromSources(
-      device, faceCanvases, {mips: true, flipY: false});
+  const texture = await createTextureFromImages(
+      device,
+      \[
+        'resources/images/leadenhall\_market/pos-x.jpg',
+        'resources/images/leadenhall\_market/neg-x.jpg',
+        'resources/images/leadenhall\_market/pos-y.jpg',
+        'resources/images/leadenhall\_market/neg-y.jpg',
+        'resources/images/leadenhall\_market/pos-z.jpg',
+        'resources/images/leadenhall\_market/neg-z.jpg',
+      \],
+      {mips: true, flipY: false},
+  );

In fragment shader we want to know, for each fragment to be drawn, given a vector from the eye/camera to that position on the surface of the object, which direction will it reflect off the that surface. We can then use that direction to get a color from the cubemap.

The formula to reflect is

reflectionDir = eyeToSurfaceDir –
    2 ∗ dot(surfaceNormal, eyeToSurfaceDir) ∗ surfaceNormal

Thinking about what we can see it’s true. Recall from the [lighting articles](webgpu-lighting-directional.html) that a dot product of 2 vectors returns the cosine of the angle between the 2 vectors. Adding vectors gives us a new vector so let’s take the example of an eye looking directly perpendicular to a flat surface.

![](resources/reflect-180-01.svg)

Let’s visualize the formula above. First off recall the dot product of 2 vectors pointing in exactly opposite directions is -1 so visually

![](resources/reflect-180-02.svg)

Plugging in that dot product with the eyeToSurfaceDir and normal in the reflection formula gives us this

![](resources/reflect-180-03.svg)

Which multiplying -2 by -1 makes it positive 2.

![](resources/reflect-180-04.svg)

So adding the vectors by connecting them up gives us the reflected vector

![](resources/reflect-180-05.svg)

We can see above given 2 normals, one completely cancels out the direction from the eye and the second one points the reflection directly back towards the eye. Which if we put back in the original diagram is exactly what we’d expect

![](resources/reflect-180-06.svg)

Let’s rotate the surface 45 degrees to the right.

![](resources/reflect-45-01.svg)

The dot product of 2 vectors 135 degrees apart is -0.707

![](resources/reflect-45-02.svg)

So plugging everything into the formula

![](resources/reflect-45-03.svg)

Again multiplying 2 negatives gives us a positive but the vector is now about 30% shorter.

![](resources/reflect-45-04.svg)

Adding up the vectors gives us the reflected vector

![](resources/reflect-45-05.svg)

Which if we put back in the original diagram seems correct.

![](resources/reflect-45-06.svg)

We use that reflected direction to look at the cubemap to color the surface of the object.

Here’s a diagram where you can set the rotation of the surface and see the various parts of the equation. You can also see the reflection vectors point to the different faces of the cubemap and effect the color of the surface.

Now that we know how reflection works and that we can use it to look up values from the cubemap let’s change the shaders to do that.

First in the vertex shader we’ll compute the world position and world oriented normal of the vertices and pass those to the fragment shader as inter-stage variables. This is similar to what we did in [the article on spotlights](webgpu-3d-lighting-spot.html).

struct Uniforms {
-  matrix: mat4x4f,
+  projection: mat4x4f,
+  view: mat4x4f,
+  world: mat4x4f,
+  cameraPosition: vec3f,
};

struct Vertex {
  @location(0) position: vec4f,
+  @location(1) normal: vec3f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
-  @location(0) normal: vec3f,
+  @location(0) worldPosition: vec3f,
+  @location(1) worldNormal: vec3f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;
@group(0) @binding(1) var ourSampler: sampler;
@group(0) @binding(2) var ourTexture: texture\_cube<f32>;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
-  vsOut.position = uni.matrix \* vert.position;
-  vsOut.normal = normalize(vert.position.xyz);
+  vsOut.position = uni.projection \* uni.view \* uni.world \* vert.position;
+  vsOut.worldPosition = (uni.world \* vert.position).xyz;
+  vsOut.worldNormal = (uni.world \* vec4f(vert.normal, 0)).xyz;
  return vsOut;
}

Then in the fragment shader we normalize the `worldNormal` since it’s being interpolated across the surface between vertices. Based on the matrix math from [the article on cameras](webgpu-cameras.html) we can get the world position of the camera by getting the 3rd row of the view matrix and negating it and by subtracting that from the world position of the surface we get the `eyeToSurfaceDir`.

And finally we use `reflect` which is a built in WGSL function that implements the formula we went over above. We use the result to get a color from the cubemap.

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
+  let worldNormal = normalize(vsOut.worldNormal);
+  let eyeToSurfaceDir = normalize(vsOut.worldPosition - uni.cameraPosition);
+  let direction = reflect(eyeToSurfaceDir, worldNormal);

-  return textureSample(ourTexture, ourSampler, normalize(vsOut.normal));
+  return textureSample(ourTexture, ourSampler, direction);
}

We also need real normals for this example. We need real normals so the faces of the cube appear flat. In the previous example, just to see the cubemap work, we repurposed the cube’s positions but in this case we need actual normals for a cube like we covered in [the article on lighting](webgpu-lighting-directional.html)

  const vertexData = new Float32Array(\[
-     // front face
-    -1,  1,  1,
-    -1, -1,  1,
-     1,  1,  1,
-     1, -1,  1,
-     // right face
-     1,  1, -1,
-     1,  1,  1,
-     1, -1, -1,
-     1, -1,  1,
-     // back face
-     1,  1, -1,
-     1, -1, -1,
-    -1,  1, -1,
-    -1, -1, -1,
-    // left face
-    -1,  1,  1,
-    -1,  1, -1,
-    -1, -1,  1,
-    -1, -1, -1,
-    // bottom face
-     1, -1,  1,
-    -1, -1,  1,
-     1, -1, -1,
-    -1, -1, -1,
-    // top face
-    -1,  1,  1,
-     1,  1,  1,
-    -1,  1, -1,
-     1,  1, -1,
+     //  position   |  normals
+     //-------------+----------------------
+     // front face      positive z
+    -1,  1,  1,         0,  0,  1,
+    -1, -1,  1,         0,  0,  1,
+     1,  1,  1,         0,  0,  1,
+     1, -1,  1,         0,  0,  1,
+     // right face      positive x
+     1,  1, -1,         1,  0,  0,
+     1,  1,  1,         1,  0,  0,
+     1, -1, -1,         1,  0,  0,
+     1, -1,  1,         1,  0,  0,
+     // back face       negative z
+     1,  1, -1,         0,  0, -1,
+     1, -1, -1,         0,  0, -1,
+    -1,  1, -1,         0,  0, -1,
+    -1, -1, -1,         0,  0, -1,
+    // left face        negative x
+    -1,  1,  1,        -1,  0,  0,
+    -1,  1, -1,        -1,  0,  0,
+    -1, -1,  1,        -1,  0,  0,
+    -1, -1, -1,        -1,  0,  0,
+    // bottom face      negative y
+     1, -1,  1,         0, -1,  0,
+    -1, -1,  1,         0, -1,  0,
+     1, -1, -1,         0, -1,  0,
+    -1, -1, -1,         0, -1,  0,
+    // top face         positive y
+    -1,  1,  1,         0,  1,  0,
+     1,  1,  1,         0,  1,  0,
+    -1,  1, -1,         0,  1,  0,
+     1,  1, -1,         0,  1,  0,
  \]);

And of course we need to change our pipeline to provide the normals

  const pipeline = device.createRenderPipeline({
    label: '2 attributes',
    layout: 'auto',
    vertex: {
      module,
      buffers: \[
        {
-          arrayStride: (3) \* 4, // (3) floats 4 bytes each
+          arrayStride: (3 + 3) \* 4, // (6) floats 4 bytes each
          attributes: \[
            {shaderLocation: 0, offset: 0, format: 'float32x3'},  // position
+            {shaderLocation: 1, offset: 12, format: 'float32x3'},  // normal
          \],
        },
      \],
    },

As usual we need to setup our uniform buffer and views

\-  // matrix
-  const uniformBufferSize = (16) \* 4;
+  // projection, view, world, cameraPosition, pad
+  const uniformBufferSize = (16 + 16 + 16 + 3 + 1) \* 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
-  const kMatrixOffset = 0;
-  const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 16);
  const kProjectionOffset = 0;
  const kViewOffset = 16;
  const kWorldOffset = 32;
+  const projectionValue = uniformValues.subarray(kProjectionOffset, kProjectionOffset + 16);
+  const viewValue = uniformValues.subarray(kViewOffset, kViewOffset + 16);
+  const worldValue = uniformValues.subarray(kWorldOffset, kWorldOffset + 16);
+  const cameraPositionValue = uniformValues.subarray(
+      kCameraPositionOffset, kCameraPositionOffset + 3);

And we need to set them at render time

    const aspect = canvas.clientWidth / canvas.clientHeight;
    mat4.perspective(
        60 \* Math.PI / 180,
        aspect,
        0.1,      // zNear
        10,      // zFar
-        matrixValue,
+        projectionValue,
    );
+    cameraPositionValue.set(\[0, 0, 4\]);  // camera position;
    const view = mat4.lookAt(
-      \[0, 1, 5\],  // camera position
+      cameraPositionValue,
      \[0, 0, 0\],  // target
      \[0, 1, 0\],  // up
+      viewValue,
    );
-    mat4.multiply(matrixValue, view, matrixValue);
-    mat4.rotateX(matrixValue, settings.rotation\[0\], matrixValue);
-    mat4.rotateY(matrixValue, settings.rotation\[1\], matrixValue);
-    mat4.rotateZ(matrixValue, settings.rotation\[2\], matrixValue);
+    mat4.identity(worldValue);
+    mat4.rotateX(worldValue, time \* -0.1, worldValue);
+    mat4.rotateY(worldValue, time \* -0.2, worldValue);

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

Let’s also change the rendering to a rAF loop

\-  const degToRad = d => d \* Math.PI / 180;
-
-  const settings = {
-    rotation: \[degToRad(20), degToRad(25), degToRad(0)\],
-  };
-
-  const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
-
-  const gui = new GUI();
-  gui.onChange(render);
-  gui.add(settings.rotation, '0', radToDegOptions).name('rotation.x');
-  gui.add(settings.rotation, '1', radToDegOptions).name('rotation.y');
-  gui.add(settings.rotation, '2', radToDegOptions).name('rotation.z');

  let depthTexture;

-  function render() {
+  function render(time) {
+    time \*= 0.001;

     ...

+    requestAnimationFrame(render);
+  }
+  requestAnimationFrame(render);

  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const canvas = entry.target;
      const width = entry.contentBoxSize\[0\].inlineSize;
      const height = entry.contentBoxSize\[0\].blockSize;
      canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
      canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
-      // re-render
-      render();
    }
  });
  observer.observe(canvas);

And with that we get.

[click here to open in a separate window](/webgpu/lessons/../webgpu-environment-map-backward.html)

If you look closely you might see a small problem.

![](resources/environment-map-backward.png)

## Correcting the reflection direction

Our cube with an environment map applied to it represents a mirrored cube. But a mirror normally shows things flipped horizontally. What’s going on?

The issue is, we’re on the inside of the cube looking out, but recall from [the previous article](webgpu-cube-maps.html), when we mapped textures to each side of the cube they mapped correctly when viewed from the outside.

Another way to look at this is, from inside the cube we’re in a “y-up right handed coordinate system”. This means positive-z is forward. Where as all of our 3d math so far uses a “y-up left handed coordinate system” [\[1\]](#fn1) where negative-z is forward. A simple solution is to flip the Z coordinate when we sample the texture.

\-  return textureSample(ourTexture, ourSampler, direction);
+  return textureSample(ourTexture, ourSampler, direction \* vec3f(1, 1, -1));

Now the reflection is flipped, just like in a mirror.

[click here to open in a separate window](/webgpu/lessons/../webgpu-environment-map.html)

Next let’s show [how to use a cubemap for a skybox](webgpu-skybox.html).

## Finding and Making Cube Maps

You can find hundreds of free panoramas at [polyhaven.com](https://polyhaven.com/hdris). Download a jpg or png of any one of them (click the ≡ menu in the top right). Then, go to [this page](https://greggman.github.io/panorama-to-cubemap/) and drag and drop the .jpg or .png file there. Select the size and format you want and click the button to save the images as cubemap faces.

* * *

1.  To be honest I find this talk of “left handed” vs “right handed” coordinate systems to be super confusing and I’d much rather say “+x to the right, +y up, -z forward”, which leaves zero ambiguity. If you want to know more though you can [google it](https://www.google.com/search?q=right+handed+vs+left+handed+coordinate+system&tbm=isch) 😄 [↩︎](#fnref1)
    

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU Environment Maps (reflections)\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');