English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU Compatibility Mode

WebGPU Compatibility mode is a version of WebGPU that, with some limits, can run on older devices. The idea is, if you can make your app run within some extra limits and restrictions then you can request a webgpu compatibility adapter and have your app run in more places.

> Note: Compatibility mode has not officially shipped. It may be available in your browser as an experiment. In, [Chrome Canary](https://www.google.com/chrome/canary/), as of version 136.0.7063.0 (2025-03-11), you can allow compatibility mode by enabling the flag “enable-unsafe-webgpu” by going to `chrome://flags/#enable-unsafe-webgpu`.

To give some idea what what you can do in compatibility mode, effectively _nearly_ all WebGL2 programs could be converted to run on compatibility mode.

Here’s how you do it.

const adapter = await navigator.gpu.requestAdapter({
  featureLevel: 'compatibility',
});
const device = await adapter.requestDevice();

Simple! Note that every app that follows all the limits of compatibility mode is a valid “core” webgpu app and will run anywhere WebGPU is already running.

# Major limits and restrictions

## Possibly 0 storage buffers in vertex shaders.

The major restriction that is most likely to affect WebGPU apps is that ~45% of these old devices do not support storage buffers in vertex shaders.

We used this feature in [the article on storage buffers](webgpu-storage-buffers.html) which is the 3nd article on this site. After that article we [switched to using vertex buffers](webgpu-vertex-buffers.html). Using vertex buffers is common and works everywhere but certain solutions are easier with storage buffers. One example is [this example of drawing wireframes](https://webgpu.github.io/webgpu-samples/?sample=wireframe). It uses storage buffers to generate triangles from vertex data.

With vertex data stored in storage buffers we can randomly access the vertex data. With the vertex data in vertex buffer we can not. Of course there are always other solutions.

## Medium limits and restrictions

## Only a single viewDimension is allowed for a texture.

In normal WebGPU you can make a 2d texture like this

const myTexture = device.createTexture({
  size: \[width, height, 6\],
  usage: ...
  format: ...
});

You can then view it 3 different view dimensions

// a view of myTexture as a 2d array with 6 layers
const as2DArray = myTexture.createView();

// view layer 3 of myTexture as a 2d texture
const as2D = myTexture.createView({
  viewDimension: '2d',
  baseArrayLayer: 3,
  arrayLayerCount: 1,
});

// view of myTexture as a cubemap
const asCube = myTexture.createView({
  viewDimension: 'cube',
});

In compatibility mode you can only use one view dimension and you have to choose which viewDimension when you create the texture. A 2D texture with 1 layer defaults to only being usable as a `'2d'` view. A 2D texture with more than 1 layer defaults to only being usable as a `'2d-array`’ view. If you want something other than the default you must tell WebGPU. For example, If you want a cube map then you must tell WebGPU when you create the texture.

const cubeTexture = device.createTexture({
  size: \[width, height, 6\],
  usage: ...
  format: ...
  textureBindingViewDimension: 'cube', 
});

Note, this extra parameter is called `textureBindingViewDimension` because it relates to using the texture with usage `TEXTURE_BINDING`. You can still use a single layer of a cubemap or 2d-array as a 2d texture as a `RENDER_ATTACHMENT`.

In compatibility mode, using the texture with another type of view will generate a validation error

// a view of cubeTexture as a 2d array with 6 layers
const bindGroup = device.createBindGroup({
  ...
  entries: \[
    {
      binding,
      // ERROR in compatibility mode: texture is a cubemap not a 2d-array
      resource: cubeTexture.createView(),
    },
  \],
})

// view layer 3 of cubeTexture as a 2d texture
const bindGroup = device.createBindGroup({
  ...
  entries: \[
    {
      binding,
      // ERROR in compatibility mode: texture is a cubemap not 2d
      resource: cubeTexture.createView({
        viewDimension: '2d',
        baseArrayLayer: 3,
        arrayLayerCount: 1,
      }),
    },
  \]
});

// view of cubeTexture as a cubemap
const bindGroup = device.createBindGroup({
  ...
  entries: \[
    {
      binding,
      // GOOD!
      resource: cubeTexture.createView({
        viewDimension: 'cube',
      }),
    },
  \],
});

This restriction is not that big of a deal. Few programs want to use a texture with different kinds of views.

## When calling `texture.createView` you can not select a subset of layers in a bindGroup

In core WebGPU we can create a texture with some layers

const texture = device.createTexture({
  size: \[64, 128, 8\],   // 8 layers,
  ...
});

We can then select a subset of layers

const bindGroup = device.createBindGroup({
  ...
  entries: \[
    {
      binding,
      // ERROR  in compatibility mode - select layers 3 and 4
      resource: cubeTexture.createView({
        baseArrayLayer: 3,
        arrayLayerCount: 2,
      }),
    },
  \],
});

This restriction is also not that big of a deal. Few programs want to select a subset of layers from a texture.

## Generating Mipmaps in compatibility mode.

There is one place though both of these restrictions comes up and that is when generating mipmaps, which is a common use-case.

Recall that we made a gpu based mipmap generator in [the article in importing images into textures](webgpu-importing-textures.html#a-generating-mips-on-the-gpu). We modified that function to generate mipmaps for 2d-array and cubemaps in [the article on cube maps](webgpu-cube-maps.html#a-texture-helpers). In that version we always view each layer of the texture with a `'2d'` dimension to reference just one layer of the texture. This won’t work in compatibility mode for the reasons above. We can’t use a `'2d'` view of `'2d-array'` or `'cube'` texture. We also can not select individual layers in a bind group to select which layer to read from.

To make the code work in compatibility mode we have to work with textures with the same view dimension they were created with and we need to pass in the texture with access to all layers and select the layer we want in the shader itself, rather than selecting the layer via `createView` as we were doing.

So let’s do that! We’ll start with the code for `generateMips` from [the article on cubemaps](webgpu-cube-maps.html#a-texture-helpers).

  const generateMips = (() => {
    let sampler;
    let module;
    const pipelineByFormat = {};

    return function generateMips(device, texture) {
      if (!module) {
        module = device.createShaderModule({
          label: 'textured quad shaders for mip level generation',
          code: /\* wgsl \*/ \`
            struct VSOutput {
              @builtin(position) position: vec4f,
              @location(0) texcoord: vec2f,
            };

            @vertex fn vs(
              @builtin(vertex\_index) vertexIndex : u32
            ) -> VSOutput {
              let pos = array(

                vec2f( 0.0,  0.0),  // center
                vec2f( 1.0,  0.0),  // right, center
                vec2f( 0.0,  1.0),  // center, top

                // 2st triangle
                vec2f( 0.0,  1.0),  // center, top
                vec2f( 1.0,  0.0),  // right, center
                vec2f( 1.0,  1.0),  // right, top
              );

              var vsOutput: VSOutput;
              let xy = pos\[vertexIndex\];
              vsOutput.position = vec4f(xy \* 2.0 - 1.0, 0.0, 1.0);
              vsOutput.texcoord = vec2f(xy.x, 1.0 - xy.y);
              return vsOutput;
            }

            @group(0) @binding(0) var ourSampler: sampler;
            @group(0) @binding(1) var ourTexture: texture\_2d<f32>;

            @fragment fn fs(fsInput: VSOutput) -> @location(0) vec4f {
              return textureSample(ourTexture, ourSampler, fsInput.texcoord);
            }
          \`,
        });

        sampler = device.createSampler({
          minFilter: 'linear',
          magFilter: 'linear',
        });
      }

      if (!pipelineByFormat\[texture.format\]) {
        pipelineByFormat\[texture.format\] = device.createRenderPipeline({
          label: 'mip level generator pipeline',
          layout: 'auto',
          vertex: {
            module,
          },
          fragment: {
            module,
            targets: \[{ format: texture.format }\],
          },
        });
      }
      const pipeline = pipelineByFormat\[texture.format\];

      const encoder = device.createCommandEncoder({
        label: 'mip gen encoder',
      });

      for (let baseMipLevel = 1; baseMipLevel < texture.mipLevelCount; ++baseMipLevel) {
        for (let layer = 0; layer < texture.depthOrArrayLayers; ++layer) {
          const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: \[
              { binding: 0, resource: sampler },
              {
                binding: 1,
                resource: texture.createView({
                  dimension: '2d',
                  baseMipLevel: baseMipLevel - 1,
                  mipLevelCount: 1,
                  baseArrayLayer: layer,
                  arrayLayerCount: 1,
                }),
              },
            \],
          });

          const renderPassDescriptor = {
            label: 'our basic canvas renderPass',
            colorAttachments: \[
              {
                view: texture.createView({
                  dimension: '2d',
                  baseMipLevel: baseMipLevel,
                  mipLevelCount: 1,
                  baseArrayLayer: layer,
                  arrayLayerCount: 1,
                }),
                loadOp: 'clear',
                storeOp: 'store',
              },
            \],
          };

          const pass = encoder.beginRenderPass(renderPassDescriptor);
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
          pass.draw(6);  // call our vertex shader 6 times
          pass.end();
        }
      }

      const commandBuffer = encoder.finish();
      device.queue.submit(\[commandBuffer\]);
    };
  })();

We need to change the WGSL so for each type of texture (2d, 2d-array, cube, etc…) we use a different fragment shader and we need to be able to pass in a layer to read from.

+const faceMat = array(
+  mat3x3f( 0,  0,  -2,  0, -2,   0,  1,  1,   1),   // pos-x
+  mat3x3f( 0,  0,   2,  0, -2,   0, -1,  1,  -1),   // neg-x
+  mat3x3f( 2,  0,   0,  0,  0,   2, -1,  1,  -1),   // pos-y
+  mat3x3f( 2,  0,   0,  0,  0,  -2, -1, -1,   1),   // neg-y
+  mat3x3f( 2,  0,   0,  0, -2,   0, -1,  1,   1),   // pos-z
+  mat3x3f(-2,  0,   0,  0, -2,   0,  1,  1,  -1));  // neg-z

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) texcoord: vec2f,
+  @location(1) @interpolate(flat, either) baseArrayLayer: u32,
};

@vertex fn vs(
  @builtin(vertex\_index) vertexIndex : u32,
+  @builtin(instance\_index) baseArrayLayer: u32,
) -> VSOutput {
  var pos = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(-1.0,  3.0),
    vec2f( 3.0, -1.0),
  );

  var vsOutput: VSOutput;
  let xy = pos\[vertexIndex\];
  vsOutput.position = vec4f(xy, 0.0, 1.0);
  vsOutput.texcoord = xy \* vec2f(0.5, -0.5) + vec2f(0.5);
+  vsOutput.baseArrayLayer = baseArrayLayer;
  return vsOutput;
}

@group(0) @binding(0) var ourSampler: sampler;
-@group(0) @binding(1) var ourTexture: texture\_2d<f32>;

+@group(0) @binding(1) var ourTexture2d: texture\_2d<f32>;
@fragment fn fs2d(fsInput: VSOutput) -> @location(0) vec4f {
-  return textureSample(ourTexture, ourSampler, fsInput.texcoord);
+  return textureSample(ourTexture2d, ourSampler, fsInput.texcoord);
}

+@group(0) @binding(1) var ourTexture2dArray: texture\_2d\_array<f32>;
+@fragment fn fs2darray(fsInput: VSOutput) -> @location(0) vec4f {
+  return textureSample(
+    ourTexture2dArray,
+    ourSampler,
+    fsInput.texcoord,
+    fsInput.baseArrayLayer);
+}
+
+@group(0) @binding(1) var ourTextureCube: texture\_cube<f32>;
+@fragment fn fscube(fsInput: VSOutput) -> @location(0) vec4f {
+  return textureSample(
+    ourTextureCube,
+    ourSampler,
+    faceMat\[fsInput.baseArrayLayer\] \* vec3f(fract(fsInput.texcoord), 1));
+}
+
+@group(0) @binding(1) var ourTextureCubeArray: texture\_cube\_array<f32>;
+@fragment fn fscubearray(fsInput: VSOutput) -> @location(0) vec4f {
+  return textureSample(
+    ourTextureCubeArray,
+    ourSampler,
+    faceMat\[fsInput.baseArrayLayer\] \* vec3f(fract(fsInput.texcoord), 1), fsInput.baseArrayLayer);
+}

This code has 4 fragment shaders, one for each of `'2d'`, `'2d-array'`, `'cube'`, and `'cube-array'`. It uses the [large triangle to cover clip space](webgpu-large-triangle-to-cover-clip-space.html) technique [covered elsewhere](webgpu-large-triangle-to-cover-clip-space.html) to draw. It also uses `@builtin(instance_index)` to select the layer. This is an interesting and quick way to pass in a single integer value to a shader without having to use a uniform buffer. When we call `draw`, the 4th parameter is the first instance which will be passed to the shader as `@builtin(instance_index)`. We pass that from the vertex shader to fragment shader via `VSOutput.baseArrayLayer` which we can reference has `fsInput.baseArrayLayer` in the fragment shader.

The cubemap code converts a 2d-array layer and normalized UV coordinate into a cubemap 3d coordinate. We need this because again, in compatibility mode, a cubemap can only be viewed as a cubemap.

Back to our JavaScript, We need to let the user pass in the viewDimension they used when they created the texture so that we can select one of these shaders. If they don’t pass it in we’ll guess from the defaults.

\+  /\*\*
+  \* Get the default viewDimension
+  \* Note: It's only a guess. The user needs to tell us to be
+  \* correct in all cases because we can't distinguish between
+  \* a 2d texture and a 2d-array texture with 1 layer, nor can
+  \* we distinguish between a 2d-array texture with 6 layers and
+  \* a cubemap.
+  \*/
+  function getDefaultViewDimensionForTexture(dimension, depthOrArrayLayers) {
+   switch (dimension) {
+      case '1d':
+        return '1d';
+      default:
+      case '2d':
+        return depthOrArrayLayers > 1 ? '2d-array' : '2d';
+      case '3d':
+        return '3d';
+    }
+  }

  const generateMips = (() => {
    let sampler;
    let module;
    const pipelineByFormat = {};

-    return function generateMips(device, texture) {
+    return function generateMips(device, texture, textureBindingViewDimension) {
+      // If the user doesn't pass in a textureBindingViewDimension then guess
+      textureBindingViewDimension = textureBindingViewDimension ??
+        getDefaultViewDimensionForTexture(texture.dimension, texture.depthOrArrayLayers);
      if (!module) {
        module = device.createShaderModule({
          label: 'textured quad shaders for mip level generation',
          code: /\* wgsl \*/ \`
            const faceMat = array(
              mat3x3f( 0,  0,  -2,  0, -2,   0,  1,  1,   1),   // pos-x
              mat3x3f( 0,  0,   2,  0, -2,   0, -1,  1,  -1),   // neg-x
              mat3x3f( 2,  0,   0,  0,  0,   2, -1,  1,  -1),   // pos-y
              mat3x3f( 2,  0,   0,  0,  0,  -2, -1, -1,   1),   // neg-y
              mat3x3f( 2,  0,   0,  0, -2,   0, -1,  1,   1),   // pos-z
              mat3x3f(-2,  0,   0,  0, -2,   0,  1,  1,  -1));  // neg-z

            struct VSOutput {
              @builtin(position) position: vec4f,
              @location(0) texcoord: vec2f,
              @location(1) @interpolate(flat, either) baseArrayLayer: u32,
            };

            @vertex fn vs(
              @builtin(vertex\_index) vertexIndex : u32,
              @builtin(instance\_index) baseArrayLayer: u32,
            ) -> VSOutput {
              var pos = array<vec2f, 3>(
                vec2f(-1.0, -1.0),
                vec2f(-1.0,  3.0),
                vec2f( 3.0, -1.0),
              );

              var vsOutput: VSOutput;
              let xy = pos\[vertexIndex\];
              vsOutput.position = vec4f(xy, 0.0, 1.0);
              vsOutput.texcoord = xy \* vec2f(0.5, -0.5) + vec2f(0.5);
              vsOutput.baseArrayLayer = baseArrayLayer;
              return vsOutput;
            }

            @group(0) @binding(0) var ourSampler: sampler;

            @group(0) @binding(1) var ourTexture2d: texture\_2d<f32>;
            @fragment fn fs2d(fsInput: VSOutput) -> @location(0) vec4f {
              return textureSample(ourTexture2d, ourSampler, fsInput.texcoord);
            }

            @group(0) @binding(1) var ourTexture2dArray: texture\_2d\_array<f32>;
            @fragment fn fs2darray(fsInput: VSOutput) -> @location(0) vec4f {
              return textureSample(
                ourTexture2dArray,
                ourSampler,
                fsInput.texcoord,
                fsInput.baseArrayLayer);
            }

            @group(0) @binding(1) var ourTextureCube: texture\_cube<f32>;
            @fragment fn fscube(fsInput: VSOutput) -> @location(0) vec4f {
              return textureSample(
                ourTextureCube,
                ourSampler,
                faceMat\[fsInput.baseArrayLayer\] \* vec3f(fract(fsInput.texcoord), 1));
            }

            @group(0) @binding(1) var ourTextureCubeArray: texture\_cube\_array<f32>;
            @fragment fn fscubearray(fsInput: VSOutput) -> @location(0) vec4f {
              return textureSample(
                ourTextureCubeArray,
                ourSampler,
                faceMat\[fsInput.baseArrayLayer\] \* vec3f(fract(fsInput.texcoord), 1), fsInput.baseArrayLayer);
            }
          \`,
        });

        sampler = device.createSampler({
          minFilter: 'linear',
          magFilter: 'linear',
        });
      }

    ...

Before we tracked a pipeline per format so we could reuse the pipeline for textures of the same format. We need to update that to be a pipeline per format per viewDimension.

  const generateMips = (() => {
    let sampler;
    let module;
-    const pipelineByFormat = {};
+    const pipelineByFormatAndView = {};

    return function generateMips(device, texture, textureBindingViewDimension) {
      // If the user doesn't pass in a textureBindingViewDimension then guess
      textureBindingViewDimension = textureBindingViewDimension ??
        getDefaultViewDimensionForTexture(texture);
      let module = moduleByViewDimension\[textureBindingViewDimension\];
      if (!module) {
        ...
      }

+      const id = \`${texture.format}.${textureBindingViewDimension}\`;

-      if (!pipelineByFormat\[texture.format\]) {
-        pipelineByFormat\[texture.format\] = device.createRenderPipeline({
-          label: 'mip level generator pipeline',
+      if (!pipelineByFormatAndView\[id\]) {
+        // chose an fragment shader based on the viewDimension (removes the '-' from 2d-array and cube-array)
+        const entryPoint = \`fs${textureBindingViewDimension.replace(/\[\\W\]/, '')}\`;
+        pipelineByFormatAndView\[id\] = device.createRenderPipeline({
+          label: \`mip level generator pipeline for ${textureBindingViewDimension}, format: ${texture.format}\`,
          layout: 'auto',
          vertex: {
            module,
          },
          fragment: {
            module,
            entryPoint,
            targets: \[{ format: texture.format }\],
          },
        });
      }
-      const pipeline = pipelineByFormat\[texture.format\];
+      const pipeline = pipelineByFormatAndView\[id\];

      ...
}

Then our loop to generate the mipmap needs to change to use the full layers, since compatibility mode does not allow a sub-range of layers. We also need to use our ability to pass in the instance index via draw to select the layer we want to read from.

  const generateMips = (() => {

      ...

      const pipeline = pipelineByFormatAndView\[id\];

      for (let baseMipLevel = 1; baseMipLevel < texture.mipLevelCount; ++baseMipLevel) {
        for (let layer = 0; layer < texture.depthOrArrayLayers; ++layer) {
          const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: \[
              { binding: 0, resource: sampler },
              {
                binding: 1,
                resource: texture.createView({
-                  dimension: '2d',
+                  dimension: textureBindingViewDimension,
                  baseMipLevel: baseMipLevel - 1,
                  mipLevelCount: 1,
-                  baseArrayLayer: layer,
-                  arrayLayerCount: 1,
                }),
              },
            \],
          });

          const renderPassDescriptor = {
            label: 'our basic canvas renderPass',
            colorAttachments: \[
              {
                view: texture.createView({
                  dimension: '2d',
                  baseMipLevel,
                  mipLevelCount: 1,
                  baseArrayLayer: layer,
                  arrayLayerCount: 1,
                }),
                loadOp: 'clear',
                storeOp: 'store',
              },
            \],
          };

          const pass = encoder.beginRenderPass(renderPassDescriptor);
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
-          pass.draw(6);
+          // draw 3 vertices, 1 instance, first instance (instance\_index) = layer
+          pass.draw(3, 1, 0, layer);
          pass.end();
        }
      }

      const commandBuffer = encoder.finish();
      device.queue.submit(\[commandBuffer\]);
    };
  })();

With that our mipmap generation code works in compatibility mode, and it still works in core WebGPU.

We have a few other things we need to update to make the example work though.

We have a function `createTextureFromSources` that we pass sources to and it creates a texture. It was always creating a `'2d'` texture since in core we can view a `'2d'` texture with 6 layers as a cubemap. Instead, we need to make it so we can pass in a viewDimension and/or a dimension so that when we create the texture we can tell compatibility mode how we will view it.

\+  function textureViewDimensionToDimension(viewDimension) {
+   switch (viewDimension) {
+      case '1d': return '1d';
+      case '3d': return '3d';
+      default: return '2d';
+    }
+  }

  function createTextureFromSources(device, sources, options = {}) {
+    const viewDimension = options.viewDimension ??
+      getDefaultViewDimensionForTexture(options.dimension, sources.length);
+    const dimension = options.dimension ?? textureViewDimensionToDimension(viewDimension);
    // Assume are sources all the same size so just use the first one for width and height
    const source = sources\[0\];
    const texture = device.createTexture({
      format: 'rgba8unorm',
      mipLevelCount: options.mips ? numMipLevels(source.width, source.height) : 1,
      size: \[source.width, source.height, sources.length\],
      usage: GPUTextureUsage.TEXTURE\_BINDING |
             GPUTextureUsage.COPY\_DST |
             GPUTextureUsage.RENDER\_ATTACHMENT,
+      dimension,
+      textureBindingViewDimension: viewDimension,
    });
    copySourcesToTexture(device, texture, sources, options);
    return texture;
  }

We also need to update `copySourcesToTexture` to get the `viewDimension` and pass it to `generateMips`.

  function copySourcesToTexture(device, texture, sources, {flipY, viewDimension} = {}) {
    sources.forEach((source, layer) => {
      device.queue.copyExternalImageToTexture(
        { source, flipY, },
        { texture, origin: \[0, 0, layer\] },
        { width: source.width, height: source.height },
      );
    });
    if (texture.mipLevelCount > 1) {
+      viewDimension = viewDimension ??
+        getDefaultViewDimensionForTexture(texture.dimension, sources.length);
+      generateMips(device, texture, viewDimension);
-      generateMips(device, texture);
    }
  }

And, we need to update our call to `createTextureFromSources` to tell it in advance that we want a cubemap.

  const texture = await createTextureFromSources(
-      device, faceCanvases, {mips: true, flipY: false});
+      device, faceCanvases, {mips: true, flipY: false, viewDimension: 'cube'});

To make the example run in compatibility mode we need to request it like we covered at the top of this article.

async function main() {
-  const adapter = await navigator.gpu?.requestAdapter()
+  const adapter = await navigator.gpu?.requestAdapter({
+    featureLevel: 'compatibility',
+  });
  const device = await adapter?.requestDevice();

  ...

And with that, our cube map sample works in compatibility mode.

[click here to open in a separate window](/webgpu/lessons/../webgpu-compatibility-mode-generatemips.html)

You now have a compatibility mode friendly `generateMips` which you could use in any of the examples on this site. It works on both core and compatibility mode. In compatibility mode you must pass in a `viewDimension` if you want a cube map or if you want a 1 layer 2d-array. In core WebGPU you can pass one in or not. It doesn’t matter.

# Minor limits and restrictions

The following are limits and restrictions _most_ programs are unlikely to run into

*   ## Color blending must match on all color targets.
    
    In core, when you create a render pipeline, each color target can specify blending settings. We used blending settings in [the article on blending and transparency](webgpu-transparency.html). In compatibility mode, all the settings across all color targets in a single pipeline must be the same.
    
*   ## `copyTextureToBuffer` and `copyTextureToTexture` do not work with compressed textures
    
*   ## `copyTextureToTexture` does not work with multisampled textures
    
*   ## `cube-array` is not supported
    
*   ## views of a textures may not differ in aspect or mip levels in a single draw/dispatch call.
    
    In core WebGPU you can make multiple texture views of a texture to different mip levels AND use them in the same draw call. This is uncommon. Note that this restriction is on `TEXTURE_BINDING` usage, using a texture via a bindGroup. You can still use a different view as a `RENDER_ATTACHMENT` as we did in the mipmap generation code above.
    
*   ## `@builtin(sample_mask)` and `@builtin(sample_index)` are not supported
    
*   ## `rg32uint`, `rg32sint` and `rg32float` texture formats can not be used as storage textures.
    
*   ## `depthClampBias` must be 0
    
    This is a setting when creating a render pipeline.
    
*   ## `@interpolation(linear)` and `@interpolation(..., sample)` are not supported
    
    These were briefly mentioned in [the article on inter-stage variables](webgpu-inter-stage-variables.html#a-interpolate).
    
*   ## `@interpolate(flat)` and `@interpolate(flat, first)` are not supported
    
    In compatibility mode you must use `@interpolate(flat, either)` when you want flat interpolation. `either` means the value passed to the fragment shader could be the value from either the first or last vertex of the triangle or line being drawn. It’s up to the implementation.
    
    It is common for this not to matter. The most common use cases for passing something with flat interpolation from the vertex shader to the fragment shader are usually per model, per material, or per instance types of values. For example the mipmap generation code above used flat interpolation above to pass the `instance_index` to the fragment shader. It will be the same for all vertices of a triangle and so works just fine with `@interpolate(flat, either)`
    
*   ## Texture formats can not be reinterpreted
    
    In core WebGPU you can create an `'rgba8unorm'` texture and view it as an `'rgba8unorm-srgb'` texture and visa-versa as well as other `'-srgb'` formats and their corresponding non `'-srgb'` formats. Compatibility mode does not allow this. Whatever format you create the texture is the only format it can be used as.
    
*   ## `bgra8unorm-srgb` is not supported.
    
*   ## `rgba16float` and `r32float` textures can not be multisampled.
    
*   ## All integer texture formats can not be multisampled.
    
*   ## `depthOrArrayLayers` must be compatible with `textureBindingViewDimension`
    
    This means a texture marked with `textureBindingViewDimension: '2d'` must have a `depthOrArrayLayers: 1` (the default). A texture marked with `textureBindingViewDimension: 'cube'` must have `depthOrArrayLayers: 6`.
    
*   ## `textureLoad` does not work with depth textures.
    
    A “depth texture” is a texture referenced in WGSL with `texture_depth`, `texture_depth_2d_array`, or `texture_depth_cube`. Those can not be used with `textureLoad` in compatibility mode.ß
    
    On the other hand, `textureLoad` can be used with `texture_2d<f32>`, `texture_2d_array<f32>` and `texture_cube<f32>` and a texture that has a depth format can be bound to these bindings…
    
*   ## depth textures can not be used with non-comparison samplers.
    
    Again, a “depth texture” is a texture referenced in WGSL with `texture_depth`, `texture_depth_2d_array`, or `texture_depth_cube`. Those can not be used with a non-comparison sampler in compatibility mode.
    
    This effectively means `texture_depth`, `texture_depth_2d_array`, and `texture_depth_cube` can only be used with `textureSampleCompare`, `textureSampleCompareLevel` and `textureGatherCompare` in compatibility mode.
    
    On the other hand, you can bind a texture that uses a depth format to a `texture_2d<f32>`, `texture_2d_array<f32>` and `texture_cube<f32>` binding, subject to the normal restriction that it must use a non-filtering sampler.
    
*   ## The combinations of texture + sampler are more limited
    
    In core you can bind 16+ textures and 16+ samplers and then in your shader you can use all 256+ combinations.
    
    In compatibility mode you can only use 16 total combinations in a single stage.
    
    The actual rule is a little more complicated. Here it is spelled out in pseudo code.
    
    maxCombinationsPerStage =
       min(device.limits.maxSampledTexturesPerShaderStage, device.limits.maxSamplersPerShaderStage)
    for each stage of the pipeline:
      sum = 0
      for each texture binding in the pipeline layout which is visible to that stage:
        sum += max(1, number of texture sampler combos for that texture binding)
      for each external texture binding in the pipeline layout which is visible to that stage:
        sum += 1 // for LUT texture + LUT sampler
        sum += 3 \* max(1, number of external\_texture sampler combos) // for Y+U+V
      if sum > maxCombinationsPerStage
        generate a validation error.
    
*   ## Some of the default limits are lower in compatibility mode
    
    limit
    
    compat
    
    core
    
    `maxColorAttachments`
    
    4
    
    8
    
    `maxComputeInvocationsPerWorkgroup`
    
    128
    
    256
    
    `maxComputeWorkgroupSizeX`
    
    128
    
    256
    
    `maxComputeWorkgroupSizeY`
    
    128
    
    256
    
    `maxInterStageShaderVariables`
    
    15
    
    16
    
    `maxTextureDimension1D`
    
    4096
    
    8192
    
    `maxTextureDimension2D`
    
    4096
    
    8192
    
    `maxUniformBufferBindingSize`
    
    16384
    
    65536
    
    `maxVertexAttributes`
    
    16a
    
    16
    
    (a) In compatibility mode, using `@builtin(vertex_index)` and/or `@builtin(instance_index)` each count as an attribute.
    
    Of course the adapter may support higher limits for any of these.
    
*   ## There are 4 new limits.
    
    *   `maxStorageBuffersInVertexStage` (default 0)
    *   `maxStorageTexturesInVertexStage` (default 0)
    *   `maxStorageBuffersInFragmentStage` (default 4)
    *   `maxStorageTexturesInFragmentStage` (default 4)
    
    Like other limits, you can check when you request an adapter what the adapter supports and require higher than the defaults if you need more.
    
    As mentioned above, about 45% of devices support `0` storage buffers and storage textures in vertex shaders.
    

# Upgrading from compatibility mode to core

Compatibility mode was designed for you to opt-in. If you can design your application to live with the restrictions above then you ask for compatibility mode. If not, ask for core, the default, if the device can’t handle core it will not return an adapter.

On the the other hand, you can also to design your app to function in compatibility mode but take advantage of all the core features if the user has a device that supports core WebGPU.

To do this, ask for a compatibility mode adapter, then check for and enable the `core-features-and-limits` feature. If it exists on the adapter AND you require it on the device the device will be a core device and none of the restrictions above will apply.

Example:

const adapter = await navigator.gpu.requestAdapter({
  featureLevel: 'compatibility',
});
const hasCore = adapter.features.has('core-features-and-limits');
const device = await adapter.requestDevice({
  requiredFeatures: \[
    ...(hasCore ? \['core-features-and-limits'\] : \[\]),
  \],
});

If `hasCore` is true then none of the above restrictions and limits apply.

Note that other code that wants to check if the device is a core or compatibility device should check the device’s features.

const isCore = device.features.has('core-features-and-limits');

This will always be true on a core device.

> Note: As of 2025-03-11, some browsers have not yet fully shipped WebGPU and have not added `'core'features-and'limits'` to their implementations. They should be updated soon.

# Testing compatibility mode

On a browser that supports compatibility mode you can test your application follows the restrictions by NOT requesting `'core-features-and-limits'` (as we did at the top). You may want to check that you actually have a compatibility device so you can know that the restrictions and limits are being enforced.

const adapter = await navigator.gpu.requestAdapter({
  featureLevel: 'compatibility',
});
const device = await adapter.requestDevice();

const isCompatibilityMode = !device.features.has('core-features-and-limits');

This is a good way to test if your app will run on these older devices.

> Note: As of 2025-03-11, some browsers have not yet fully shipped WebGPU and have not added `'core'features-and'limits'` to their implementations. They should be updated soon.

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU Compatibility Mode\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');