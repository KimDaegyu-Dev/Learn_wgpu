English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU Debugging and Errors

Some tips on debugging WebGPU and dealing with errors.

## Keep the JavaScript console open to see WebGPU errors

Most browsers have a JavaScript console. Keep it open. WebGPU should generally print errors there.

## Consider logging uncaught errors

You can setup an event to catch uncaptured WebGPU errors and then log them yourself. For example

const device = await adapter.requestDevice();
device.addEventListener('uncapturederror', event => alert(event.error.message));

Personally, I generally don’t use `alert` but you can log the message, put it an element, or in some way make it visible. I find this useful because I often forget the advice above, to open the JavaScript console, and then I don’t see the errors. 😅

Errors that WebGPU emits itself go to the JavaScript console but errors that you capture go where you tell them to.

## Help WebGPU report errors

Errors in WebGPU are reported asynchronously. This is to keep WebGPU fast and efficient. But, it means sometimes means you might not get an error at the time you expect it or at all, unless you help WebGPU.

Here’s some code using the advice from above, adding an event to show uncaptured errors. It then compiles a shader module that should get an error.

async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();

  device.addEventListener('uncapturederror', event => {
    log(event.error.message);
  });

  device.createShaderModule({
    code: /\* wgsl \*/ \`
      this shader won't compile
    \`,
  });

  log('--done--');
}

In the live example below, at least in Chrome 129, you probably won’t get an error.

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-help-webgpu-report-errors.html)

The reason is, in this case, Chrome in WebGPU doesn’t process certain errors until you call certain functions. One such function is `submit`

async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();

  device.addEventListener('uncapturederror', event => {
    log(event.error.message);
  });

  device.createShaderModule({
    code: /\* wgsl \*/ \`
      this shader won't compile
    \`,
  });

+  // pump WebGPU
+  device.queue.submit(\[\]);

  log('--done--');
}

Now it should show the error.

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-help-webgpu-report-errors-fixed.html)

This issue rarely comes up because if you never call `submit` then you really aren’t using WebGPU yet. But, it can come up in special situations, like when you’re trying to make a minimal complete verifiable example for a tech support question or a bug report. Or if you’re stepping through the code and you pass a line you know is supposed to cause an error and yet no error has appeared yet.

Note: If you don’t want the error to also go to the JavaScript console you can call `event.preventDefault()`

## Manually catching errors.

Above we showed a message for “uncaptured errors” which implies there’s such a thing as a “captured error”. To capture an error there are a pair of functions. `device.pushErrorScope` and `device.popErrorScope`.

You push an error scope. Submit commands, then pop the error scope to see if there were any errors between the time you pushed and the time you popped.

Example:

  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();

  device.addEventListener('uncapturederror', event => {
\*    log('uncaptured error:', event.error.message);
  });

+  device.pushErrorScope('validation');
  device.createShaderModule({
    code: /\* wgsl \*/ \`
      this shader won't compile
    \`,
  });
+  const error = await device.popErrorScope();
+  if (error) {
+    log('captured error:', error.message);
+  }

+  device.createShaderModule({
+    code: /\* wgsl \*/ \`
+      also, this shader won't compile
+    \`,
+  });

  device.queue.submit(\[\]);

  log('--done--');

`device.pushErrorScope` takes one of three filters.

*   `'validation'`
    
    Errors related to using the API incorrectly
    
*   `'out-of-memory'`
    
    Errors related to trying to allocate too much memory.
    
*   `'internal'`
    
    Errors where you did nothing wrong but the driver complained. For example, this might happen if your shader is too complex.
    

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-push-pop-error-scope.html)

`popErrorScope` returns a promise with an error or null of there was no error. Above we use `await` to wait for the promise, but that stops our program. It’s probably more common to use `then` as in:

  device.pushErrorScope('validation');
  device.createShaderModule({
    code: /\* wgsl \*/ \`
      this shader won't compile
    \`,
  });
+  device.popErrorScope().then(error => {
+    if (error) {
+      log('captured error:', error.message);
+    }
+  });

This way our program doesn’t pause and wait the GPU to get back to us on whether or not there was an error.

## Different kinds of Errors

Some errors in WebGPU are checked when you call a function. Others are checked later. WebGPU specifies timelines. Two of them are the “content timeline” and the “device timeline”. The “content timeline” is same timeline as JavaScript itself. The device timeline is separate and generally run in a separate process. Yet other errors are checked by the rules of JavaScript itself.

*   Example of a JavaScript Error: Passing the wrong type
    
    device.queue.writeBuffer(someTexture, ...);
    
    The code above would immediately get an error because the first argument of `writeBuffer` must be a [`GPUBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer) which JavaScript itself enforces.
    
*   Example of a “content timeline” error
    
    device.createTexture({
      size: \[\],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE\_BINDING,
    });
    
    `size` as provided above, is an error, it must have at least 1 element.
    
*   Example of a device error
    
    The examples at the start of the page are device errors. Device errors are what `pushErrorScope`, `popErrorScope`, and uncaptured error events process.
    

Where errors happens is detailed in [the spec](https://www.w3.org/TR/webgpu/) but it’s important to know that JavaScript errors and content timeline errors happen immediately and throw an exception where as device timeline errors happen asynchronously.

## WGSL errors

If you get an error compiling a shader module you can ask for more detailed info by calling `getCompilationInfo`.

Example:

  device.pushErrorScope('validation');
  const code = \`
      // This function
      // calls a function
      // that does not
      // exist.

      fn foo() -> vec3f {
        return someFunction(1, 2);
      }
    \`;
  const module = device.createShaderModule({ code });
  device.popErrorScope().then(async error => {
    if (error) {
      const info = await module.getCompilationInfo();

      // Split the code into lines
      const lines = code.split('\\n');

      // Sort the messages by line numbers in reverse order
      // so that as we insert the messages they won't affect
      // the line numbers.
      const msgs = \[...info.messages\].sort((a, b) => b.lineNum - a.lineNum);

      // Insert the error messages between lines
      for (const msg of msgs) {
        lines.splice(msg.lineNum, 0,
          \`${''.padEnd(msg.linePos - 1)}${''.padEnd(msg.length, '^')}\`,
          msg.message,
        );
      }

      log(lines.join('\\n'));
    }
  });

The code above effectively interleaves any error messages into the full shader code.

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-get-compilation-info.html)

`getCompilationInfo` returns an object that contains an array of [`GPUCompilationMessage`](https://developer.mozilla.org/en-US/docs/Web/API/GPUCompilationMessage)s, each of which has the following fields

*   `message`: a string error message
*   `type`: `'error'` or `'warning'` or `'info'`
*   `lineNum`: the number of the error, 1 based
*   `linePos`: the position in the line of the error, 1 based
*   `offset`: the position in the string of the error, 0 based. (this is effectively the same info as linePos, lineNum)
*   `length`: the length to highlight

## WebGPU-Dev-Extension

The [WebGPU-Dev-Extension](https://github.com/greggman/webgpu-dev-extension) provides features to help debug.

Some things it can do

*   Show a stack trace where errors happened.
    
    As we showed above, errors in WebGPU happen asynchronously. In the first example we used the `uncapturederror` event to see that we got a WebGPU error but there was no info about where in JavaScript that error happened.
    
    The webgpu-dev-extension provides this info by trying to add calls to `pushErrorScope` and `popErrorScope` around all of the WebGPU functions that generate errors. Inside it creates an `Error` object which holds the a stack trace. If it gets an error it can then print that `Error` object and you’ll see the error stack of where the error was originally generated.
    
*   Show errors for command encoders
    
    In WebGPU, command encoders, like [`GPUCommandEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder), [`GPURenderPassEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder), [`GPUComputePassEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder), and [`GPURenderBundleEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/GPURenderBundleEncoder) do not generate device timeline errors. Instead, the errors are saved up until you call `encoder.finish`
    
    For example:
    
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass(renderPassDesc);
    pass.setPipeline(somePipeline);
    pass.setBindGroup(0, someBindGroupIncompatibleWithSomePipeline); // oops!
    pass.setVertexBuffer(0, positionBuffer);
    pass.setVertexBuffer(1, normalBuffer);
    pass.setIndexBuffer(indexBuffer, 'uint16');
    pass.drawIndexed(4);
    pass.end();
    const cb = encoder.finish();  // Error above is generated here
    
    The problem here is, at best you’ll get an error message that the bind group bound to group 0 is incompatible with the pipeline but you won’t know which line the error happened on. In a small example like this it should be pretty obvious but in a large app, it might be hard to track down which specific line caused the error.
    
    The webgpu-dev-extension can try to throw an error at the line that caused the error.
    
*   Show WGSL errors interleaved with the full shader source
    
    Like the example above, the webgpu-dev-extension has an option to show the errors interleaved with the source WGSL, rather than just a terse error message. (the default)
    

## WebGPU-Inspector

[The WebGPU-Inspector](https://github.com/brendan-duncan/webgpu_inspector) will attempt to capture all of your WebGPU commands and can let you inspect buffers, textures, calls, and generally try to see what’s happening in your WebGPU code.

![](https://github.com/brendan-duncan/webgpu_inspector/raw/main/docs/images/frame_capture_commands.png)

## Tips for debugging shaders

### Simplify:

Get your shader to a working state by cutting out as much as possible. Once it’s working, add stuff back in little by little

### Show a solid color

For render passes, the first thing I often do is show a solid color.

Here is last shader from [the article on spot lights](webgpu-lighitng-spot.html).

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  // Because vsOut.normal is an inter-stage variable 
  // it's interpolated so it will not be a unit vector.
  // Normalizing it will make it a unit vector again
  let normal = normalize(vsOut.normal);

  let surfaceToLightDirection = normalize(vsOut.surfaceToLight);
  let surfaceToViewDirection = normalize(vsOut.surfaceToView);
  let halfVector = normalize(
    surfaceToLightDirection + surfaceToViewDirection);

  let dotFromDirection = dot(surfaceToLightDirection, -uni.lightDirection);
  let inLight = smoothstep(uni.outerLimit, uni.innerLimit, dotFromDirection);

  // Compute the light by taking the dot product
  // of the normal with the direction to the light
  let light = inLight \* dot(normal, surfaceToLightDirection);

  var specular = dot(normal, halfVector);
  specular = inLight \* select(
      0.0,                           // value if condition false
      pow(specular, uni.shininess),  // value if condition is true
      specular > 0.0);               // condition

  // Lets multiply just the color portion (not the alpha)
  // by the light
  let color = uni.color.rgb \* light + specular;
  return vec4f(color, uni.color.a);
}

The example is supposed to render a green F with a small portion lit by a spotlight. Here’s a version with a bug. Let’s debug it.

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-spot-light-01.html)

We ran it and nothing appeared on the screen and there were no WebGPU errors. The first thing I might do is change it to return solid red

  let color = uni.color.rgb \* light + specular;
-  return vec4f(color, uni.color.a);
+  //return vec4f(color, uni.color.a);
+  return vec4f(1, 0, 0, 1);  // solid red

If I see a red F then I know I should start looking in the fragment shader since clearly enough of the vertex shader was correct to draw the triangles that make the F. If I don’t see a red F then I should start looking in the vertex shader.

Trying it:

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-spot-light-02.html)

We see a red F. Ok, lets try to visualize the normals. To do so, change the end of the fragment shader to:

  let color = uni.color.rgb \* light + specular;
  //return vec4f(color, uni.color.a);
-   return vec4f(1, 0, 0, 1);  // solid red
+   //return vec4f(1, 0, 0, 1);  // solid red
+   return vec4f(vsOut.normal \* 0.5 + 0.5, 1);  // normal

Normals go from -1.0 to +1.0 but colors go from 0.0 to 1.0 so by multiplying by 0.5 and adding 0.5 we convert the normals to something that can be visualized with colors.

Trying that:

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-spot-light-03.html)

Hmmm, that’s not right. That looks suspiciously like all the normals are 0,0,0. Clearly something is wrong the normals in the fragment shader. Those normals come from the vertex shader after being multiplied by `normalMatrix`. Let’s try passing the normals straight through, without multiplying by `normalMatrix`. If the F appears then we know the bug is in `normalMatrix`. If the F doesn’t appear then the bug in the data being supplied to the vertex shader.

  // Orient the normals and pass to the fragment shader
-  vsOut.normal = uni.normalMatrix \* vert.normal;
+  //vsOut.normal = uni.normalMatrix \* vert.normal;
+  vsOut.normal = vert.normal;

Running that:

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-spot-light-04.html)

That looks more like it. So apparently something is wrong with `normalMatrix`

Checking the code it was commented out which left the matrix all zeros. Someone must have checking something and forgot to uncomment it.😅

    // Inverse and transpose it into the worldInverseTranspose value
-    //mat3.fromMat4(mat4.transpose(mat4.inverse(world)), normalMatrixValue);
+    mat3.fromMat4(mat4.transpose(mat4.inverse(world)), normalMatrixValue);

Let’s un-comment it. Then let’s put the vertex shader back the way it was

  // Orient the normals and pass to the fragment shader
-  //vsOut.normal = uni.normalMatrix \* vert.normal;
-  vsOut.normal = vert.normal;
+  vsOut.normal = uni.normalMatrix \* vert.normal;

That gives us:

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-spot-light-05.html)

If you rotate the F you’ll see the colors change showing the normals are being re-oriented by `normalMatrix`. Compare that to the one above where the colors don’t change as we rotate.

With that we can finally restore the fragment shader.

  let color = uni.color.rgb \* light + specular;
-  //return vec4f(color, uni.color.a);
-  //return vec4f(1, 0, 0, 1);  // solid red
-  return vec4f(vsOut.normal \* 0.5 + 0.5, 1);  // normal
+  return vec4f(color, uni.color.a);

And it’s working as it’s supposed to.

[click here to open in a separate window](/webgpu/lessons/../webgpu-debugging-spot-light-06.html)

Finding ways to visualize your data is a good way to check it. For example, to check [texture coordinates](webpgu-textures.html) you might do something like

   return vec4f(fract(textureCoord), 0, 1);

Texture coordinates generally go from 0.0 to 1.0 but if you’re repeating the texture they might go higher so `fract` covers that.

To give an idea of what texture coordinates look like, here’s a few objects with their texture coordinates visualized.

texture coordinates visualized

Texture coordinates are generally smooth over some surface.

Here are the same texture coordinates visualized with a bug.

bad texture coordinates

They are no longer smooth so something is probably off.

Following the same procedures as above we’d conclude that the data coming into the vertex shader must be bad. And indeed, this example is uploading the vertex data as `float32x3` values but mistakenly specified them as `float16x2` in the render pipeline descriptor.

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU Debugging and Errors\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');