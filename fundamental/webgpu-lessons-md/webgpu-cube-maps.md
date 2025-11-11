English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [목차](#toc) 

# [webgpufundamentals.org](/webgpu/lessons/ko/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU 큐브맵

이 글은 여러분이 [텍스처에 관한 글](webgpu-textures.html) 과 [이미지를 텍스처로 가져오는 법](webgpu-importing-textures.html)에 대해 읽으셨다고 가정합니다. 또한 [방향성 조명](webgpu-lighting-directional.html)에 관한 글에서 설명한 개념도 사용합니다. 이 글들을 읽지 않으셨으면 먼저 읽으시는 것이 좋습니다.

[이전 글](webgpu-textures.html)에서 우리는 텍스처를 사용하는 방법과 0과 1사이의 텍스처 좌표로 어떻게 참조되는지, 추가적으로 밉을 사용해 어떻게 필터링되는지 살펴 봤습니다.

다른 종류의 텍스처로 \*큐브맵(cubemap)\*이 있습니다. 큐브맵은 큐브(육면체)의 여섯 개 면을 표현하는 텍스처입니다. 기본적인 텍스처 좌표는 두 개의 차원을 사용하지만, 큐브맵은 법선(normal), 즉 3차원 방향을 사용합니다. 이 법선이 가리키는 방향에 따라 큐브의 여섯 개 면 중 하나가 선택되고 그 면에서의 픽셀이 샘플링되어 색상이 생성됩니다.

간단한 예제를 만들어 봅시다. 각 여섯 개의 면에 사용할 이미지를 만드는 2D 캔버스를 먼저 만듭니다.

아래는 캔버스에 색상과 가운에 써있는 글을 만드는 코드입니다.

function generateFace(size, {faceColor, textColor, text}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = faceColor;
  ctx.fillRect(0, 0, size, size);
  ctx.font = \`${size \* 0.7}px sans-serif\`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const m = ctx.measureText(text);
  ctx.fillText(
    text,
    (size - m.actualBoundingBoxRight + m.actualBoundingBoxLeft) / 2,
    (size - m.actualBoundingBoxDescent + m.actualBoundingBoxAscent) / 2
  );
  return canvas;
}

그리고 아래는 위 함수를 호출해 여섯 개 이미지를 생성하는 코드입니다.

const faceSize = 128;
const faceCanvases = \[
  { faceColor: '#F00', textColor: '#0FF', text: '+X' },
  { faceColor: '#FF0', textColor: '#00F', text: '-X' },
  { faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
  { faceColor: '#0FF', textColor: '#F00', text: '-Y' },
  { faceColor: '#00F', textColor: '#FF0', text: '+Z' },
  { faceColor: '#F0F', textColor: '#0F0', text: '-Z' },
\].map(faceInfo => generateFace(faceSize, faceInfo));

// show the results
for (const canvas of faceCanvases) {
  document.body.appendChild(canvas);
}

[새 창으로 보려면 여기를 클릭하세요](/webgpu/lessons/../webgpu-cube-faces.html)

이제 큐브맵을 사용하여 이 이미지를 큐브에 적용해 봅시다. [이미지 로딩](webgpu-importing-textures.html#a-texture-atlases)의 텍스처 아틀라스 예제 코드를 가지고 시작해 보겠습니다.

먼저 큐브맵을 사용하도록 셰이더를 수정합니다.

struct Uniforms {
  matrix: mat4x4f,
};

struct Vertex {
  @location(0) position: vec4f,
-  @location(1) texcoord: vec2f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
-  @location(0) texcoord: vec2f,
+  @location(0) normal: vec3f,
};

...

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.position = uni.matrix \* vert.position;
-  vsOut.texcoord = vert.texcoord;
+  vsOut.normal = normalize(vert.position.xyz);
  return vsOut;
}

셰이더에서 텍스처 좌표를 제거하고 스테이지간 변수로 법선(normal)을 프래그먼트 셰이더로 전달하였습니다. 큐브는 원점에 위치해 있기 때문에 위치를 법선으로 그냥 사용할 수 있습니다.

[라이팅에 관한 글](webgpu-lighting-directional.html)에서 봤던 것처럼 법선은 어떤 정점의 표면 방향을 명시하기 위해 사용됩니다. 우리는 정점의 위치를 정규화하여 법선으로 사용하고 있으므로 조명 효과가 있다면 아래 그림과 같이 큐브 전체에 걸쳐 부드러운 효과를 얻게 됩니다.

standard cube normals vs this cube's normals

텍스처 좌표를 사용하지 않으므로 관련한 모든 코드를 삭제합니다.

  const vertexData = new Float32Array(\[
-     // front face     select the top left image
-    -1,  1,  1,        0   , 0  ,
-    -1, -1,  1,        0   , 0.5,
-     1,  1,  1,        0.25, 0  ,
-     1, -1,  1,        0.25, 0.5,
-     // right face     select the top middle image
-     1,  1, -1,        0.25, 0  ,
-     1,  1,  1,        0.5 , 0  ,
-     1, -1, -1,        0.25, 0.5,
-     1, -1,  1,        0.5 , 0.5,
-     // back face      select to top right image
-     1,  1, -1,        0.5 , 0  ,
-     1, -1, -1,        0.5 , 0.5,
-    -1,  1, -1,        0.75, 0  ,
-    -1, -1, -1,        0.75, 0.5,
-    // left face       select the bottom left image
-    -1,  1,  1,        0   , 0.5,
-    -1,  1, -1,        0.25, 0.5,
-    -1, -1,  1,        0   , 1  ,
-    -1, -1, -1,        0.25, 1  ,
-    // bottom face     select the bottom middle image
-     1, -1,  1,        0.25, 0.5,
-    -1, -1,  1,        0.5 , 0.5,
-     1, -1, -1,        0.25, 1  ,
-    -1, -1, -1,        0.5 , 1  ,
-    // top face        select the bottom right image
-    -1,  1,  1,        0.5 , 0.5,
-     1,  1,  1,        0.75, 0.5,
-    -1,  1, -1,        0.5 , 1  ,
-     1,  1, -1,        0.75, 1  ,
+     // front face
+    -1,  1,  1,
+    -1, -1,  1,
+     1,  1,  1,
+     1, -1,  1,
+     // right face
+     1,  1, -1,
+     1,  1,  1,
+     1, -1, -1,
+     1, -1,  1,
+     // back face
+     1,  1, -1,
+     1, -1, -1,
+    -1,  1, -1,
+    -1, -1, -1,
+    // left face
+    -1,  1,  1,
+    -1,  1, -1,
+    -1, -1,  1,
+    -1, -1, -1,
+    // bottom face
+     1, -1,  1,
+    -1, -1,  1,
+     1, -1, -1,
+    -1, -1, -1,
+    // top face
+    -1,  1,  1,
+     1,  1,  1,
+    -1,  1, -1,
+     1,  1, -1,
  \]);

  ...

  const pipeline = device.createRenderPipeline({
    label: '2 attributes',
    layout: 'auto',
    vertex: {
      module,
      buffers: \[
        {
-          arrayStride: (3 + 2) \* 4, // (3+2) floats 4 bytes each
+          arrayStride: (3) \* 4, // (3) floats 4 bytes each
          attributes: \[
            {shaderLocation: 0, offset: 0, format: 'float32x3'},  // position
-            {shaderLocation: 1, offset: 12, format: 'float32x2'},  // texcoord
          \],
        },
      \],
    },
    fragment: {
      module,
      targets: \[{ format: presentationFormat }\],
    },
    primitive: {
      cullMode: 'back',
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });

프래그먼트 셰이더에서는 `texture_2d` 대신 `texture_cube`를 사용하고, `textureSample`을 `texture_cube`와 사용할 때에는 `vec3f` 방향을 받으므로 법선을 넘겨줍니다. 법선은 스테이지간 변수이고 보간되기 때문에 정규화를 해 주어야 합니다.

@group(0) @binding(0) var<uniform> uni: Uniforms;
@group(0) @binding(1) var ourSampler: sampler;
-@group(0) @binding(2) var ourTexture: texture\_2d<f32>;
+@group(0) @binding(2) var ourTexture: texture\_cube<f32>;

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
-  return textureSample(ourTexture, ourSampler, vsOut.texcoord);
+  return textureSample(ourTexture, ourSampler, normalize(vsOut.normal));
}

실제로 큐브맵을 만들기 위해서는 여섯 개 레이어를 가진 2D 텍스처를 만들어야 합니다. 헬퍼 함수를 수정해 여러 개의 소스를 처리할 수 있도록 수정해 봅시다.

## 텍스처 헬퍼가 여러 레이어를 처리할 수 있도록 하기

먼저 `createTextureFromSource`를 소스의 배열을 받을 수 있는 `createTextureFromSources`로 수정합니다.

\-  function createTextureFromSource(device, source, options = {}) {
+  function createTextureFromSources(device, sources, options = {}) {
+    // Assume are sources all the same size so just use the first one for width and height
+    const source = sources\[0\];
    const texture = device.createTexture({
      format: 'rgba8unorm',
      mipLevelCount: options.mips ? numMipLevels(source.width, source.height) : 1,
-      size: \[source.width, source.height\],
+      size: \[source.width, source.height, sources.length\],
      usage: GPUTextureUsage.TEXTURE\_BINDING |
             GPUTextureUsage.COPY\_DST |
             GPUTextureUsage.RENDER\_ATTACHMENT,
    });
-    copySourceToTexture(device, texture, source, options);
+    copySourcesToTexture(device, texture, sources, options);
    return texture;
  }

위 코드는 소스의 개수만큼의 레이어를 갖는 텍스처를 만듭니다. 이 과정에서 모든 소스가 같은 크기라고 가정합니다. 같은 텍스처 내의 레이어에 다른 크기를 사용하는 경우는 매우 드물기 때문에 괜찮은 방법입니다.

이제 여러 소스를 처리할 수 있도록 `copySourceToTexture`를 수정해야 합니다.

\-  function copySourceToTexture(device, texture, source, {flipY} = {}) {
+  function copySourcesToTexture(device, texture, sources, {flipY} = {}) {
+    sources.forEach((source, layer) => {
\*      device.queue.copyExternalImageToTexture(
\*        { source, flipY, },
-        { texture },
+        { texture, origin: \[0, 0, layer\] },
\*        { width: source.width, height: source.height },
\*      );
+  });

    if (texture.mipLevelCount > 1) {
      generateMips(device, texture);
    }
  }

위의 코드에서 수정한 점은 루프를 추가해서 각 소스를 순회하도록 하고, 소스를 텍스처로 복사할 때마다 `origin`을 설정하도록 한 것입니다. 이렇게 해서 각 소스를 해당하는 레이어에 복사할 수 있습니다.

이제 여러 소스를 처리할 수 있도록 `generateMips`도 수정합니다.

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
+        for (let layer = 0; layer < texture.depthOrArrayLayers; ++layer) {
\*          const bindGroup = device.createBindGroup({
\*            layout: pipeline.getBindGroupLayout(0),
\*            entries: \[
\*              { binding: 0, resource: sampler },
\*              {
\*                binding: 1,
\*                resource: texture.createView({
+                  dimension: '2d',
\*                  baseMipLevel: baseMipLevel - 1,
\*                  mipLevelCount: 1,
+                  baseArrayLayer: layer,
+                  arrayLayerCount: 1,
\*                }),
\*              },
\*            \],
\*          });
\*
\*          const renderPassDescriptor = {
\*            label: 'our basic canvas renderPass',
\*            colorAttachments: \[
\*              {
-                view: texture.createView({baseMipLevel, mipLevelCount: 1}),
+                view: texture.createView({
+                  dimension: '2d',
+                  baseMipLevel: baseMipLevel,
+                  mipLevelCount: 1,
+                  baseArrayLayer: layer,
+                  arrayLayerCount: 1,
+                }),
\*                loadOp: 'clear',
\*                storeOp: 'store',
\*              },
\*            \],
\*          };
\*
\*          const pass = encoder.beginRenderPass(renderPassDescriptor);
\*          pass.setPipeline(pipeline);
\*          pass.setBindGroup(0, bindGroup);
\*          pass.draw(6);  // call our vertex shader 6 times
\*          pass.end();
+        }
+      }

      const commandBuffer = encoder.finish();
      device.queue.submit(\[commandBuffer\]);
    };
  })();

텍스처의 각 레이어를 처리하는 루프를 추가하였습니다. 뷰(view)를 수정하여 개별 레이어를 선택하도록 수정했습니다. 또한 `dimension: '2d'`를 명시적으로 선택했는데 기본적으로 하나 이상의 레이어를 갖는 2D 텍스처는 `dimension: '2d-array'`를 기본값으로 갖기 때문입니다. 이는 밉맵을 생성하는 우리의 목적과는 맞지 않습니다.

여기서 사용하진 않겠지만, 기존의 `createTextureFromSource`와 `copySourceToTexture` 함수는 아래와 같이 간단히 대체됩니다.

  function copySourceToTexture(device, texture, source, options = {}) {
    copySourcesToTexture(device, texture, \[source\], options);
  }

  function createTextureFromSource(device, source, options = {}) {
    return createTextureFromSources(device, \[source\], options);
  }

이제 준비가 되었으니 초반에 만들었던 면(face)들을 사용할 수 있습니다.

  const texture = await createTextureFromSources(
      device, faceCanvases, {mips: true, flipY: false});

이제 남은 것은 바인드그룹에서 텍스처의 뷰를 수정하는 것 뿐입니다.

  const bindGroup = device.createBindGroup({
    label: 'bind group for object',
    layout: pipeline.getBindGroupLayout(0),
    entries: \[
      { binding: 0, resource: { buffer: uniformBuffer }},
      { binding: 1, resource: sampler },
-      { binding: 2, resource: texture.createView() },
+      { binding: 2, resource: texture.createView({dimension: 'cube'}) },
    \],
  });

결과는 아래와 같습니다.

[새 창으로 보려면 여기를 클릭하세요](/webgpu/lessons/../webgpu-cube-map.html)

큐브맵을 큐브의 텍스처로 사용하는 것은 원래의 사용 용도가 **아닙니다**. 큐브를 텍스처링하는 _올바른_ 또는 표준적인 방법은 [이전에 이야기한 것처럼](webgpu-importing-textures.html#a-texture-atlases) 텍스처 아틀라스를 사용하는 것입니다. 이 글의 요지는 큐브맵에 대한 개념을 소개하고 방향(법선)을 전달하면 그 방향에 맞는 색상값이 반환된다는 사실을 보여드리는 것이었습니다.

이제 큐브맵이 무엇인지 배웠고 설정하는 법도 배웠는데, 그러면 큐브맵은 뭐에 사용하는 걸까요? 아마도 큐브맵이 사용되는 가장 일반적인 용도는 [_환경 맵(environment map)_](webgpu-environment-maps.html)일 겁니다.

English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文

*   기초

*   [기초](/webgpu/lessons/ko/webgpu-fundamentals.html)
*   [스테이지간 변수(Inter-stage Variables)](/webgpu/lessons/ko/webgpu-inter-stage-variables.html)
*   [Uniforms](/webgpu/lessons/ko/webgpu-uniforms.html)
*   [스토리지 버퍼(Storage Buffers)](/webgpu/lessons/ko/webgpu-storage-buffers.html)
*   [정점 버퍼](/webgpu/lessons/ko/webgpu-vertex-buffers.html)
*   텍스처

*   [텍스처](/webgpu/lessons/ko/webgpu-textures.html)
*   [이미지 로딩](/webgpu/lessons/ko/webgpu-importing-textures.html)
*   [비디오 사용하기](/webgpu/lessons/ko/webgpu-textures-external-video.html)
*   [큐브맵(Cube Maps)](/webgpu/lessons/ko/webgpu-cube-maps.html)
*   [스토리지 텍스처](/webgpu/lessons/ko/webgpu-storage-textures.html)
*   [멀티 샘플링 / MSAA](/webgpu/lessons/ko/webgpu-multisampling.html)

*   [상수(Constants)](/webgpu/lessons/ko/webgpu-constants.html)
*   [데이터 메모리 레이아웃](/webgpu/lessons/ko/webgpu-memory-layout.html)
*   [Transparency and Blending](/webgpu/lessons/ko/webgpu-transparency.html)
*   [Bind Group Layouts](/webgpu/lessons/ko/webgpu-bind-group-layouts.html)
*   [데이터 복사하기](/webgpu/lessons/ko/webgpu-copying-data.html)
*   [선택적 기능(optional feature)과 제한(limit)](/webgpu/lessons/ko/webgpu-limits-and-features.html)
*   [Timing Performance](/webgpu/lessons/ko/webgpu-timing.html)
*   [WGSL](/webgpu/lessons/ko/webgpu-wgsl.html)
*   [동작 방식](/webgpu/lessons/ko/webgpu-how-it-works.html)
*   [Compatibility Mode](/webgpu/lessons/ko/webgpu-compatibility-mode.html)

*   3D 수학

*   [Translation](/webgpu/lessons/ko/webgpu-translation.html)
*   [Rotation](/webgpu/lessons/ko/webgpu-rotation.html)
*   [Scale](/webgpu/lessons/ko/webgpu-scale.html)
*   [Matrix Math](/webgpu/lessons/ko/webgpu-matrix-math.html)
*   [Orthographic Projection](/webgpu/lessons/ko/webgpu-orthographic-projection.html)
*   [Perspective Projection](/webgpu/lessons/ko/webgpu-perspective-projection.html)
*   [Cameras](/webgpu/lessons/ko/webgpu-cameras.html)
*   [Matrix Stacks](/webgpu/lessons/ko/webgpu-matrix-stacks.html)
*   [Scene Graphs](/webgpu/lessons/ko/webgpu-scene-graphs.html)

*   조명

*   [Directional Lighting](/webgpu/lessons/ko/webgpu-lighting-directional.html)
*   [Point Lighting](/webgpu/lessons/ko/webgpu-lighting-point.html)
*   [Spot Lighting](/webgpu/lessons/ko/webgpu-lighting-spot.html)

*   기법

*   2D

*   [Large Clip Space Triangle](/webgpu/lessons/ko/webgpu-large-triangle-to-cover-clip-space.html)

*   3D

*   [Environment maps](/webgpu/lessons/ko/webgpu-environment-maps.html)
*   [Skyboxes](/webgpu/lessons/ko/webgpu-skybox.html)

*   후처리

*   [Basic CRT Effect](/webgpu/lessons/ko/webgpu-post-processing.html)

*   컴퓨트 셰이더

*   [컴퓨트 셰이더 기초](/webgpu/lessons/ko/webgpu-compute-shaders.html)
*   [Image Histogram](/webgpu/lessons/ko/webgpu-compute-shaders-histogram.html)
*   [Image Histogram Part 2](/webgpu/lessons/ko/webgpu-compute-shaders-histogram-part-2.html)

*   기타

*   [Resizing the Canvas](/webgpu/lessons/ko/webgpu-resizing-the-canvas.html)
*   [Multiple Canvases](/webgpu/lessons/ko/webgpu-multiple-canvases.html)
*   [Points](/webgpu/lessons/ko/webgpu-points.html)
*   [WebGPU from WebGL](/webgpu/lessons/ko/webgpu-from-webgl.html)
*   [Speed and Optimization](/webgpu/lessons/ko/webgpu-optimization.html)
*   [Debugging and Errors](/webgpu/lessons/ko/webgpu-debugging.html)
*   [리소스 / 참고자료](/webgpu/lessons/ko/webgpu-resources.html)
*   [WGSL Function Reference](/webgpu/lessons/ko/webgpu-wgsl-function-reference.html)
*   [WGSL Offset Computer](/webgpu/lessons/resources/wgsl-offset-computer.html)

*   [github](https://github.com/webgpu/webgpufundamentals)
*   [WGSL Offset Computer](/webgpu/lessons/resources/wgsl-offset-computer.html)
*   [Tour of WGSL](https://google.github.io/tour-of-wgsl/)
*   [WebGPU API Reference](https://gpuweb.github.io/types/)
*   [WebGPU Spec](https://www.w3.org/TR/webgpu/)
*   [WGSL Spec](https://www.w3.org/TR/WGSL/)
*   [WebGPUReport.org](https://webgpureport.org)
*   [Web3DSurvey.com](https://web3dsurvey.com/webgpu)

질문이 있나요? [Stack Overflow](http://stackoverflow.com/questions/tagged/webgpu)에 물어보세요.

[제안](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=suggested+topic&template=suggest-topic.md&title=%5BSUGGESTION%5D) / [요청 사항](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=&template=request.md&title=) / [이슈](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=bug+%2F+issue&template=bug-issue-report.md&title=) / [버그](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=bug+%2F+issue&template=bug-issue-report.md&title=)

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU 큐브맵\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "<a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a>님<br> 당신의 <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} 기여에 감사드립니다.</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');