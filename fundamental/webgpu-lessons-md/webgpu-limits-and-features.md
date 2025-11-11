English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [목차](#toc) 

# [webgpufundamentals.org](/webgpu/lessons/ko/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU 선택적 기능(optional feature)과 제한(limit)

WebGPU에는 다양한 선택적 기능(optional feature)과 제한(limit)이 있습니다. 이들을 확인하고 요청하는 방법을 알아보겠습니다.

아래 코드로 어댑터를 요청할 때,

const adapter = await navigator.gpu?.requestAdapter();

어댑터는 `adapter.limits`에 제한의 목록을, `adapter.features`에 기능 이름의 배열을 가지고 있습니다. 예를 들어 아래와 같은 코드는,

const adapter = await navigator.gpu?.requestAdapter();
console.log(adapter.limits.maxColorAttachments);

`8`을 콘솔에 출력할텐데 즉 어댑터가 최대 8개의 컬러 어태치먼트를 지원한다는 뜻입니다.

아래는 제한의 전체 목록입니다. 여러분의 기본 어댑터의 제한과 최소 요구사항 제한이 모두 포함되어 있습니다.

최소 요구사항은 WebGPU를 지원하는 모든 장치에서 보장된 최소 사양입니다.

선택적 기능의 목록도 있습니다. 예를 들어 아래와 같은 코드로 모두 살펴볼 수 있습니다.

const adapter = await navigator.gpu?.requestAdapter();
console.log(adapter.features);

이렇게 하면 `["texture-compression-astc", "texture-compression-bc"]`와 같이 출력되는데, 이러한 기능들은 여러분이 요청하면 사용 가능하다는 뜻입니다.

여러분의 기본 어댑터에서 사용 가능한 기능들은 아래와 같습니다.

> 참고: 여러분 시스템의 어댑터의 모든 기능과 제한사항은 [webgpureport.org](https://webgpureport.org)에서 확인할 수 있습니다.

## 제한과 기능 요청하기

기본적으로 여러분이 장치를 요청할 때 최소 제한(위 표에서 오른쪽 열)을 얻을 수 있고 선택적 기능은 없는 상태입니다. 여러분이 이러한 최소 제한 하에서 개발을 하면, 여러분의 앱은 WebGPU를 지원하는 모든 장치에서 동작하게 될 겁니다.

하지만 어댑터에 대한 가능한 제한과 기능 목록에 기반하여 `requestDevice`를 호출할 때 필요로 하는 최소 사양을 `requiredLimits`에, 선택적 기능을 `requiredFeatures`에 넘겨줄 수 있습니다. 예를 들어,

const k1Gig = 1024 \* 1024 \* 1024;
const adapter = await navigator.gpu?.requestAdapter();
const device = adapter?.requestDevice({
  requiredLimits: { maxBufferSize: k1Gig },
  requiredFeatures: \[ 'float32-filterable' \],
});

위에서 우리는 1GB의 버퍼가 사용 가능해야 하고 필터링 가능한 float32 텍스처가 사용 가능해야 한다는 요구사항을 명시하고 있습니다. (예를들어 `'rgba32float'`에 대해 minFilter가 `'linear'`로 설정 가능해야 한다는 뜻입니다. 기본적으로는 `'nearest'`밖에 사용하지 못합니다.)

둘 중 어떤 요구사항이라도 만족되지 않으면 `requestDevice`는 실패합니다(프라미스를 reject합니다).

## 모든 것을 요구하지 마세요

모든 제한과 기능을 요청해서 만족하는지 확인하고 싶어하실 수도 있습니다.

예를 들어:

function objLikeToObj(src) {
  const dst = {};
  for (const key in src) {
    dst\[key\] = src\[key\];
  }
  return dst;
}

//
// BAD!!! ?
//
async function main() {
  const adapter = await navigator?.gpu.requestAdapter();
  const device = await adapter?.requestDevice({
    requiredLimits: objLikeToObj(adapter.limits),
    requiredFeatures: adapter.features,
  });
  if (!device) {
    fail('need webgpu');
    return;
  }

  const canUse128KUniformsBuffers = device.limits.maxUniformBufferBindingSize >= 128 \* 1024;
  const canStoreToBGRA8Unorm = device.features.has('bgra8unorm-storage');
  const canIndirectFirstInstance = device.features.has('indirect-first-instance');
}

이는 제한과 기능을 확인하는 간단하고 명료한 방법처럼 보입니다[\[1\]](#fn1). 이러한 패턴의 문제는, 우연히 이제한 제한을 만족했는데 모를 수도 있다는 것입니다. 예를 들어 `'rgba32float'` 텍스처를 만들고 `'linear'`로 필터링했다고 해봅시다. 여러분의 데스크탑에서는 이를 활성화했기 때문에 잘 동작할겁니다.

유저의 핸드폰에서는 `'float32-filterable'` 기능이 없기 때문에 프로그램이 제대로 동작하지 않지만 여전히 여러분은 이를 깨닫지 못한채 사용이 가능할 수도 있습니다. 선택적인 기능이니까요.

또는 최소한의 `maxBufferSize`보다 더 큰 버퍼를 할당해 사용한다면, 역시나 제한을 넘어 사용하고 있는다는 것을 모를 수 있습니다. 여러분의 웹페이지는 유저들에게서는 제대로 실행되지 않을 것입니다.

## 기능과 제한 요청에 대한 추천하는 방법

기능과 제한을 요청하는 추천하는 방법은 반드시 필요한 것을 결정하고 그것들만 요청하는 것입니다.

예를 들어 아래와 같습니다.

  const adapter = await navigator?.gpu.requestAdapter();

  const canUse128KUniformsBuffers = adapter?.limits.maxUniformBufferBindingSize >= 128 \* 1024;
  const canStoreToBGRA8Unorm = adapter?.features.has('bgra8unorm-storage');
  const canIndirectFirstInstance = adapter?.features.has('indirect-first-instance');

  // if we absolutely need these one or more of these features then fail now if they are not
  // available
  if (!canUse128kUniformBuffers) {
    alert('Sorry, your device is probably too old or underpowered');
    return;
  }

  // Request the available features and limits we need
  const device = adapter?.requestDevice({
    requiredFeatures: \[
      ...(canStorageBGRA8Unorm ? \['bgra8unorm'\] : \[\]),
      ...(canIndirectFirstInstance) ? \['indirect-first-instance'\]),
    \],
    requiredLimits: \[
      maxUniformBufferBindingSize: 128 \* 1024,
    \]
  });

이렇게 하면, 128k보다 큰 uniform 버퍼를 요청하면 오류가 발생합니다. 유사하게 요청하지 않은 기능을 사용하려 할 경우에도 오류가 발생하게 됩니다. 이렇게 하면 확실하게 제한 요구사항을 올릴지 (그래서 더 다양한 장치에서 사용은 못하더라도), 아니면 제한을 유지할 지, 아니면 기능이나 제한이 만족되지 않는 경우에 대해 다른 방식으로 동작하도록 할 지를 의식적으로 결정할 수 있게 됩니다.

* * *

1.  `objLikeToObj`는 뭐고 왜 사용한 것일까요? 그 이유는 난해한 Web 명세 때문입니다. 명세에는 `requiredLimits`를 `record<DOMString, GPUSize64>`로 목록화하고 있습니다.  
    Web IDL 명세에서는 객체를 `record<DOMString, GPUSize64>`로 변환할 때, 객체가 실제로 _소유한(own)_ 속성만을 복사하도록 명시하고 있습니다. 어댑터의 `limits` 객체는 `interface`의 목록입니다. 객체의 속성처럼 보이는 것은 실제로는 속성이 아니고 객체의 프로토타입(prototype)에 있는 getter입니다. 따라서 이들은 실제로는 객체가 소유한 속성이 아닙니다. 따라서 `record<DOMString, GPUSize64>`로 변환할 때 복사되지 않고 우리가 직접 복사해 주어야 합니다. [↩︎](#fnref1)
    

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU 선택적 기능(optional feature)과 제한(limit)\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "<a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a>님<br> 당신의 <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} 기여에 감사드립니다.</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');