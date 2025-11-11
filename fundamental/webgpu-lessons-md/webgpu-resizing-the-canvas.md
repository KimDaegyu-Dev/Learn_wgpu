English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU Resizing the Canvas.

In [the article on webgpu fundamentals](webgpu-fundamentals.html) we setup a basic structure for setting the resolution of the canvas to match the size it’s displayed. Let’s go over some of the details of resizing a canvas.

Every canvas has 2 sizes. The size of its _drawing buffer_. This is how many pixels are in the canvas itself. The second size is the size the canvas is displayed. CSS determines the size the canvas is displayed.

You can set the size of the canvas’s drawing buffer in 2 ways. One using HTML

<canvas id="c" width="400" height="300"></canvas>

The other using JavaScript

<canvas id="c"></canvas>

JavaScript

const canvas = document.querySelector("#c");
canvas.width = 400;
canvas.height = 300;

As for setting a canvas’s display size, if you don’t have any CSS that affects the canvas’s display size the display size will be the same size as its drawing buffer. So, in the 2 examples above, the canvas’s drawingbuffer is 400x300 and its display size is also 400x300.

Here’s an example of a canvas whose drawing buffer is 10x15 pixels that is displayed 400x300 pixels on the page

<canvas id="c" width="10" height="15" style="width: 400px; height: 300px;"></canvas>

or for example like this

<style>
#c {
  width: 400px;
  height: 300px;
}
</style>
<canvas id="c" width="10" height="15"></canvas>

If we draw a single pixel wide rotating line into that canvas we’ll see something like this

[click here to open in a separate window](/webgpu/lessons/../webgpu-10x15-canvas-400x300-css.html)

Why is it so blurry? Because the browser takes our 10x15 pixel canvas and stretches it to 400x300 pixels and generally it _filters_ it when it stretches it.

So, what do we do if, for example, we want the canvas to fill the window? Well, first we can get the browser to stretch the canvas to fill the window with CSS. Example:

<html>
  <head>
    <style>
    html, body {
      margin: 0;       /\* remove the default margin          \*/
      height: 100%;    /\* make the html,body fill the page   \*/
    }
    #c {
      display: block;  /\* make the canvas act like a block   \*/
      width: 100%;     /\* make the canvas fill its container \*/
      height: 100%;
    }
    </style>
  </head>
  <body>
    <canvas id="c"></canvas>
  </body>
</html>

Now we just need to make the drawing buffer match whatever size the browser has stretched the canvas. This is unfortunately a more complicated topic than you might expect. Let’s go over some different methods

## Use [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)

We covered this in [the article on webgpu fundamentals](webgpu-fundamentals.html). This is the modern way and every browser that supports WebGPU also supports [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).

To repeat what we wrote in the other article: You create a [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) and give it a function to call whenever the elements you’ve asked it to observe change their size. You then tell it which elements to observe.

const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    const width = entry.contentBoxSize\[0\].inlineSize;
    const height = entry.contentBoxSize\[0\].blockSize;
    const canvas = entry.target;
    canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
    canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
  }
});
observer.observe(canvas);

In the code above we go over all the entries but there should only ever be one because we’re only observing one canvas. We need to limit the size of the canvas to the largest size our device supports otherwise WebGPU will start generating errors that we tried to make a texture that is too large. We also need to make sure it doesn’t go to zero or again we’ll get errors.

If we’re only rendering on demand then we might put a call to our render function inside the code above. Otherwise, if we’re animating by using a `requestAnimationFrame` loop (rAF loop), or other means, then the next time we render we’ll get a texture that matches the size we set on the canvas when we call `context.getCurrentTexture()`.

> Note that `inlineSize` and `blockSize` are not integers

## Use `clientWidth` and `clientHeight`

Before [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) existed it was common to use `clientWidth` and `clientHeight`. These are properties every element in HTML has that tell us the size of the element in CSS pixels.

> Note: The client rect includes any CSS padding so if you’re using `clientWidth` and/or `clientHeight` it’s best not to put any padding on your canvas element.

Using JavaScript we can check what size that element is being displayed and then adjust its drawing buffer size to match.

  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
  canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));

We’d use this code just before calling `context.getCurrentTexture()`.

This way seems out of date personally but you’ll likely see it here and there probably copy and pasted from old examples using other APIs.

## Use [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)

Another way to do this is to call [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).

  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const rect = canvas.getBoundingClientRect();
  const width = rect.width; 
  const height = rect.height; 
  canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
  canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));

The difference between `clientWidth`, `clientHeight` and [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) is that the width and height from [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) is not required to be an integer where as the values of `clientWidth` and `clientHeight` are.

Why would the width or height not be integers? [See below](#a-dpr).

## Use `window.innerWidth` and `window.innerHeight`

I see this often and it really seems like an **anti-pattern**. The reason is it’s inflexible. The 2 techniques above work in every situation whereas using `window.innerWidth` and `window.innerHeight` only work in one specific situation, when you want to fill the page. We’ve already shown the techniques above fill the page just fine but they also work in every other situation.

Having the canvas _not_ fill the page. Like a diagram in an article Or in an editor with a toolbar.

It’s not more work to use the first 2 techniques so it seems silly to use this less useful technique. Unfortunately the “copy and paste” force is strong 😂

## Handling [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) and Zoom

Why is that not the end of it? Well, This is where it gets complicated.

The first thing to understand is that most sizes in the browser are in CSS pixel units. This is an attempt to make the sizes device independent. So for example at the top of this article we set the canvas’s display size to 400x300 CSS pixels. Depending on if the user has an HD-DPI display, or is zoomed in or zoomed out, or has an OS zoom level set, how many actual pixels that becomes on the monitor will be different.

[`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) will tell us, in general, the ratio of actual pixels to CSS pixels on your monitor. For example here’s your browser’s current setting

> devicePixelRatio =

If you’re on a desktop or laptop try pressing ctrl++ and ctrl+\- to zoom in and out (⌘++ and ⌘+\- on Mac). You should see the number change in Firefox, Chrome, Edge (but not Safari)

So if we want the number of pixels in the canvas to match the number of pixels actually used to display it the seemingly obvious solution would be to multiply the values we looked up above like this

const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
-    const width = entry.contentBoxSize\[0\].inlineSize;
-    const height = entry.contentBoxSize\[0\].blockSize;
+    const width = entry.contentBoxSize\[0\].inlineSize \* devicePixelRatio;
+    const height = entry.contentBoxSize\[0\].blockSize \* devicePixelRatio;

Or this

\-  const width = canvas.clientWidth;
-  const height = canvas.clientHeight;
+ const width = canvas.clientWidth \* devicePixelRatio;
+ const height = canvas.clientHeight \* devicePixelRatio;

Or this

  const rect = canvas.getBoundingClientRect();
-  const width = rect.width; 
-  const height = rect.height; 
+  const width = rect.width \* devicePixelRatio; 
+  const height = rect.height \* devicePixelRatio; 

> **THE EXAMPLES ABOVE WILL NOT ACTUALLY GIVE THE CORRECT RESULT!!!**

That said, it’s close and might be good enough for your needs. If you don’t care you’re not getting a perfect 1 to 1 pixel rendering on the screen then you can use the solutions above.

There are 2 ways to see why the code above doesn’t provide the correct answer

1.  [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) is not an integer
    
    If you are on Firefox, Edge, or Chrome and press the zoom keys like mentioned above you can easily see fractional [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) values.
    
2.  The size of any element itself is not an integer
    
    Above we saw that both [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) and [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) return non-integer values for the size of an element.
    

To as a concrete example of where this issue comes up we can make a div with 3 children, each set be the 33% the width of their parent

<div id="parent">
  <div id="left">left</div>
  <div id="middle">middle</div>
  <div id="right">right</div>
</div>

#parent {
  display: flex;
  width: 299px;
  height: 40px;
  align-items: stretch;
  background-color: red;
}
#parent>\* {
  flex: 1 1 33%;
}
#left { background-color: #A44; }
#middle { background-color: #4A4; }
#right { background-color: #66C; }

[click here to open in a separate window](/webgpu/lessons/../fractional-element-size-issues.html)

On one of my machines, with a default (un-zoomed) browser window, I get these results

devicePixelRatio: 2
--------------- #left ---------------
                 inlineSize: 99.65625
                clientWidth: 100
getBoundingClientRect.width: 99.6640625
--------------- #middle ---------------
                 inlineSize: 99.65625
                clientWidth: 100
getBoundingClientRect.width: 99.6640625
--------------- #right ---------------
                 inlineSize: 99.65625
                clientWidth: 100
getBoundingClientRect.width: 99.6640625
--------------- #parent ---------------
                 inlineSize: 299
                clientWidth: 299
getBoundingClientRect.width: 299

The #1 thing to notice is **the numbers for all 3 children are exactly the same!!** But, our parent is 299 css pixels wide. If we multiply that by the devicePixelRatio of 2 we get 598 actual pixels. We have 3 children. `598 / 3 = 199.33333333333334` We can’t have 199.33333333334 actual pixels. If we round to 199 then 199 + 199 + 199 = 597. But our parent is 598. To get to 598, one of those elements needs an extra pixel but, given the info for all 3 is exactly the same, which one gets the extra pixel?

## `devicePixelContentBoxSize`

The solution is that [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) provides the answer. It’s called `devicePixelContentBoxSize`

const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
-    const width = entry.contentBoxSize\[0\].inlineSize;
-    const height = entry.contentBoxSize\[0\].blockSize;
+    const width = entry.devicePixelContentBoxSize\[0\].inlineSize;
+    const height = entry.devicePixelContentBoxSize\[0\].blockSize;

If we add that measurement to our example it gives us the actual answer

[click here to open in a separate window](/webgpu/lessons/../fractional-element-size-device-pixel-content-box-size.html)

On the machine I used for the results above I get these results

devicePixelRatio: 2
--------------- #left ---------------
                          inlineSize: 99.65625
devicePixelContentBoxSize.inlineSize: 199    <=====
                         clientWidth: 100
         getBoundingClientRect.width: 99.6640625
--------------- #middle ---------------
                          inlineSize: 99.65625
devicePixelContentBoxSize.inlineSize: 200    <=====
                         clientWidth: 100
         getBoundingClientRect.width: 99.6640625
--------------- #right ---------------
                          inlineSize: 99.65625
devicePixelContentBoxSize.inlineSize: 199    <=====
                         clientWidth: 100
         getBoundingClientRect.width: 99.6640625
--------------- #parent ---------------
                          inlineSize: 299
devicePixelContentBoxSize.inlineSize: 598    <=====
                         clientWidth: 299
         getBoundingClientRect.width: 299

As you can see, on my machine the browser gave the center element the extra pixel. It’s 200 device pixels wide vs the other 2 elements which are 199 device pixels wide.

This issue isn’t limited to this case, it’s just the easiest way to show a concrete example of not being able to get this info any other way. The point being, if you want pixel perfection, you can not just multiply some other measurement by [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). You must use [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) and `devicePixelContentBoxSize`.

Note: Safari, as of November 2023, does not support `devicePixelContentBoxSize` nor does Safari change the [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) in response to zooming. This means **It’s impossible on Safari to display a 1x1 pixel perfect canvas**.

## `content-box` vs `device-pixel-content-box`

When you call [`ResizeObserver.observe`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver.observe) you can tell it to observe the changes of 1 of 2 box sizes. The default is to observe the `content-box` size. This is the CSS size of the element. Above, the elements may never change CSS size. The parent is set to 299px CSS pixels and regardless of zoom level. The children are set to 33% which is 33% of 299 which is always 99.666666 (or whatever they compute, see results above). On the other hand, if the element is the full size of the page then it would change as you zoom. [\[1\]](#fn1)

You can also observe `device-pixel-content-box`. This is the size of the actual number of device pixels the element takes. This will change when the zoom level changes [\[1:1\]](#fn1). It won’t change if the size in device pixels of the element didn’t actually change. For example if the element is the full size of the page then zooming doesn’t change the fact that it’s still the full size of the page and therefore still the same number of device pixels.

To tell [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) which size to observe you pass it in when calling `observe`.

resizeObserver.observe(someElement1, {box: 'device-pixel-content-box'});
resizeObserver.observe(someElement2, {box: 'content-box'});

Unfortunately, again, Safari does not support this and will throw an exception if you try to pass `'device-pixel-content-box'`.

## Actual pixels - solution

As of November 2023 then, the solution to getting the actual number of pixels is to request both types of boxes above, trap the safari issue, and, if `devicePixelContentBoxSize` is not available, fallback to `contentBoxSize`.

Here’s is our boilerplate canvas resizing code updated to support pixel perfect rendering on all standards compliant browsers [\[1:2\]](#fn1)

  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const width = entry.devicePixelContentBoxSize?.\[0\].inlineSize ||
                    entry.contentBoxSize\[0\].inlineSize \* devicePixelRatio;
      const height = entry.devicePixelContentBoxSize?.\[0\].blockSize ||
                     entry.contentBoxSize\[0\].blockSize \* devicePixelRatio;
      const canvas = entry.target;
      canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
      canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
      // re-render
      render();
    }
  });
  try {
    observer.observe(canvas, { box: 'device-pixel-content-box' });
  } catch {
    observer.observe(canvas, { box: 'content-box' });
  }

We can test this by drawing a pattern that will show a [moiré effect](https://www.google.com/search?q=moire+effect) if the rendering is not pixel perfect. We drew a pattern like this in [the article on inter-stage variables](webgpu-inter-stage-variables.html#a-builtin-position).

Replacing the canvas resizing code with the snippet above and changing the pattern to a magenta, green, white, black checkerboard.

  @fragment fn fs(fsInput: OurVertexShaderOutput) -> @location(0) vec4f {
-    let red = vec4f(1, 0, 0, 1);
-    let cyan = vec4f(0, 1, 1, 1);
-    return select(red, cyan, checker);

+    let hv = vec2f(floor(fsInput.position.xy % 2));
+    return vec4f(1, 0, 1, 1) \* hv.x +
+           vec4f(0, 1, 0, 1) \* hv.y;
  }

Let’s also make the triangle big enough to cover the canvas [\[2\]](#fn2)

    let pos = array(
-      vec2f( 0.0,  0.5),  // top center
-      vec2f(-0.5, -0.5),  // bottom left
-      vec2f( 0.5, -0.5)   // bottom right
+      vec2f(-1.0,  3.0),
+      vec2f( 3.0, -1.0),
+      vec2f(-1.0, -1.0),
    );

[click here to open in a separate window](/webgpu/lessons/../webgpu-resize-pixel-perfect.html)

Open it in new window and zoom in or out. You should see a monotone pattern that looks almost like a solid color that doesn’t change regardless of zoom level except on Safari where if you zoom you may see [moiré patterns](https://www.google.com/search?q=moire+pattern) showing that it was impossible to get pixel perfection on Safari.

> Note: If you’d like to add your polite voice for Safari to support `devicePixelContentBox` you can add to the bug report [here](https://bugs.webkit.org/show_bug.cgi?id=264158) as well as the bug about Safari not changing [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) in response to zoom [here](https://bugs.webkit.org/show_bug.cgi?id=124862). Bugs are often worked on by how much attention they get so please add your voice to the bugs.

## Do you need to use [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)?

Drawing to higher resolutions is slower than drawing to lower resolutions. It’s not always important to use [`devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). Even if you do decide to support it, [many phones have device pixel ratios as high as 4](https://yesviz.com/viewport/). That’s a total of 16 pixels for every CSS pixel. Drawing 16x the pixels is literally up to 16x slower than drawing 1. So maybe you’d like to consider limiting how you use devicePixelRatio like `dpr = Math.min(2, devicePixelRatio)`.

Further, given that games often have a poor experience if they are slow, you might consider letting the user choose a multiplier which is what many native computer games do in their graphics options settings. Then the user can choose if they want resolution or speed.

* * *

1.  Except on Safari 🤬 [↩︎](#fnref1) [↩︎](#fnref1:1) [↩︎](#fnref1:2)
    
2.  See [this article](webgpu-large-triangle-to-cover-clip-space.html) for why these vertex positions. [↩︎](#fnref2)
    

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU Resizing the Canvas.\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');