English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU Translation

This article assumes you’ve read [the article on fundamentals](webgpu-fundamentals.html), [the article uniforms](webgpu-uniforms.html) and [the article on vertex-buffers](webgpu-vertex-buffers.html). If you have not read them I suggest you read them first, then come back.

This article is the first of series of articles that will hopefully teach you about 3D math. Each one builds on the previous lesson so you may find them easiest to understand by reading them in order.

1.  [Translation](webgpu-translation.html) ⬅ you are here
2.  [Rotation](webgpu-rotation.html)
3.  [Scaling](webgpu-scale.html)
4.  [Matrix Math](webgpu-matrix-math.html)
5.  [Orthographic Projection](webgpu-orthographic-projection.html)
6.  [Perspective Projection](webgpu-perspective-projection.html)
7.  [Cameras](webgpu-cameras.html)
8.  [Matrix Stacks](webgpu-matrix-stacks.html)
9.  [Scene Graphs](webgpu-scene-graphs.html)

We are going to start code similar to the examples from [the article on vertex-buffers](webgpu-vertex-buffers.html) but instead of a bunch of circles we’re going to draw a single F and we’ll use an [index buffer](webgpu-vertex-buffers.html#a-index-buffers) to keep the data smaller.

Let’s work in pixel space instead of clip space, just like the [Canvas 2D API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) We’ll make an F and we’ll build it from 6 triangles like this

![](resources/f-polygons.svg)

Here’s the data for the F

function createFVertices() {
  const vertexData = new Float32Array(\[
    // left column
    0, 0,
    30, 0,
    0, 150,
    30, 150,

    // top rung
    30, 0,
    100, 0,
    30, 30,
    100, 30,

    // middle rung
    30, 60,
    70, 60,
    30, 90,
    70, 90,
  \]);

  const indexData = new Uint32Array(\[
    0,  1,  2,    2,  1,  3,  // left column
    4,  5,  6,    6,  5,  7,  // top run
    8,  9, 10,   10,  9, 11,  // middle run
  \]);

  return {
    vertexData,
    indexData,
    numVertices: indexData.length,
  };
}

The vertex data above is in pixel space so we need to translate that to clip space. We can do that by passing the resolution into the shader and doing some math. Here it is spelled out one step at a time.

struct Uniforms {
  color: vec4f,
  resolution: vec2f,
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
  
  let position = vert.position;

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

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  return uni.color;
}

You can see we take a vertex position and divide it by the resolution. This gives us a value that goes from 0 to 1 across the canvas. We then multiply by 2 to get a value that goes from 0 to 2 across the canvas. We subtract 1. Now our value is in clip space but it’s flipped because the clip space goes positive Y up where as canvas 2d goes positive Y down. So we multiply Y by -1 to flip it. Now we have our needed clip space value which we can output from the shader.

We’ve only got one attribute so our pipeline looks like this

  const pipeline = device.createRenderPipeline({
    label: 'just 2d position',
    layout: 'auto',
    vertex: {
      module,
      buffers: \[
        {
\*          arrayStride: (2) \* 4, // (2) floats, 4 bytes each
\*          attributes: \[
\*            {shaderLocation: 0, offset: 0, format: 'float32x2'},  // position
\*          \],
        },
      \],
    },
    fragment: {
      module,
      targets: \[{ format: presentationFormat }\],
    },
  });

We need to setup a buffer for our uniforms

  // color, resolution, padding
\*  const uniformBufferSize = (4 + 2) \* 4 + 8;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
\*  const kColorOffset = 0;
\*  const kResolutionOffset = 4;
\*
\*  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
\*  const resolutionValue = uniformValues.subarray(kResolutionOffset, kResolutionOffset + 2);
\*
\*  // The color will not change so let's set it once at init time
\*  colorValue.set(\[Math.random(), Math.random(), Math.random(), 1\]);

At render time we need to set the resolution

  function render() {
    ...

    // Set the uniform values in our JavaScript side Float32Array
    resolutionValue.set(\[canvas.width, canvas.height\]);

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

Before we run it lets make the background of the canvas look like graph paper. We’ll set it’s scale so each grid cell of the graph paper is 10x10 pixels and every 100x100 pixels we’ll draw a bolder line.

:root {
  --bg-color: #fff;
  --line-color-1: #AAA;
  --line-color-2: #DDD;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #000;
    --line-color-1: #666;
    --line-color-2: #333;
  }
}
canvas {
  display: block;  /\* make the canvas act like a block   \*/
  width: 100%;     /\* make the canvas fill its container \*/
  height: 100%;
  background-color: var(--bg-color);
  background-image: linear-gradient(var(--line-color-1) 1.5px, transparent 1.5px),
      linear-gradient(90deg, var(--line-color-1) 1.5px, transparent 1.5px),
      linear-gradient(var(--line-color-2) 1px, transparent 1px),
      linear-gradient(90deg, var(--line-color-2) 1px, transparent 1px);
  background-position: -1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px;
  background-size: 100px 100px, 100px 100px, 10px 10px, 10px 10px;  
}

The CSS above should handle both light and dark cases.

All our examples to this point have used an opaque canvas. To make it transparent, so we can see the background we just setup, we need to make a few changes.

First we need to set the `alphaMode` when we configure the canvas to `'premultiplied'`. It defaults to `'opaque'`.

  context.configure({
    device,
    format: presentationFormat,
+    alphaMode: 'premultiplied',
  });

Then we need to clear the canvas to 0, 0, 0, 0 in our [`GPURenderPassDescriptor`](https://www.w3.org/TR/webgpu/#dictdef-gpurenderpassdescriptor). Because the default `clearValue` is 0, 0, 0, 0 we can just delete the line that was setting it to something else.

  const renderPassDescriptor = {
    label: 'our basic canvas renderPass',
    colorAttachments: \[
      {
        // view: <- to be filled out when we render
-        clearValue: \[0.3, 0.3, 0.3, 1\],
        loadOp: 'clear',
        storeOp: 'store',
      },
    \],
  };

And with that, here’s our F

[click here to open in a separate window](/webgpu/lessons/../webgpu-translation-prep.html)

Notice the F’s size relative to the grid behind it. The vertex positions of the F data make an F that is 100 pixels wide and 150 pixels tall and that matches what we displayed. The F starts at 0,0 and extends right to 100,0 and down to 0,150

Now that we have the basics in place, let’s add _translation_.

Translation is just the process of moving things so all we need to do is add translation to our uniforms and add that to our position

struct Uniforms {
  color: vec4f,
  resolution: vec2f,
+  translation: vec2f,
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
  
+  // Add in the translation
-  let position = vert.position;
+  let position = vert.position + uni.translation;

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

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  return uni.color;
}

We need to add room to our uniform buffer

\-  // color, resolution, padding
-  const uniformBufferSize = (4 + 2) \* 4 + 8;
+  // color, resolution, translation
+  const uniformBufferSize = (4 + 2 + 2) \* 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kColorOffset = 0;
  const kResolutionOffset = 4;
+  const kTranslationOffset = 6;

  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
  const resolutionValue = uniformValues.subarray(kResolutionOffset, kResolutionOffset + 2);
+  const translationValue = uniformValues.subarray(kTranslationOffset, kTranslationOffset + 2);

And then we need to set a translation at render time

\+  const settings = {
+    translation: \[0, 0\],
+  };

  function render() {
    ...

    // Set the uniform values in our JavaScript side Float32Array
    resolutionValue.set(\[canvas.width, canvas.height\]);
+    translationValue.set(settings.translation);

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

Finally let’s add a UI so we can adjust the translation

+import GUI from '../3rdparty/muigui-0.x.module.js';

...
  const settings = {
    translation: \[0, 0\],
  };

+  const gui = new GUI();
+  gui.onChange(render);
+  gui.add(settings.translation, '0', 0, 1000).name('translation.x');
+  gui.add(settings.translation, '1', 0, 1000).name('translation.y');

And now we’ve added translation

[click here to open in a separate window](/webgpu/lessons/../webgpu-translation.html)

Notice it matches our pixel grid. If we set the translation to 200,300 the F is drawn with its 0,0 top left vertex at 200,300.

This article might have seemed exceedingly simple. We were already using _translation_ in several examples already though we named it ‘offset’. This article is part of series. Though it was simple, hopefully its point will make sense in context as we continue the series.

Next up is [rotation](webgpu-rotation.html).

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU Translation\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');