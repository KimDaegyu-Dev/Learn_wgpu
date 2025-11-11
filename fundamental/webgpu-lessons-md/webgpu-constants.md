English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [목차](#toc) 

# [webgpufundamentals.org](/webgpu/lessons/ko/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU 셰이더 상수(Constants)

이 내용이 셰이더 입력의 한 종류로 간주될 수 있는지는 잘 모르겠습니다. 하지만 어떤 면에서는 그렇게 볼 수도 있으니 한번 이야기 해 보겠습니다.

상수(Constants), 좀더 정확히는 _파이프라인에서 오버라이딩 가능한 상수(pipeline-overridable constants)_ 는 셰이더에서 선언이 가능하고, 그 셰이더를 파이프라인을 만들기 위해 사용하는 시점에 값을 변경할 수 있는 상수입니다.

간단한 예제는 아래와 같습니다.

override red = 0.0;
override green = 0.0;
override blue = 0.0;

@fragment fn fs() -> @location(0) vec4f {
  return vec4f(red, green, blue, 1.0);
}

이 프래그먼트 셰이더와 [기초](webgpu-fundamentals.html)에서의 정점 셰이더를 사용해 보겠습니다.

@vertex fn vs(
  @builtin(vertex\_index) vertexIndex : u32
) -> @builtin(position) vec4f {
  let pos = array(
    vec2f( 0.0,  0.5),  // top center
    vec2f(-0.5, -0.5),  // bottom left
    vec2f( 0.5, -0.5)   // bottom right
  );

  return vec4f(pos\[vertexIndex\], 0.0, 1.0);
}

그러면 결과로 아래와 같은 검은색 삼각형이 그려집니다.

[새 창으로 보려면 여기를 클릭하세요](/webgpu/lessons/../webgpu-constants.html)

하지만 저 상수들의 값을 바꿀 수 있습니다. 또는 "오버라이드"할 수 있다고도 하는데, 파이프라인에 명시하는 시점에서 할 수 있습니다.

  const pipeline = device.createRenderPipeline({
    label: 'our hardcoded triangle pipeline',
    layout: 'auto',
    vertex: {
      module,
    },
    fragment: {
      module,
      targets: \[{ format: presentationFormat }\],
+      constants: {
+        red: 1,
+        green: 0.5,
+        blue: 1,
+      },
    },
  });

이제 핑크색으로 그려집니다.

[새 창으로 보려면 여기를 클릭하세요](/webgpu/lessons/../webgpu-constants-override.html)

파이프라인에서 오버라이딩 가능한 상수는 스칼라(scalar) 값만 가능하므로, 불리언(true/false), 정수, 부동소수점만 사용할 수 있습니다. 벡터 또는 행렬은 불가능합니다.

셰이더에서 값을 명시하지 않으면 **반드시** 파이프라인에서 값을 제공해야 합니다. 또한 숫자 ID를 부여하고 ID를 기반으로 참조하는 것도 가능합니다.

예시:

override red: f32;             // Must be specified in the pipeline
@id(123) override green = 0.0; // May be specified by 'green' or by 123
override blue = 0.0;

@fragment fn fs() -> @location(0) vec4f {
  return vec4f(red, green, blue, 1.0);
}

이게 왜 필요한지 의문이 드실겁니다. WGSL을 만들 때 단순히 아래와 같이 할 수도 있습니다.

const red = 0.5;
const blue = 0.7;
const green = 1.0;

const code = \`
const red = ${red};
const green = ${green};
const blue = ${blue};

@fragment fn fs() -> @location(0) vec4f {
  return vec4f(red, green, blue, 1.0);
}
\`;

또는 보다 직접적으로 아래와 같이 할 수도 있죠.

const red = 0.5;
const blue = 0.7;
const green = 1.0;

const code = \`
@fragment fn fs() -> @location(0) vec4f {
  return vec4f(${red}, ${green}, ${blue}, 1.0);
}
\`;

차이점은, 파이프라인에서 오버라이딩가능한 상수는 셰이더 모듈이 생성된 “다음에” 적용되기 때문에 값을 적용한 후 새로운 셰이더 모듈을 적용하는 것보다 기술적으로 더 빠릅니다. 하지만 파이프라인을 만드는 것 자체가 빠른 연산이 아니기 때문에 이러한 기능이 전체적인 파이프라인 생성 과정을 얼마나 단축시킬 수 있는지는 명확하지 않습니다. 어쩌면 WebGPU 구현이 특정 상수로 처음 파이프라인을 생성할 때의 정보를 활용하여, 다음번에 다른 상수로 파이프라인을 생성할 때 훨씬 적은 작업이 수행되도록 할 수 있을 것입니다.

어쨌든 이 기능은 셰이더에 적은 양의 데이터를 전달하는 방법 중 하나입니다.

## 엔트리 포인트는 독립적으로 평가됩니다

엔트리 포인트는 독립적으로 평가된다는 점을 기억하는 것이 중요합니다. 이는 [스테이지 간 변수에 관한 글](webgpu-inter-stage-variables.html#a-builtin-position)에서 부분적으로 다루었던 내용입니다.

`createShaderModule`에 전달된 코드에서 현재 엔트리 포인트와 관련 없는 모든 것이 제거된 것처럼 동작합니다. 파이프라인 오버라이드 상수가 적용된 다음, 해당 엔트리 포인트에 대한 셰이더가 생성됩니다.

위의 예제를 확장해 보겠습니다. 정점 스테이지와 프래그먼트 스테이지 모두 상수를 사용하도록 셰이더를 변경하겠습니다. 정점 스테이지의 값을 프래그먼트 스테이지로 전달합니다. 그런 다음 50픽셀의 수직 스트립마다 두 값 중 하나를 번갈아 사용하여 그립니다.

+struct VOut {
+  @builtin(position) pos: vec4f,
+  @location(0) color: vec4f,
+}

@vertex fn vs(
  @builtin(vertex\_index) vertexIndex : u32
-) -> @builtin(position) vec4f {
+) -> VOut {
  let pos = array(
    vec2f( 0.0,  0.5),  // top center
    vec2f(-0.5, -0.5),  // bottom left
    vec2f( 0.5, -0.5)   // bottom right
  );

-  return vec4f(pos\[vertexIndex\], 0.0, 1.0);
+  return VOut(
+    vec4f(pos\[vertexIndex\], 0.0, 1.0),
+    vec4f(red, green, blue, 1),
+  );
}

override red = 0.0;
override green = 0.0;
override blue = 0.0;

-@fragment fn fs() -> @location(0) vec4f {
-  return vec4f(red, green, blue, 1.0);
+@fragment fn fs(v: VOut) -> @location(0) vec4f {
+  let colorFromVertexShader = v.color;
+  let colorFromFragmentShader = vec4f(red, green, blue, 1.0);
+  // select one color or the other every 50 pixels
+  return select(
+    colorFromVertexShader,
+    colorFromFragmentShader,
+    v.pos.x % 100.0 > 50.0);
}

이제 각 엔트리 포인트에 서로 다른 상수를 전달하겠습니다.

  const pipeline = device.createRenderPipeline({
    label: 'our hardcoded triangle pipeline',
    layout: 'auto',
    vertex: {
      module,
+      constants: {
+        red: 1,
+        green: 1,
+        blue: 0,
+      },
    },
    fragment: {
      module,
      targets: \[{ format: presentationFormat }\],
      constants: {
        red: 1,
        green: 0.5,
        blue: 1,
      },
    },
  });

결과를 보면 각 스테이지에서 상수가 달랐다는 것을 알 수 있습니다.

[새 창으로 보려면 여기를 클릭하세요](/webgpu/lessons/../webgpu-constants-override-set-entry-points.html)

다시 말하지만, 기능적으로 하나의 WGSL `code`로 하나의 셰이더 모듈을 사용한 것은 단지 편의를 위한 것입니다. 위의 코드는 기능적으로 아래 코드와 동일합니다.

  const vertexModule = device.createShaderModule({
    code: /\* wgsl \*/ \`
      struct VOut {
        @builtin(position) pos: vec4f,
        @location(0) color: vec4f,
      }

      @vertex fn vs(
        @builtin(vertex\_index) vertexIndex : u32
      ) -> VOut {
        let pos = array(
          vec2f( 0.0,  0.5),  // top center
          vec2f(-0.5, -0.5),  // bottom left
          vec2f( 0.5, -0.5)   // bottom right
        );

        return VOut(
          vec4f(pos\[vertexIndex\], 0.0, 1.0),
          vec4f(red, green, blue, 1),
        );
      }

      override red = 0.0;
      override green = 0.0;
      override blue = 0.0;
    \`,
  });

  const fragmentModule = device.createShaderModule({
    code: /\* wgsl \*/ \`
      struct VOut {
        @builtin(position) pos: vec4f,
        @location(0) color: vec4f,
      }

      override red = 0.0;
      override green = 0.0;
      override blue = 0.0;

      @fragment fn fs(v: VOut) -> @location(0) vec4f {
        let colorFromVertexShader = v.color;
        let colorFromFragmentShader = vec4f(red, green, blue, 1.0);
        // select one color or the other every 50 pixels
        return select(
          colorFromVertexShader,
          colorFromFragmentShader,
          v.pos.x % 100.0 > 50.0);
      }
    \`,
  });

  const pipeline = device.createRenderPipeline({
    label: 'our hardcoded triangle pipeline',
    layout: 'auto',
    vertex: {
\*      module: vertexModule,
      constants: {
        red: 1,
        green: 1,
        blue: 0,
      },
    },
    fragment: {
\*      module: fragmentModule,
      targets: \[{ format: presentationFormat }\],
      constants: {
        red: 1,
        green: 0.5,
        blue: 1,
      },
    },
  });

[새 창으로 보려면 여기를 클릭하세요](/webgpu/lessons/../webgpu-constants-override-separate-modules.html)

참고: 색상값을 전달하기 위해 파이프라인에서 오버라이딩가능한 상수를 사용하는 것은 흔한 일이 **아닙니다**. 색상을 예시로 사용한 이유는 이해하기 쉽고 결과를 보여주기 좋기 때문입니다.

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU 셰이더 상수(Constants)\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "<a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a>님<br> 당신의 <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} 기여에 감사드립니다.</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');