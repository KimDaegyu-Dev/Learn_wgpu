English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [목차](#toc) 

# [webgpufundamentals.org](/webgpu/lessons/ko/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU 데이터 복사하기

지금까지 대부분의 글에서 버퍼에 데이터를 넣기 위해서 `writeBuffer`를 사용하고 텍스처에 데이터를 넣기 위해서 `writeTexture`를 사용했습니다. 버퍼나 텍스처에 데이터를 전달하는 다양한 방법이 있습니다.

## `writeBuffer`

`writeBuffer`는 자바스크립트의 [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) 또는 [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)로부터 버퍼로 데이터를 복사합니다. 이는 버퍼로 데이터를 전달하는 가장 직관적인 방법입니다.

`writeBuffer`는 아래와 같은 포맷을 따릅니다.

device.queue.writeBuffer(
  destBuffer,  // 데이터를 쓸 대상 버퍼
  destOffset,  // 대상의 어디에서부터 데이터를 쓰기 시작할 것인지
  srcData,     // typedArray 또는 arrayBuffer
  srcOffset?,  // srcData의 어떤 \*\*요소(element)\*\*부터 복사할 것인지 오프셋
  size?,       // 복사항 srcData의 \*\*요소\*\*단위 크기
)

`srcOffset`이 전달되지 않았으면 `0`을 사용합니다. `size`가 전달되지 않았다면 `srcData`의 크기가 사용됩니다.

> 중요: `srcOffset`과 `size`는 `srcData`의 요소 단위입니다.
> 
> 다시 말해,
> 
> device.queue.writeBuffer(someBuffer, someOffset, someFloat32Array, 6, 7);
> 
> 위 코드는 float32의 6번째부터 7개의 데이터를 복사합니다. 다른 방식으로 말하자면 `someFloat32Array`의 뷰(view)로 arrayBuffer의 24바이트 위치부터 시작해서 28 바이트를 복사합니다.

## `writeTexture`

`writeTexture`는 자바스크립트의 [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) 또는 [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)로부터 텍스처로 데이터를 복사합니다.

`writeTexture`는 아래와 같은 시그니처(signature)를 갖습니다.

device.writeTexture(
  // 복사 대상의 세부사항
  { texture, mipLevel: 0, origin: \[0, 0, 0\], aspect: "all" },

  // 소스 데이터
  srcData,

  // 소스 데이터 세부사항
  { offset: 0, bytesPerRow, rowsPerImage },

  // 크기:
  \[width, height, depthOrArrayLayers\]
);

주의 사항으로:

*   `texture`에 `GPUTextureUsage.COPY_DST` usage가 있어야 합니다.
    
*   `mipLevel`, `origin`, `aspect` 는 모두 기본값이 있어서 생략하는 경우가 많습니다.
    
*   `bytesPerRow`: 이 값은 다음 \*블럭 행(block row)\*의 데이터를 얻기 위해 알마나 많은 바이트를 건너가야 하는지에 대한 값입니다.
    
    이는 하나 이상의 _블럭 행_을 복사할 떄 필요합니다. 거의 대분 하나 이상의 _블럭 행_을 복사하기 때문에 거의 대부분의 경우에 값을 명시해야 합니다.
    
*   `rowsPerImage`: 이 값은 하나의 이미지에서부터 다음 이미지까지 얼마나 많은 _블럭 행_을 건너가야 하는지에 대한 값입니다.
    
    이는 하나 이상의 레이어를 복사할 때 필요합니다. 다시 말해, 크기 인자의 `depthOrArrayLayers`가 1 이상이라면 이 값을 명시해야 합니다.
    

복사는 아래와 같은 방식으로 동작한다고 생각할 수 있습니다.

// pseudo code
const \[x, y, z\] = origin || \[0, 0, 0\];
const \[blockWidth, blockHeight\] = getBlockSizeForTextureFormat(texture.format);

const blocksAcross = width / blockWidth;
const blocksDown = height / blockHeight;

for (layer = 0; layer < depthOrArrayLayers; layer) {
  for (row = 0; row < blocksDown; ++row) {
    const start = offset + (layer \* rowsPerImage + row) \* bytesPerRow;
    copyRowToTexture(
      texture, // texture to copy to
      x,
      y + row,
      z + layer, // where in texture to copy to
      srcDataAsBytes + start,
      bytesPerRow
    );
  }
}

### **블럭 행(block row)**

텍스처는 블럭과 같은 구조입니다. 대부분의 _일반적인_ 텍스처는 블럭 행과 열이 모두 1입니다. 압축된(compressed) 텍스처에서는 상황이 변합니다. 예를들어 `bc1-rgba-unorm` 포맷은 블럭의 너비와 높이가 4입니다. 즉 width를 8로, 높이를 12로 설정했다면 여섯 개의 블럭만 복사됩니다. 첫 번째와 두 번째 행에서는 2개씩, 세 번째 행에서 2개가 복사됩니다.

압축된 텍스처에서는 크기와 원점(origin)이 블럭의 크기와 정렬되어야 합니다.

> 주의: WebGPU에서 (`GPUExtent3D`로 정의된)크기를 입력받는 경우 1~3개의 숫자로 이루어진 배열이거나, 1~3개의 속성을 갖는 객체입니다. `height`와 `depthOrArrayLayers`의 기본값은 1입니다. 따라서,
> 
> *   `[2]` width = 2, height = 1, depthOrArrayLayers = 1
> *   `[2, 3]` width = 2, height = 3, depthOrArrayLayers = 1
> *   `[2, 3, 4]` width = 2, height = 3, depthOrArrayLayers = 4
> *   `{ width: 2 }` width = 2, height = 1, depthOrArrayLayers = 1
> *   `{ width: 2, height: 3 }` width = 2, height = 3, depthOrArrayLayers = 1
> *   `{ width: 2, height: 3, depthOrArrayLayers: 4 }` width = 2, height = 3, depthOrArrayLayers = 4

> 같은 방식으로 (`GPUOrigin3D`로 정의된) 원점에 대해서는 3개의 숫자로 이루어진 배열이거나 `x`, `y`, `z` 속성을 갖는 객체입니다. 기본값은 모두 0입니다. 따라서,
> 
> *   `[5]` an origin where x = 5, y = 0, z = 0
> *   `[5, 6]` an origin where x = 5, y = 6, z = 0
> *   `[5, 6, 7]` an origin where x = 5, y = 6, z = 7
> *   `{ x: 5 }` an origin where x = 5, y = 0, z = 0
> *   `{ x: 5, y: 6 }` an origin where x = 5, y = 6, z = 0
> *   `{ x: 5, y: 6, z: 7 }` an origin where x = 5, y = 6, z = 7

*   `aspect`는 깊이-스텐실(stencil) 포맷으로 데이터를 복사할 때만 관여합니다. 각 aspect마다 한 번씩 데이터를 복사해야 하며 `depth-only` 또는 `stencil-only`를 사용해야 합니다.

## `copyBufferToBuffer`

`copyBufferToBuffer`는 이름 그대로 하나의 버퍼에서 다른 버퍼로 데이터를 복사합니다.

시그니처는:

encoder.copyBufferToBuffer(
  source, // 복사할 값을 얻어올 버퍼
  sourceOffset, // 어느 위치부터 가져올 것인지
  dest, // 복사할 대상 버퍼
  destOffset, // 어느 위치부터 넣을 것인지
  size // 몇 바이트를 복사할 것인지
);

*   `source`는 `GPUBufferUsage.COPY_SRC`여야 합니다.
*   `dest`는 `GPUBufferUsage.COPY_DST`여야 합니다.
*   `size`는 4의 배수여야 합니다.

## `copyBufferToTexture`

`copyBufferToTexture`는 이름 그대로 버퍼에서 텍스처로 데이터를 복사합니다.

시그니처는:

encode.copyBufferToTexture(
  // 소스 버퍼 세부사항
  { buffer, offset: 0, bytesPerRow, rowsPerImage },

  // 대상 텍스처 세부사항
  { texture, mipLevel: 0, origin: \[0, 0, 0\], aspect: "all" },

  // 크기:
  \[width, height, depthOrArrayLayers\]
);

`writeTexture`와 거의 동일한 매개변수를 갖습니다. 가장 큰 차이는 `bytesPerRow`이며 **256의 배수여야 합니다!!**

*   `texture`는 `GPUTextureUsage.COPY_DST`여야 합니다.
*   `buffer`는 `GPUBufferUsage.COPY_SRC`여야 합니다.

## `copyTextureToBuffer`

`copyTextureToBuffer`는 이름 그대로 텍스처에서 버퍼로 데이터를 복사합니다.

시그니처는:

encode.copyTextureToBuffer(
  // 소스 텍스처 세부사항
  { texture, mipLevel: 0, origin: \[0, 0, 0\], aspect: "all" },

  // 대상 버퍼 세부사항
  { buffer, offset: 0, bytesPerRow, rowsPerImage },

  // 크기:
  \[width, height, depthOrArrayLayers\]
);

이는 `copyBufferToTexture`와 비슷한 매개변수를 가지며, 텍스처(여기서는 소스)와 버퍼(여기서는 대상)가 바뀐 형태입니다. `copyTextureToBuffer`에서처럼 `bytesPerRow`는 **256의 배수여야 합니다!!**

*   `texture`는 `GPUTextureUsage.COPY_SRC`여야 합니다.
*   `buffer`는`GPUBufferUsage.COPY_DST`여야 합니다.

## `copyTextureToTexture`

`copyTextureToTexture`는 텍스처의 일부분을 다른 텍스처에 복사합니다.

두 텍스처는 모두 같은 포맷이거나 접미어인 `'-srgb'`만 달라야 합니다.

시그니처는:

encode.copyTextureToBuffer(
  // 소스 텍스처 세부사항
  src: { texture, mipLevel: 0, origin: \[0, 0, 0\], aspect: "all" },

  // 대상 텍스처 세부사항
  dst: { texture, mipLevel: 0, origin: \[0, 0, 0\], aspect: "all" },

  // 크기:
  \[ width, height, depthOrArrayLayers \]
);

*   src.`texture`는 `GPUTextureUsage.COPY_SRC`여야 합니다.
*   dst.`texture`는 `GPUTextureUsage.COPY_DST`여야 합니다.
*   `width`는 블럭 너비의 배수여야 합니다.
*   `height`는 블럭 높이의 배수여야 합니다.
*   src.`origin[0]` 또는 `.x` 는 너비의 배수여야 합니다.
*   src.`origin[1]` 또는 `.y` 는 높이의 배수여야 합니다.
*   dst.`origin[0]` 또는 `.x` 는 너비의 배수여야 합니다.
*   dst.`origin[1]` 또는 `.y` 는 높이의 배수여야 합니다.

## 셰이더

셰이더는 스토리지 버퍼, 스토리지 텍스처에 값을 쓸 수 있으며 간접적으로 텍스처에 렌더링을 할 수 있습니다. 이러한 방법들이 버퍼나 텍스처에 값을 쓰는 방법입니다. 즉 데이터를 생성하는 셰이더를 만들 수 있습니다.

## 버퍼 맵핑(mapping)

버퍼를 맵핑할 수 있습니다. 버퍼를 맵핑한다는 뜻은 자바스크립트에서 값을 읽거나 쓸 수 있도록 한다는 뜻입니다. 최소한 WebGPU의 버전 1에서 맵핑 가능한(mappable) 버퍼에는 심각한 제약사항이 있습니다. 이는 맵핑 가능한 버퍼가 데이터를 복사항 임시 공간으로만 사용 가능한 점입니다. 맵핑 가능한 버퍼는 다른 종류의 버퍼(Uniform 버퍼, 정점 버퍼, 인덱스 버퍼, 스토리지 버퍼 등)로 사용할 수 없습니다. [\[1\]](#fn1)

맵핑가능한 버퍼는 두 종류의 사용법 플래그의 조합으로 만들 수 있습니다.

*   `GPUBufferUsage.MAP_READ | GPU_BufferUsage.COPY_DST`
    
    다른 버퍼나 텍스처로부터 데이터를 복사하는 커맨드를 사용할 수 있는 버퍼로, 맵핑하여 자바스크립트로부터 데이터를 읽을 수 있습니다.
    
*   `GPUBufferUsage.MAP_WRITE | GPU_BufferUsage.COPY_SRC`
    
    자바스크립트에서 맵핑하여 데이터를 넣을 수 있는 버퍼입니다. 그리고 언맵핑(unmap)하여 위에서 설명한 복사 커맨드로 그 내용을 다른 버퍼나 텍스처에 복사할 수 있습니다.
    

버퍼의 맵핑 과정은 비동기적입니다. `offset`과 `size`를 바이트 단위로 하여 `buffer.mapAsync(mode, offset = 0, size?)`를 호출할 수 있습니다. `size`가 명시되어 있지 않으면 전체 버퍼 크기를 의미합니다. `mode`는 `GPUMapMode.READ` 또는 `GPUMapMode.WRITE`여야 하며 당연히 버퍼를 생성할 때 사용한 `MAP_` 사용법 플래그와 일치해야 합니다.

`mapAsync`는 프라미스(Promise)를 반환합니다. 프라미스가 해소(resolve)되면 버퍼는 맵핑 가능한 상태가 됩니다. 이후에 `buffer.getMappedRange(offset = 0, size?)`를 호출해서 버퍼의 일부 또는 전체를 볼 수 있으며, 여기서 `offset`은 맵핑한 버퍼의 일부분에 대한 바이트 오프셋입니다. `getMappedRange`는 [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)를 반환하니 이 값을 사용하기 위해서는 일반적으로 이 값을 가지고 TypedArray를 만들게 됩니다.

아래는 버퍼 맵핑의 한 예입니다.

const buffer = device.createBuffer({
  size: 1024,
  usage: GPUBufferUsage.MAP\_READ | GPUBufferUsage.COPY\_DST,
});

// map the entire buffer
await buffer.mapAsync(GPUMapMode.READ);

// get the entire buffer
const f32 = new Float32Array(buffer.getMappedRange())

...

buffer.unmap();

Note: 한 번 맵핑이 되면, 버퍼는 `unmap`을 호출하기 전까지는 WebGPU에서 사용 불가능한 상태가 됩니다. `unmap`을 호출한 순간 버퍼는 자바스크립트에서 사라집니다. 다시 말해 위 예제를 기반으로 설명하자면 아래와 같습니다.

const f32 = new Float32Array(buffer.getMappedRange());

f32\[0\] = 123;
console.log(f32\[0\]); // prints 123

buffer.unmap();

console.log(f32\[0\]); // prints undefined

데이터를 읽기 위해 버퍼를 맵핑하는 예제는 이미 본 적이 있습니다. [첫 번째 글](webgpu-fundamentals.html#a-run-computations-on-the-gpu)에서 스토리지 버퍼의 숫자를 두 배로 늘리고 이를 맵핑 가능한 버퍼에 복사하고 그 결과를 읽기 위해서 맵핑하였습니다.

다른 예시는 [컴퓨트 셰이더 기본](../webgpu-compute-shaders.md)에 있는데, 컴퓨트 셰이더의 여러 `@builtin` 값을 스토리지 버퍼에 맵핑하였습니다. 그리고 그 결과를 맵핑 가능한 버퍼에 복사하고 맵핑하여 값을 읽어옵니다.

## mappedAtCreation

`mappedAtCreation: true`은 버퍼를 생성할 때 추가할 수 있는 플래그입니다. 이 경우 버퍼는 `GPUBufferUsage.COPY_DST`와 `GPUBufferUsage.MAP_WRITE` 사용법 플래스를 명시할 필요가 없어집니다.

이는 버퍼 생성시에 데이터를 넣을 수 있도록 하는 특별한 플래그입니다. 버퍼를 생성할 때 `mappedAtCreation: true`를 추가할 수 있습니다. 버퍼가 생성되면, 이미 값을 쓸 수 있도록 맵핑 가능한 상태가 됩니다. 그 예로:

const buffer = device.createBuffer({
  size: 16,
  usage: GPUBufferUsage.UNIFORM,
  mappedAtCreation: true,
});
const arrayBuffer = buffer.getMappedRange(0, buffer.size);
const f32 = new Float32Array(arrayBuffer);
f32.set(\[1, 2, 3, 4\]);
buffer.unmap();

좀더 간결하게는,

const buffer = device.createBuffer({
  size: 16,
  usage: GPUBufferUsage.UNIFORM,
  mappedAtCreation: true,
});
new Float32Array(buffer.getMappedRange(0, buffer.size)).set(\[1, 2, 3, 4\]);
buffer.unmap();

## 맵핑가능한 버퍼의 효율적인 사용

위에서 우리는 버퍼 맵핑이 비동기적이라고 했습니다. 즉 `mapAsync`를 호출하여 버퍼를 맵핑하기를 요청하는 시점부터, 맵핑이 되어 `getMappedRange`를 호출할 수 있게되는 시점까지의 시간이 미정이라는 뜻입니다.

이를 해결하는 일반적인 방법은 몇몇 버퍼들을 항상 맵핑 상태로 두는 것입니다. 그러면 이미 맵핑이 되어 있어서 바로 사용 가능하게 됩니다. 사용한 후에 언맵핑을 하고, 어떤 커맨드든 해당 버퍼를 사용하는 커맨드를 제출하고 나면 다시 맵핑하도록 요청합니다. 프라미스가 해소되면 이를 다시 이미 맵핑된 버퍼 풀(pool)로 되돌립니다. 맵핑 가능한 버퍼가 필요한데 사용할 수 있는게 없으면 새로운 버퍼를 만들어 풀에 넣으면 됩니다.

TBD: Example

* * *

1.  `mappedAtCreation: true`로 설정할 때는 예외인데, [mappedAtCreation](#a-mapped-at-creation)를 참고하세요. [↩︎](#fnref1)
    

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU 데이터 복사하기\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "<a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a>님<br> 당신의 <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} 기여에 감사드립니다.</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');