English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU - Spot Lighting

This article is a continuation of [the article on Point Lighting](webgpu-lighting-point.html). If you haven’t read that I suggest [you start there](webgpu-lighting-point.html).

In the last article we covered point lighting where for every point on the surface of our object we compute the direction from the light to that point on the surface. We then do the same thing we did for [directional lighting](webgpu-lighting-directional.html) which is we took the dot product of the surface normal (the direction the surface is facing) and the light direction. This gave us a value of 1 if the two directions matched and should therefore be fully lit. 0 if the two directions were perpendicular and -1 if they were opposite. We used that value directly to multiply the color of the surface which gave us lighting.

Spot lighting is only a very small change. In fact if you think creatively about the stuff we’ve done so far you might be able to derive your own solution.

You can imagine a point light as a point with light going in all directions from that point. To make a spot light all we need to do is choose a direction from that point, this is the direction of our spotlight. Then, for every direction the light is going we could take the dot product of that direction with our chosen spotlight direction. We’d pick some arbitrary limit and decide if we’re within that limit we light. If we’re not within that limit we don’t light.

In the diagram above we can see a light with rays going in all directions and printed on them is their dot product relative to the direction. We then have a specific **direction** that is the direction of the spotlight. We choose a limit (above it’s in degrees). From the limit we compute a _dot limit_, we just take the cosine of the limit. If the dot product of our chosen direction of the spotlight to the direction of each ray of light is above the dot limit then we do the lighting. Otherwise no lighting.

To say this another way, let’s say the limit is 20 degrees. We can convert that to radians and from that to a value for -1 to 1 by taking the cosine. Let’s call that dot space. In other words here’s a small table for limit values

          limits in
 degrees | radians | dot space
 --------+---------+----------
    0    |   0.0   |    1.0
    22   |    .38  |     .93
    45   |    .79  |     .71
    67   |   1.17  |     .39
    90   |   1.57  |    0.0
   180   |   3.14  |   -1.0

Then we can the just check

dotFromDirection = dot(surfaceToLight, -lightDirection)
if (dotFromDirection >= limitInDotSpace) {
   // do the lighting
}

Let’s do that

First let’s modify our fragment shader from [the last article](webgpu-lighting-point.html).

struct Uniforms {
  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
  world: mat4x4f,
  color: vec4f,
  lightWorldPosition: vec3f,
  viewWorldPosition: vec3f,
  shininess: f32,
+  lightDirection: vec3f,
+  limit: f32,
};

...

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  // Because vsOut.normal is an inter-stage variable 
  // it's interpolated so it will not be a unit vector.
  // Normalizing it will make it a unit vector again
  let normal = normalize(vsOut.normal);

  let surfaceToLightDirection = normalize(vsOut.surfaceToLight);
  let surfaceToViewDirection = normalize(vsOut.surfaceToView);
  let halfVector = normalize(
    surfaceToLightDirection + surfaceToViewDirection);


+  var light = 0.0;
+  var specular = 0.0;
+
+  let dotFromDirection = dot(surfaceToLightDirection, -uni.lightDirection);
+  if (dotFromDirection > uni.limit) {
    // Compute the light by taking the dot product
    // of the normal with the direction to the light
-    let light = dot(normal, surfaceToLightDirection);
+    light = dot(normal, surfaceToLightDirection);

    specular = dot(normal, halfVector);
    specular = select(
        0.0,                           // value if condition is false
        pow(specular, uni.shininess),  // value if condition is true
        specular > 0.0);               // condition
+  }

  // Lets multiply just the color portion (not the alpha)
  // by the light
  let color = uni.color.rgb \* light + specular;
  return vec4f(color, uni.color.a);
}

Of course we need to add space for the new values in our uniform buffer.

\-  const uniformBufferSize = (12 + 16 + 16 + 4 + 4 + 4) \* 4;
+  const uniformBufferSize = (12 + 16 + 16 + 4 + 4 + 4 + 4) \* 4;
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
  const kLightWorldPositionOffset = 48;
  const kViewWorldPositionOffset = 52;
  const kShininessOffset = 55;
+  const kLightDirectionOffset = 56;
+  const kLimitOffset = 59;

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
  const shininessValue = uniformValues.subarray(
      kShininessOffset, kShininessOffset + 1);
+  const lightDirectionValue = uniformValues.subarray(
+      kLightDirectionOffset, kLightDirectionOffset + 3);
+  const limitValue = uniformValues.subarray(
+      kLimitOffset, kLimitOffset + 1);

and we need to set them

    colorValue.set(\[0.2, 1, 0.2, 1\]);  // green
    lightWorldPositionValue.set(\[-10, 30, 100\]);
    viewWorldPositionValue.set(eye);
    shininessValue\[0\] = settings.shininess;
+    limitValue\[0\] = Math.cos(settings.limit);

    // Since we don't have a plane like most spotlight examples
    // let's point the spot light at the F
    {
        const mat = mat4.aim(
            lightWorldPositionValue,
            \[
              target\[0\] + settings.aimOffsetX,
              target\[1\] + settings.aimOffsetY,
              0,
            \],
            up);
        // get the zAxis from the matrix
        // negate it because lookAt looks down the -Z axis
        lightDirectionValue.set(mat.slice(8, 11));
    }

Above we’re using `mat4.aim` which we covered in [the article on cameras](webgpu-cameras.html). Specifically our F is `target`. The spot light is at `-10, 30, 100`. We add some offsets to the target so we can easily aim the spotlight. We then just pull out the _z axis_ since that’s the direction aim points something.

We just need to add some UI code

  const settings = {
    rotation: degToRad(0),
    shininess: 30,
+    limit: degToRad(15),
+    aimOffsetX: -10,
+    aimOffsetY: 10,
  };

  const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
+  const limitOptions = { min: 0, max: 90, minRange: 1, step: 1, converters: GUI.converters.radToDeg };

  const gui = new GUI();
  gui.onChange(render);
  gui.add(settings, 'rotation', radToDegOptions);
  gui.add(settings, 'shininess', { min: 1, max: 250 });
+  gui.add(settings, 'limit', limitOptions);
+  gui.add(settings, 'aimOffsetX', -50, 50);
+  gui.add(settings, 'aimOffsetY', -50, 50);

And here it is

[click here to open in a separate window](/webgpu/lessons/../webgpu-lighting-spot.html)

One note is we’re negating `uni.lightDirection` in the shader. That’s a [_six of one, half dozen of another_](https://en.wiktionary.org/wiki/six_of_one,_half_a_dozen_of_the_other) type of thing. We want the 2 directions we’re comparing to point in the same direction when they match. That means we need to compare the surfaceToLightDirection to the opposite of the spotlight direction.

Right now the spotlight is super harsh. We’re either inside the spotlight or not and things just turn black.

To fix this we could use 2 limits instead of one, an inner limit and an outer limit. If we’re inside the inner limit then use 1.0. If we’re outside the outer limit then use 0.0. If we’re between the inner limit and the outer limit then lerp between 1.0 and 0.0.

Here’s one way we could do this

struct Uniforms {
  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
  world: mat4x4f,
  color: vec4f,
  lightWorldPosition: vec3f,
  viewWorldPosition: vec3f,
  shininess: f32,
  lightDirection: vec3f,
-  limit: f32,
+  innerLimit: f32,
+  outerLimit: f32,
};

...

-  var light = 0.0;
-  var specular = 0.0;
-
-  let dotFromDirection = dot(surfaceToLightDirection, -uni.lightDirection);
-  if (dotFromDirection > uni.limit) {
-    // Compute the light by taking the dot product
-    // of the normal with the direction to the light
-    light = dot(normal, surfaceToLightDirection);
-    specular = dot(normal, halfVector);
-    specular = select(
-        0.0,                           // value if condition false
-        pow(specular, uni.shininess),  // value if condition is true
-        specular > 0.0);               // condition
-  }

    let dotFromDirection = dot(surfaceToLightDirection, -uni.lightDirection);
    let limitRange = uni.innerLimit - uni.outerLimit;
    let inLight = saturate((dotFromDirection - uni.outerLimit) / limitRange);

    // Compute the light by taking the dot product
    // of the normal with the direction to the light
    let light = inLight \* dot(normal, surfaceToLightDirection);

    var specular = dot(normal, halfVector);
    specular = inLight \* select(
        0.0,                           // value if condition false
        pow(specular, uni.shininess),  // value if condition is true
        specular > 0.0);               // condition

We’re using `saturate`. Saturate clamps a value between 0 and 1. This means `inLight` will be 0 if we’re outside of the `outerLimit`. It will be 1 if we’re inside the `innerLimit`. And, it will be between 0 and 1 between those 2 limits. We then multiply the light and specular calculations by `inLight`.

And again we need to update our uniform buffer setup

\-  const uniformBufferSize = (12 + 16 + 16 + 4 + 4 + 4 + 4) \* 4;
+  const uniformBufferSize = (12 + 16 + 16 + 4 + 4 + 4 + 4 + 4) \* 4;
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
  const kLightWorldPositionOffset = 48;
  const kViewWorldPositionOffset = 52;
  const kShininessOffset = 55;
  const kLightDirectionOffset = 56;
-  const kLimitOffset = 59;
+  const kInnerLimitOffset = 59;
+  const kOuterLimitOffset = 60;

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
  const shininessValue = uniformValues.subarray(
      kShininessOffset, kShininessOffset + 1);
  const lightDirectionValue = uniformValues.subarray(
      kLightDirectionOffset, kLightDirectionOffset + 3);
-  const limitValue = uniformValues.subarray(
-      kLimitOffset, kLimitOffset + 1);
+  const innerLimitValue = uniformValues.subarray(
+      kInnerLimitOffset, kInnerLimitOffset + 1);
+  const outerLimitValue = uniformValues.subarray(
+      kOuterLimitOffset, kOuterLimitOffset + 1);

and where we set them

  const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
+  const limitOptions = { min: 0, max: 90, minRange: 1, step: 1, converters: GUI.converters.radToDeg };

  const gui = new GUI();
  gui.onChange(render);
  gui.add(settings, 'rotation', radToDegOptions);
  gui.add(settings, 'shininess', { min: 1, max: 250 });
-  gui.add(settings, 'limit', limitOptions);
+  GUI.makeMinMaxPair(gui, settings, 'innerLimit', 'outerLimit', limitOptions);
  gui.add(settings, 'aimOffsetX', -50, 50);
  gui.add(settings, 'aimOffsetY', -50, 50);

  ...

  function render() {

    ...

    colorValue.set(\[0.2, 1, 0.2, 1\]);  // green
    lightWorldPositionValue.set(\[-10, 30, 100\]);
    viewWorldPositionValue.set(eye);
    shininessValue\[0\] = settings.shininess;
-    limitValue\[0\] = Math.cos(settings.limit);
+    innerLimitValue\[0\] = Math.cos(settings.innerLimit);
+   outerLimitValue\[0\] = Math.cos(settings.outerLimit);

    ...

And that works

[click here to open in a separate window](/webgpu/lessons/../webgpu-lighting-spot-w-linear-falloff.html)

Now we’re getting something that looks more like a spotlight!

One thing to be aware of is if `innerLimit` is equal to `outerLimit` then `limitRange` will be 0.0. We divide by `limitRange` and dividing by zero is bad/undefined. There’s nothing to do in the shader here. We just need to make sure in our JavaScript that `innerLimit` is never equal to `outerLimit` which, in this case, our gui does for us.

WGSL also has a function we could use to slightly simplify this. It’s called `smoothstep` it returns a value from 0 to 1 but it takes both an lower and upper bound and lerps between 0 and 1 between those bounds.

     smoothstep(lowerBound, upperBound, value)

Let’s do that

    let dotFromDirection = dot(surfaceToLightDirection, -uni.lightDirection);
-    let limitRange = uni.innerLimit - uni.outerLimit;
-    let inLight = saturate((dotFromDirection - uni.outerLimit) / limitRange);
+    let inLight = smoothStep(uni.outerLimit, uni.innerLimit, dotFromDirection);

That works too

[click here to open in a separate window](/webgpu/lessons/../webgpu-lighting-spot-w-smoothstep-falloff.html)

The difference is `smoothstep` uses a _hermite interpolation_ instead of a linear interpolation. That means between `lowerBound` and `upperBound` it interpolates like the image below on the right whereas a linear interpolation is like the image on the left.

![](resources/linear-vs-hermite.png)

It’s up to you if you think the difference matters.

One other thing to be aware is the `smoothstep` function has undefined results if the `lowerBound` is greater than or equal to `upperBound`. Having them be equal is the same issue we had above. The added issue of not being defined if `lowerBound` is greater than `upperBound` is new but for the purpose of a spotlight that should never be true.

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU - Spot Lighting\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');