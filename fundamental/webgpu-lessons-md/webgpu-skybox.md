English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU SkyBox

This article continues from [the article on environment maps](webgpu-environment-maps.html).

An _skybox_ is a box with textures on it to look like the sky in all directions or rather to look like what is very far away including the horizon. Imagine you’re standing in a room and on each wall is a full size poster of some view, add in a poster to cover the ceiling showing the sky and one for the floor showing the ground and that’s a skybox.

Lots of 3D games do this by just making a cube, making it really large, putting a texture on it of the sky.

This works but it has issues. One issue is that you have a cube that you need to view in multiple directions, Whatever direction the camera is facing. You want everything to draw far away but you don’t want the corners of the cube to go out of the clipping plane. Complicating that issue, for performance reasons you want to draw close things before far things because the GPU, using a [depth texture](webgpu-orthographic.html), can skip drawing pixels it knows will fail the test. So ideally you should draw the skybox last with the depth test on but if you actually use a box, as the camera looks in different directions, the corners of the box will be further away than the sides causing issues.

![](resources/skybox-issues.svg)

You can see above we need to make sure the furthest point of the cube is inside the frustum but because of that some edges of the cube might end up covering up objects that we don’t want covered up.

The typical solution is to turn off the depth test and draw the skybox first but then we don’t get the performance benefit from the depth test not drawing pixels that we’ll later cover with stuff in our scene.

Instead of using a cube lets just [draw a triangle that covers the entire canvas](webgpu-large-triangle-to-cover-clip-space.html) and use [a cubemap](webgpu-cube-maps.html). Normally we use a view projection matrix to project geometry in 3D space. In this case we’ll do the opposite. We’ll use the inverse of the view projection matrix to work backward and get the direction the camera is looking for each pixel being drawn. This will give us directions to look into the cubemap.

Starting with the [environment map example](webgpu-environment-maps.html) since it already loads a cubemap and generates mips for it. Let’s use a hard coded triangle. Here’s the shader

struct Uniforms {
  viewDirectionProjectionInverse: mat4x4f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) pos: vec4f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;
@group(0) @binding(1) var ourSampler: sampler;
@group(0) @binding(2) var ourTexture: texture\_cube<f32>;

@vertex fn vs(@builtin(vertex\_index) vNdx: u32) -> VSOutput {
  let pos = array(
    vec2f(-1, 3),
    vec2f(-1,-1),
    vec2f( 3,-1),
  );
  var vsOut: VSOutput;
  vsOut.position = vec4f(pos\[vNdx\], 1, 1);
  vsOut.pos = vsOut.position;
  return vsOut;
}

You can see above, first we set `@builtin(position)` via `vsOut.position` to the our vertex position and we explicitly set z to 1 so the quad will be dawn at the furthest z value. We also pass the vertex position to the fragment shader.

In the fragment shader we multiply the position by the inverse view projection matrix and divide by w to go from 4D space to 3D space. This is the same divide happens to `@builtin(position)` in the vertex shader but here we’re doing it ourselves.

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  let t = uni.viewDirectionProjectionInverse \* vsOut.pos;
  return textureSample(ourTexture, ourSampler, normalize(t.xyz / t.w) \* vec3f(1, 1, -1));
}

Note: We multiply the z direction by -1 for [the reasons we covered in the previous article](webgpu-environment-maps.html#a-flipped).

The pipeline has no buffers in the vertex stage

  const pipeline = device.createRenderPipeline({
    label: 'no attributes',
    layout: 'auto',
    vertex: {
      module,
    },
    fragment: {
      module,
      targets: \[{ format: presentationFormat }\],
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less-equal',
      format: 'depth24plus',
    },
  });

Notice we set the `depthCompare` to `less-equal` instead of `less` because we clear the depth texture to 1.0 and we’re rendering at 1.0. 1.0 is not less than 1.0 so we’d render nothing if we didn’t change this to `less-equal`.

Again we need to setup a uniform buffer

  // viewDirectionProjectionInverse
  const uniformBufferSize = (16) \* 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY\_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kViewDirectionProjectionInverseOffset = 0;

  const viewDirectionProjectionInverseValue = uniformValues.subarray(
      kViewDirectionProjectionInverseOffset,
      kViewDirectionProjectionInverseOffset + 16);

and set it at render time

    const aspect = canvas.clientWidth / canvas.clientHeight;
    const projection = mat4.perspective(
        60 \* Math.PI / 180,
        aspect,
        0.1,      // zNear
        10,      // zFar
    );
    // Camera going in circle from origin looking at origin
    const cameraPosition = \[Math.cos(time \* .1), 0, Math.sin(time \* .1)\];
    const view = mat4.lookAt(
      cameraPosition,
      \[0, 0, 0\],  // target
      \[0, 1, 0\],  // up
    );
    // We only care about direction so remove the translation
    view\[12\] = 0;
    view\[13\] = 0;
    view\[14\] = 0;

    const viewProjection = mat4.multiply(projection, view);
    mat4.inverse(viewProjection, viewDirectionProjectionInverseValue);

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

Notice above we’re spinning the camera around the origin where we compute `cameraPosition`. Then, after make a `view` matrix we zero out the translation since we only care which way the camera is facing, not where it is.

From that we multiply with the projection matrix, take the inverse, and then set the matrix.

[click here to open in a separate window](/webgpu/lessons/../webgpu-skybox.html)

Let’s combine the environment mapped cube back into this sample. First off lets’s rename a bunch of variables

From the skybox example

module -> skyBoxModule
pipeline -> skyBoxPipeline
uniformBuffer -> skyBoxUniformBuffer
uniformValues -> skyBoxUniformValues
bindGroup -> skyBoxBindGroup

Similarly from the environment map example

module -> envMapModule
pipeline -> envMapPipeline
uniformBuffer -> envMapUniformBuffer
uniformValues -> envMapUniformValues
bindGroup -> envMapBindGroup

With those renamed we just have to update our rendering code. First we update the uniform values for both

    const aspect = canvas.clientWidth / canvas.clientHeight;
    mat4.perspective(
        60 \* Math.PI / 180,
        aspect,
        0.1,      // zNear
        10,      // zFar
        projectionValue,
    );
    // Camera going in circle from origin looking at origin
    cameraPositionValue.set(\[Math.cos(time \* .1) \* 5, 0, Math.sin(time \* .1) \* 5\]);
    const view = mat4.lookAt(
      cameraPositionValue,
      \[0, 0, 0\],  // target
      \[0, 1, 0\],  // up
    );
    // Copy the view into the viewValue since we're going
    // to zero out the view's translation
    viewValue.set(view);

    // We only care about direction so remove the translation
    view\[12\] = 0;
    view\[13\] = 0;
    view\[14\] = 0;
    const viewProjection = mat4.multiply(projectionValue, view);
    mat4.inverse(viewProjection, viewDirectionProjectionInverseValue);

    // Rotate the cube
    mat4.identity(worldValue);
    mat4.rotateX(worldValue, time \* -0.1, worldValue);
    mat4.rotateY(worldValue, time \* -0.2, worldValue);

    // upload the uniform values to the uniform buffers
    device.queue.writeBuffer(envMapUniformBuffer, 0, envMapUniformValues);
    device.queue.writeBuffer(skyBoxUniformBuffer, 0, skyBoxUniformValues);

Then we render both. The environment mapped cube first and the skybox second to show that drawing it second works.

    // Draw the cube
    pass.setPipeline(envMapPipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setIndexBuffer(indexBuffer, 'uint16');
    pass.setBindGroup(0, envMapBindGroup);
    pass.drawIndexed(numVertices);

    // Draw the skyBox
    pass.setPipeline(skyBoxPipeline);
    pass.setBindGroup(0, skyBoxBindGroup);
    pass.draw(3);

[click here to open in a separate window](/webgpu/lessons/../webgpu-skybox-plus-environment-map.html)

I hope these last 2 articles have given you some idea of how to use a cubemap. It’s common for example to take the code [from computing lighting](webgpu-lighting-spot.html) and combine that result with results from an environment map to make materials like the hood of a car or polished floor.

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU SkyBox\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');