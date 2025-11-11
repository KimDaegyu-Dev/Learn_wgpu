English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU - Point Lighting

This article is a continuation of [WebGPU Directional Lighting](webgpu-lighting-directional.html). If you haven’t read that I suggest [you start there](webgpu-lighting-directional.html).

In the previous article we covered directional lighting where the light is coming universally from the same direction. We set that direction before rendering.

What if instead of setting the direction for the light we picked a point in 3d space for the light and computed the direction from that point to each visible spot on the surface of our model in our shader? That would give us a point light.

If you rotate the surface above you’ll see how each point on the surface has a different _surface to light_ vector. Getting the dot product of the surface normal and each individual surface to light vector gives us a different value at each point on the surface.

So, let’s do that.

First we need the light position

struct Uniforms {
  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
  color: vec4f,
-  lightDirection: vec3f,
+  lightPosition: vec3f,
};

And we need a way to compute the world position of the surface. For that we can multiply our positions by the world matrix so …

struct Uniforms {
  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
+  world: mat4x4f,
  color: vec4f,
  lightDirection: vec3f,
  lightPosition: vec3f,
};

....

  // Compute the world position of the surface
  let surfaceWorldPosition = (u\_world \* vert.position).xyz;

And we can compute a vector from the surface to the light which is similar to the light direction we had before except this time we’re computing it for every position on the surface to a light’s world position point.

  struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f,
    @location(1) surfaceToLight: vec3f,
  };

  ...

    // Compute the vector of the surface to the light
    // and pass it to the fragment shader
    vsOut.surfaceToLight = uni.lightPosition - surfaceWorldPosition;

Here’s all that in context

struct Uniforms {
  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
\*  world: mat4x4f,
  color: vec4f,
\*  lightPosition: vec3f,
};

struct Vertex {
  @location(0) position: vec4f,
  @location(1) normal: vec3f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
\*  @location(1) surfaceToLight: vec3f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.position = uni.worldViewProjection \* vert.position;

  // Orient the normals and pass to the fragment shader
  vsOut.normal = uni.normalMatrix \* vert.normal;

\*  // Compute the world position of the surface
\*  let surfaceWorldPosition = (uni.world \* vert.position).xyz;
\*
\*  // Compute the vector of the surface to the light
\*  // and pass it to the fragment shader
\*  vsOut.surfaceToLight = uni.lightPosition - surfaceWorldPosition;

  return vsOut;
}

Now in the fragment shader we need to normalize the surface to light vector since it’s a not a unit vector. Note that we could normalize in the vertex shader but because it’s an _inter-stage variable_ it will be linearly interpolated between our positions and so would not be a complete unit vector

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  // Because vsOut.normal is an inter-stage variable 
  // it's interpolated so it will not be a unit vector.
  // Normalizing it will make it a unit vector again
  let normal = normalize(vsOut.normal);

+  let surfaceToLightDirection = normalize(vsOut.surfaceToLight);

  // Compute the light by taking the dot product
-  // of the normal to the light's reverse direction
-  let light = dot(normal, -uni.lightDirection);
+  // of the normal with the direction to the light
+  let light = dot(normal, surfaceToLightDirection);

  // Lets multiply just the color portion (not the alpha)
  // by the light
  let color = uni.color.rgb \* light;
  return vec4f(color, uni.color.a);
}

Then we need to update our uniform buffer, offsets, and views

\-  const uniformBufferSize = (12 + 16 + 4 + 4) \* 4;
+  const uniformBufferSize = (12 + 16 + 16 + 4 + 4) \* 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kNormalMatrixOffset = 0;
  const kWorldViewProjectionOffset = 12;
-  const kColorOffset = 28;
-  const kLightDirectionOffset = 32;
+  const kWorldOffset = 28;
+  const kColorOffset = 44;
+  const kLightPositionOffset = 48;

  const normalMatrixValue = uniformValues.subarray(
      kNormalMatrixOffset, kNormalMatrixOffset + 12);
  const worldViewProjectionValue = uniformValues.subarray(
      kWorldViewProjectionOffset, kWorldViewProjectionOffset + 16);
+  const worldValue = uniformValues.subarray(
+      kWorldOffset, kWorldOffset + 16);
  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
-  const lightDirectionValue =
-      uniformValues.subarray(kLightDirectionOffset, kLightDirectionOffset + 3);
+  const lightPositionValue =
+      uniformValues.subarray(kLightPositionOffset, kLightPositionOffset + 3);

and we need to set them

    const eye = \[100, 150, 200\];
    const target = \[0, 35, 0\];
    const up = \[0, 1, 0\];

    // Compute a view matrix
    const viewMatrix = mat4.lookAt(eye, target, up);

    // Combine the view and projection matrixes
    const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);

    // Compute a world matrix
-    const world = mat4.rotationY(settings.rotation);
+    const world = mat4.rotationY(settings.rotation, worldValue);

    // Combine the viewProjection and world matrices
    mat4.multiply(viewProjectionMatrix, world, worldViewProjectionValue);

    // Inverse and transpose it into the worldInverseTranspose value
    mat3.fromMat4(mat4.transpose(mat4.inverse(world)), normalMatrixValue);

    colorValue.set(\[0.2, 1, 0.2, 1\]);  // green
=    lightDirectionValue.set(vec3.normalize(\[-0.5, -0.7, -1\]));
+    lightPositionValue.set(\[-10, 30, 100\]);

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

And here it is

[click here to open in a separate window](/webgpu/lessons/../webgpu-lighting-point.html)

# Specular Highlighting

Now that we have a point we can add something called specular highlighting.

If you look at on object in the real world, if it’s remotely shiny, then if it happens to reflect the light directly at you it’s almost like a mirror

![](resources/specular-highlights.jpg)

We can simulate that effect by computing if the light reflects into our eyes. Again the _dot-product_ comes to the rescue.

What do we need to check? Well let’s think about it. Light reflects at the same angle it hits a surface so if the direction of the surface to the light is the exact reflection of the surface to the eye then it’s at the perfect angle to reflect

If we know the direction from the surface of our model to the light (which we do since we just did that). And if we know the direction from the surface to view/eye/camera, which we can compute, then we can add those 2 vectors and normalize them to get the `halfVector` which is the vector that sits half way between them. If the halfVector and the surface normal match then it’s the perfect angle to reflect the light into the view/eye/camera. And how can we tell when they match? Take the _dot product_ just like we did before. 1 = they match, same direction, 0 = they’re perpendicular, -1 = they’re opposite.

So first thing is we need to pass in the view/camera/eye position, compute the surface to view vector and pass it to the fragment shader.

struct Uniforms {
  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
  world: mat4x4f,
  color: vec4f,
  lightPosition: vec3f,
+  viewWorldPosition: vec3f,
};

struct Vertex {
  @location(0) position: vec4f,
  @location(1) normal: vec3f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
  @location(1) surfaceToLight: vec3f,
+  @location(2) surfaceToView: vec3f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.position = uni.worldViewProjection \* vert.position;

  // Orient the normals and pass to the fragment shader
  vsOut.normal = uni.normalMatrix \* vert.normal;

  // Compute the world position of the surface
  let surfaceWorldPosition = (uni.world \* vert.position).xyz;

  // Compute the vector of the surface to the light
  // and pass it to the fragment shader
  vsOut.surfaceToLight = uni.lightPosition - surfaceWorldPosition;

+  // Compute the vector of the surface to the light
+  // and pass it to the fragment shader
+  vsOut.surfaceToView = uni.viewWorldPosition - surfaceWorldPosition;

  return vsOut;
}

Next in the fragment shader we need to compute the `halfVector` between the surface to view and surface to light vectors. Then we can take the dot product the `halfVector` and the normal to find out if the light is reflecting into the view.

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  // Because vsOut.normal is an inter-stage variable 
  // it's interpolated so it will not be a unit vector.
  // Normalizing it will make it a unit vector again
  let normal = normalize(vsOut.normal);

  let surfaceToLightDirection = normalize(vsOut.surfaceToLight);

  // Compute the light by taking the dot product
  // of the normal with the direction to the light
  let light = dot(normal, surfaceToLightDirection);

+  let surfaceToViewDirection = normalize(vsOut.surfaceToView);
+  let halfVector = normalize(
+    surfaceToLightDirection + surfaceToViewDirection);
+  let specular = dot(normal, halfVector);

  // Lets multiply just the color portion (not the alpha)
  // by the light
-  let color = uni.color.rgb \* light;
+  let color = uni.color.rgb \* light + specular;
  return vec4f(color, uni.color.a);
}

Again we have add room for viewWorldPosition to our uniformBuffer.

\-  const uniformBufferSize = (12 + 16 + 16 + 4 + 4) \* 4;
+  const uniformBufferSize = (12 + 16 + 16 + 4 + 4 + 4) \* 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kNormalMatrixOffset = 0;
  const kWorldViewProjectionOffset = 12;
  const kWorldOffset = 28;
  const kColorOffset = 44;
  const kLightPositionOffset = 48;
+  const kViewWorldPositionOffset = 52;

  const normalMatrixValue = uniformValues.subarray(
      kNormalMatrixOffset, kNormalMatrixOffset + 12);
  const worldViewProjectionValue = uniformValues.subarray(
      kWorldViewProjectionOffset, kWorldViewProjectionOffset + 16);
  const worldValue = uniformValues.subarray(
      kWorldOffset, kWorldOffset + 16);
  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
  const lightPositionValue = uniformValues.subarray(
      kLightPositionOffset, kLightPositionOffset + 3);
+  const viewWorldPositionValue = uniformValues.subarray(
+      kViewWorldPositionOffset, kViewWorldPositionOffset + 3);

and set it

    const eye = \[100, 150, 200\];
    const target = \[0, 35, 0\];
    const up = \[0, 1, 0\];

    ...

    viewWorldPositionValue.set(eye);

And here’s that

[click here to open in a separate window](/webgpu/lessons/../webgpu-lighting-point-w-specular.html)

**DANG THAT’S BRIGHT!**

We can fix the brightness by raising the dot-product result to a power. This will scrunch up the specular highlight from a linear falloff to an exponential falloff.

The closer the red line is to the top of the graph the brighter our specular addition will be. By raising the power it scrunches the range where it goes bright to the right.

Let’s call that `shininess` and add it to our shader.

struct Uniforms {
  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
  world: mat4x4f,
  color: vec4f,
  lightWorldPosition: vec3f,
  viewWorldPosition: vec3f,
+  shininess: f32,
};

...

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {

  ...

-  let specular = dot(normal, halfVector);
+  var specular = dot(normal, halfVector);
+  specular = select(
+      0.0,                           // value if condition false
+      pow(specular, uni.shininess),  // value if condition is true
+      specular > 0.0);               // condition

The dot product can go negative. Taking a negative number to a power is undefined in WebGPU (or is NaN?) which would be bad. So, if the dot product is negative then we just leave specular at 0.0.

Of course we need to set `shininess`.

  const kNormalMatrixOffset = 0;
  const kWorldViewProjectionOffset = 12;
  const kWorldOffset = 28;
  const kColorOffset = 44;
  const kLightWorldPositionOffset = 48;
  const kViewWorldPositionOffset = 52;
+  const kShininessOffset = 55;

  const normalMatrixValue = uniformValues.subarray(
      kNormalMatrixOffset, kNormalMatrixOffset + 12);
  const worldViewProjectionValue = uniformValues.subarray(
      kWorldViewProjectionOffset, kWorldViewProjectionOffset + 16);
  const worldValue = uniformValues.subarray(
      kWorldOffset, kWorldOffset + 16);
  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
  const lightWorldPositionValue = uniformValues.subarray(
      kLightWorldPositionOffset, kLightWorldPositionOffset + 3);
  const viewWorldPositionValue = uniformValues.subarray(
      kViewWorldPositionOffset, kViewWorldPositionOffset + 3);
+  const shininessValue = uniformValues.subarray(
+      kShininessOffset, kShininessOffset + 1);

...

  const settings = {
    rotation: degToRad(0),
+    shininess: 30,
  };

  const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };

  const gui = new GUI();
  gui.onChange(render);
  gui.add(settings, 'rotation', radToDegOptions);
+  gui.add(settings, 'shininess', { min: 1, max: 250 });

...

  function render() {

   ...

+    shininessValue\[0\] = settings.shininess;

And here’s that

[click here to open in a separate window](/webgpu/lessons/../webgpu-lighting-point-w-specular-power.html)

Coming up next [spot lighting](webgpu-lighting-spot.html).

### Why is `pow(negative, power)` undefined?

What does this mean?

pow(5, 2)

Well you can look at it as

5 \* 5 = 25

What about

pow(5, 3)

Well you can look at that as

5 \* 5 \* 5 = 125

Ok, how about

pow(-5, 2)

Well that could be

\-5 \* -5 = 25

And

pow(-5, 3)

Well you can look at as

\-5 \* -5 \* -5 = -125

As you know multiplying a negative by a negative makes a positive. Multiplying by a negative again makes it negative.

Well then what does this mean?

pow(-5, 2.5)

How do you decide whether the result of that positive or negative? That's the land of [imaginary numbers](https://betterexplained.com/articles/a-visual-intuitive-guide-to-imaginary-numbers/).

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU - Point Lighting\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');