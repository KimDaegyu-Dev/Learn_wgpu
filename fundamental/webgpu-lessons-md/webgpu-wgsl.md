English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [목차](#toc) 

# [webgpufundamentals.org](/webgpu/lessons/ko/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WebGPU WGSL

WGSL에 대한 보다 상세한 개요는 [Tour of WGSL](https://google.github.io/tour-of-wgsl/)을 참고하세요. [실제 WGSL 명세](https://www.w3.org/TR/WGSL/)도 있는데, [언어 대법관들](http://catb.org/jargon/html/L/language-lawyer.html)이 작성한 것이라 이해기 좀 어려울 수 있습니다 😂

이 글은 여러분이 프로그래밍을 할 줄 안다고 가정합니다. 내용이 좀 간결하게 작성되어 있지만 그래도 WGSL 셰이더 프로그래밍에 약간이나마 도움을 줄 것입니다.

## WGSL은 강타입(strictly typed)

자바스크립트와는 다르게 WGSL은 모든 변수, 구조체, 필드, 함수 매개변수와 반환형의 타입을 알아야만 합니다. TypeScript, Rust, C++, C#, Java, Swift, Kotlin 등을 써보셨다면 익숙하실 겁니다.

### 기본 타입(plain types)

WGLS의 _기본_ 타입은 아래와 같습니다.

*   `i32` 32비트 부호있는 정수(signed integer)
*   `u32` 32비트 부호없는 정수(unsigned integer)
*   `f32` 32비트 부동소수점(floating point number)
*   `bool` 불리언(boolean) 값
*   `f16` 16비트 부동소수점 (이는 선택적 기능으로 요구한 경우에만 사용 가능)

### 변수의 선언

자바스크립트에서는 변수와 함수를 아래와 같이 선언합니다.

var a = 1;
let c = 3;
function d(e) { return e \* 2; }

WGSL에서는 아래와 같습니다.

var a: f32 = 1;
let c: f32 = 3;
fn d(e: f32) -> f32 { return e \* 2; }

위 예시에서 중요한 점은 `: f32`처럼 변수의 선언에 `: <type>`를 추가해야만 하고, 함수 선언시에는 `-> <type>`가 필요하다는 것입니다.

### auto 타입

WGSL에는 변수를 위한 _지름길_이 있습니다. 타입스크립트처럼 변수의 타입을 명시하지 않은 경우 자동으로 표현식(expression) 우측과 같은 타입으로 간주됩니다.

fn foo() -> bool { return false; }

var a = 1;     // a is an i32
let b = 2.0;   // b is an f32
var c = 3u;    // c is a u32
var d = foo(); // d is bool

### 타입 변환

강타입이기 때문에 타입의 변환이 필요한 경우가 있습니다.

let a = 1;     // a is an i32
let b = 2.0;   // b is a f32
\*let c = a + b; // ERROR can't add an i32 to an f32

위와 같은 오류는 한쪽을 다른 타입으로 변환하여 수정할 수 있습니다.

let a = 1;     // a is an i32
let b = 2.0;   // b is a f32
let c = f32(a) + b; // ok

하지만 WGSL은 "AbstractInt"와 "AbstractFloat"이라는 것이 존재합니다. 이들은 아직 타입이 정해지지 않은 숫자라고 보시면 됩니다. 이는 컴파일 시점에 사용 가능한 기능입니다. (_역주: 컴파일 시점에 evaluation이 되어야 한다는 의미_)

let a = 1;            // a is an i32
let b = 2.0;          // b is a f32
\*let c = a + b;       // ERROR can't add an i32 to an f32
let d = 1 + 2.0;      // d is a f32

### numeric suffixes

2i   // i32
3u   // u32
4f   // f32
4.5f // f32
5h   // f16
5.6h // f16
6    // AbstractInt
7.0  // AbstractFloat

## WGSL과 자바스크립트에서 `let` `var` `const`의 의미가 다름

자바스크립트에서 `var`은 함수 범위(scope)내의 변수를 의미합니다. `let`은 블럭 범위 내의 변수를 의미합니다. `const`는 블럿 범위의 상수 (값이 변할 수 없음)[\[1\]](#fn1)를 의미합니다.

WGSL에서 모든 변수는 블럭 범위 안에 있습니다. `var`은 저장 공간이 있는 뮤터블(mutable) 변수입니다. `let`은 상수입니다.

fn foo() {
  let a = 1;
\*  a = a + 1;  // ERROR: a is a constant expression
  var b = 2;
  b = b + 1;  // ok
}

`const`는 변수가 아니고 컴파일 시점의 상수입니다. (_역주: C++의 constexpr_) 런타임에 변할 수 있는 것에 대해 `const`를 선언할 수는 없습니다.

const one = 1;              // ok
const two = one \* 2;        // ok
const PI = radians(180.0);  // ok

fn add(a: f32, b: f32) -> f32 {
\*  const result = a + b;   // ERROR! const can only be used with compile time expressions
  return result;
}

## 벡터(vector) 타입

WGSL에는 `vec2`, `vec3`, `vec4` 세 개의 벡터 타입이 있습니다. 기본 스타일은 `vec?<type>`여서 `vec2<i32>`는 두 개의 i32를 갖는 벡터, `vec3<f32>`는 세 개의 f32를 갖는 벡터, `vec4<u32>`는 네 개의 u32를 갖는 벡터, `vec3<bool>`는 불리언 세 개를 갖는 벡터입니다.

예시는 아래와 같습니다:

let a = vec2<i32>(1, -2);
let b = vec3<f32>(3.4, 5.6, 7.8);
let c = vec4<u32>(9, 10, 11, 12);

### 접근자(accessors)

벡터 내부의 값들은 다양한 접근자로 접근이 가능합니다.

let a = vec4<f32>(1, 2, 3, 4);
let b = a.z;   // via x,y,z,w
let c = a.b;   // via r,g,b,a
let d = a\[2\];  // via array element accessors

위에서 `b`, `c`, `d`는 모두 같은 값입니다. 이 셋 모두 `a`의 세 번째 요소에 접근하는 것이어서, 값은 3입니다.

### swizzles

하나 이상의 요소에 접근할 수도 있습니다.

let a = vec4<f32>(1, 2, 3, 4);
let b = a.zx;   // via x,y,z,w
let c = a.br;   // via r,g,b,a
let d = vec2<f32>(a\[2\], a\[0\]);

위에서 `b`, `c`, `d`는 모두 같은 값입니다. 모두 `vec2<f32>(3, 1)`입니다.

요소를 반복할 수도 있습니다.

let a = vec4<f32>(1, 2, 3, 4);
let b = vec3<f32>(a.z, a.z, a.y);
let c = a.zzy;

위에서 `b`, `c`는 같은 값입니다. 요소가 3,3,2인 `vec3<f32>`입니다.

### 벡터 단축어(shortcuts)

기본 타입에 대한 단축어가 존재합니다. `<i32>`를 `i`로, `<f32>`를 `f`로, `<u32>`를 `u`로, `<f16>`를 `h`로 단축합니다.

let a = vec4<f32>(1, 2, 3, 4);
let b = vec4f(1, 2, 3, 4);

`a` and `b`는 동일한 타입입니다.

### 벡터 생성(construction)

벡터는 보자 작은 타입을 기반으로 생성될 수 있습니다.

let a = vec4f(1, 2, 3, 4);
let b = vec2f(2, 3);
let c = vec4f(1, b, 4);
let d = vec2f(1, a.yz, 4);
let e = vec2f(a.xyz, 4);
let f = vec2f(1, a.yzw);

`a`, `c`, `d`, `e`, `f`는 모두 같습니다.

### 벡터 연산

벡터에 대한 연산이 가능합니다.

let a = vec4f(1, 2, 3, 4);
let b = vec4f(5, 6, 7, 8);
let c = a + b;  // c is vec4f(6, 8, 10, 12)
let d = a \* b;  // d is vec4f(5, 12, 21, 32)
let e = a - b;  // e is vec4f(-4, -4, -4, -4)

많은 함수들이 벡터에 대해서도 동작합니다.

let a = vec4f(1, 2, 3, 4);
let b = vec4f(5, 6, 7, 8);
let c = mix(a, b, 0.5);                   // c is vec4f(3, 4, 5, 6)
let d = mix(a, b, vec4f(0, 0.5, 0.5, 1)); // d is vec4f(1, 4, 5, 8)

## 행렬

WGSL에는 다양한 행렬 타입이 있습니다. 행렬은 벡터의 배열입니다. 포맷은 `mat<numVectors>x<vectorSize><<type>>`와 같아서, 예를들면 `mat3x4<f32>`는 `vec4<f32>` 세 개로 이루어진 배열입니다. 벡터처럼 행렬도 단축어가 있습니다.

let a: mat4x4<f32> = ...
let b: mat4x4f = ...

`a`와 `b`는 같은 타입입니다.

### 행렬의 벡터 접근

행렬의 벡터를 참조하려면 배열 문법을 쓰면 됩니다.

let a = mat4x4f(...);
let b = a\[2\];   // b is a vec4f of the 3rd vector of a

3차원 계산에서 가장 흔히 사용되는 행렬 타입은 `mat4x4f`이고 `vec4f`를 곱하게 되면 `vec4f`가 도출됩니다.

let a = mat4x4f(....);
let b = vec4f(1, 2, 3, 4);
let c = a \* b;  // c is a vec4f and the result of a \* b

## 배열

WGSL의 배열은 `array<type, numElements>` 문법으로 선언합니다.

let a = array<f32, 5>;   // an array of five f32s
let b = array<vec4f, 6>; // an array of six vec4fs

다른 `array` 생성자(constructor)도 있습니다. 인자를 원하는 만큼 넣으면 배열을 반환해 줍니다. 인자는 모두 같은 타입이어야 합니다.

let arrOf3Vec3fsA = array(vec3f(1,2,3), vec3f(4,5,6), vec3f(7,8,9));
let arrOf3Vec3fsB = array<vec3f, 3>(vec3f(1,2,3), vec3f(4,5,6), vec3f(7,8,9));

위에서 `arrOf3Vec3fsA`와 `arrOf3Vec3fsB`는 같습니다.

안타깝게도, WGSL 버전 1에서는 배열의 크기를 얻는 방법은 없습니다.

### runtime sized arrays

Arrays that are at the root scope storage declarations are the only arrays that can be specified with no size

@group(0) @binding(0) var<storage> foo: array<mat4x4f>;

The number of elements in `foo` is defined by the settings of the bind group used at runtime. You can query this size in your WGSL with `arrayLength`.

@group(0) @binding(0) var<storage> foo: array<mat4x4f>;

...
  let numMatrices = arrayLength(&foo);

## 함수

WGSL의 함수는 `fn name(parameters) -> returnType { ..body... }`와 같은 패턴을 따릅니다.

fn add(a: f32, b: f32) -> f32 {
  return a + b;
}

## 진입점(entry points)

WGSL 프로그램은 진입점이 필요합니다. 진입점은 `@vertex`, `@fragment` 또는`@compute`로 지정됩니다.

@vertex fn myFunc(a: f32, b: f32) -> @builtin(position): vec4f {
  return vec4f(0, 0, 0, 0);
}

## 셰이더는 진입점이 접근하는 것들만 사용함

@group(0) @binding(0) var<uniforms> uni: vec4f;

vec4f fn foo() {
  return uni;
}

@vertex fn vs1(): @builtin(position) vec4f {
  return vec4f(0);
}

@vertex fn vs2(): @builtin(position) vec4f {
  return foo();
}

위에서 `uni`는 `vs1`에서는 접근하고 있지 않으므로 `vs1`을 파이프라인에서 사용할 때에는 바인딩이 필요하지 않습니다. `vs2`는 `foo` 호출을 통해 `uni`를 간접적으로 참조하므로 `vs2`를 파이프라인에서 사용할 때에는 `uni`의 바인딩이 필요합니다.

## 어트리뷰트(attributes)

WebGPU에서 _어트리뷰트_는 두 가지 의미를 가집니다. 하나는 _정점 어트리뷰트_로 [정점 버퍼에 관한 글](webgpu-vertex-buffers.html)에서 설명한 것과 같습니다. 다른 하나는 WGSL에서 `@`로 시작하는 어트리뷰트입니다.

### `@location(number)`

`@location(number)`는 셰이더의 입력과 출력을 정의할 떄 사용됩니다.

#### 정점 셰이더 입력

정점 셰이더에서, 입력값은 정점 셰이더의 진입점 함수의 `@location` 어트리뷰트를 통해 정의됩니다.

@vertex vs1(@location(0) foo: f32, @location(1) bar: vec4f) ...

struct Stuff {
  @location(0) foo: f32,
  @location(1) bar: vec4f,
};
@vertex vs2(s: Stuff) ...

`vs1`와 `vs2` 모두 정점 셰이더의 입력값을 location 0과 1을 통해 선언하고 있으며 이 값들은 [정점 버퍼](webgpu-vertex-buffers.html)를 통해 전달되어야 합니다.

#### 스테이지간 변수

스테이지간 변수에서 `@location` 어트리뷰트는 셰이더간 전달되는 변수의 location을 명시합니다.

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) color: vec4f,
  @location(1) texcoords: vec2f,
};

struct FSIn {
  @location(1) uv: vec2f,
  @location(0) diffuse: vec4f,
};

@vertex fn foo(...) -> VSOut { ... }
@fragment fn bar(moo: FSIn) ... 

위에서 정점 셰이더 `foo`는 `vec4f`인 `color`를 `location(0)`에, `vec2f`인 `texcoords`를 `location(1)`에 전달하고 있습니다. 프래그먼트 셰이더 `bar`는 이 값들을 location이 일치하는 `uv`와 `diffuse`로 받고 있습니다.

#### 프래그먼트 셰이더 출력값

프래그먼트 셰이더의 `@location`은 어떤 `GPURenderPassDescriptor.colorAttachment`에 출력값을 저장할지를 명시합니다.

struct FSOut {
  @location(0) albedo: vec4f;
  @location(1) normal: vec4f;
}
@fragment fn bar(...) -> FSOut { ... }

### `@builtin(name)`

`@builtin` 어트리뷰트는 특정 변수의 값이 WebGPU의 내장(built-in) 기능에 의해 전달된다는 의미입니다.

@vertex fn vs1(@builtin(vertex\_index) foo: u32, @builtin(instance\_index) bar: u32) ... {
  ...
}

위에서 `foo`는 내장된 `vertex_index`로부터, `bar`는 내장된 `instance_index`로부터 값을 얻어옵니다.

struct Foo {
  @builtin(vertex\_index) vNdx: u32,
  @builtin(instance\_index) iNdx: u32,
}
@vertex fn vs1(blap: Foo) ... {
  ...
}

위에서 `blap.vNdx`는 내장된 `vertex_index`로부터, `blap.iNdx`는 내장된 `instance_index`로부터 값을 얻어옵니다.

Builtin Name

Stage

IO

Type

Description

vertex\_index

vertex

input

u32

현재 API 수준의 드로우 커맨드에서의 현재 정점의 인덱스로, 드로우 인스턴싱에 독립적인 값

인덱스를 사용하지 않는 드로우에서는 첫 번째 정점의 인덱스는 드로우 함수의 `firstVertex` 인자와 같으며 이는 직접 또는 간접적으로 명시됨. 인덱스는 드로우 인스턴스의 각 추가 정점마다 1씩 증가함.

인덱스를 사용하는 드로우에서는 정점에 대한 인덱스 버퍼의 입력에 드로우 함수의 `baseVertex` 인자를 더한 값으로, 이 값은 직접 또는 간접적으로 명시됨.

instance\_index

vertex

input

u32

현재 API 수준 드로우 커맨드의 현재 정점의 인스턴스 인덱스.

첫 인스턴스늬 인덱스는 드로우 함수의 `firstInstance`인자와 같은 값으로, 이 값는 직접 또는 간접적으로 명시됨. 인덱스는 드로우에서의 추가 인스턴스마다 1씩 증가함.

position

vertex

output

vec4<f32>

동차(homogeneous) 좌표로 표현된 현재 정점의 출력 위치. 동차 정규화 (_w_ 값으로 _x_, _y_, _z_ 값을 나누는 것) 이후에는 WebGPU의 정규화된 장치 좌표계(NDC) 값이 됨. [WebGPU § 3.3 Coordinate Systems](https://www.w3.org/TR/webgpu/#coordinate-systems) 참고.

fragment

input

vec4<f32>

현재 프래그먼트의 [framebuffer](https://gpuweb.github.io/gpuweb/#framebuffer)공간에서의 위치. (_x_, _y_, _z_ 요소는 _w_가 1이 되도록 조정된 상태) [WebGPU § 3.3 Coordinate Systems](https://www.w3.org/TR/webgpu/#coordinate-systems) 참고.

front\_facing

fragment

input

bool

현재 프래그먼트가 [front-facing](https://gpuweb.github.io/gpuweb/#front-facing)인 프리미티브(primitive)의 일부일 경우 참, 아니라면 거짓.

frag\_depth

fragment

output

f32

뷰포트의 깊이 범위로 변환된 프래그먼트의 깊이값. [WebGPU § 3.3 Coordinate Systems](https://www.w3.org/TR/webgpu/#coordinate-systems) 참고.

local\_invocation\_id

compute

input

vec3<u32>

현재 호출(invocation)에 대한 [local invocation ID](#local-invocation-id), 즉[workgroup grid](#workgroup-grid)에서의 위치.

local\_invocation\_index

compute

input

u32

현재 호출에 대한 [local invocation index](#local-invocation-index), [workgroup grid](#workgroup-grid)에서의 호출 위치를 선형화한 인덱스.

global\_invocation\_id

compute

input

vec3<u32>

현재 호출에 대한 [global invocation ID](#global-invocation-id), 즉, [compute shader grid](#compute-shader-grid)에서의 위치.

workgroup\_id

compute

input

vec3<u32>

현재 호출에 대한 [workgroup ID](#workgroup-id), 즉, [workgroup grid](#workgroup-grid)에서 워크그룹(workgroup)의 위치.

num\_workgroups

compute

input

vec3<u32>

API에 의해[dispatched](https://www.w3.org/TR/webgpu/#compute-pass-encoder-dispatch) 된 컴퓨트 셰이더의 [dispatch size](#dispatch-size), `vec<u32>(group_count_x, group_count_y, group_count_z)`.

sample\_index

fragment

input

u32

현재 프래그먼트의 샘플 인덱스 이 값은 최소 0이고 최대 `sampleCount`\-1. `sampleCount`는 GPU 렌더링 파이프라인에 명시된 MSAA 샘플의 `[개수](https://www.w3.org/TR/webgpu/#dom-gpumultisamplestate-count)   [WebGPU § 10.3 GPURenderPipeline](https://www.w3.org/TR/webgpu/#gpurenderpipeline) 참고.`

sample\_mask

fragment

input

u32

현재 프래그먼트의 샘플 커버리지(coverage) 마스크. 프리미티브가 렌더링될 때 어떤 샘플들에 의해 이 프래그먼트가 그려지는지에 대한 비트 마스크를 포함함.  
[WebGPU § 23.3.11 Sample Masking](https://www.w3.org/TR/webgpu/#sample-masking) 참고.

fragment

output

u32

현재 프래그먼트의 샘플 커버리지 마스크 컨트롤. 이 변수에 쓰여지는 마지막 값이 [shader-output mask](https://gpuweb.github.io/gpuweb/#shader-output-mask)가 됨. 쓰여진 값 중 0 비트인 것은 해당하는 샘플이 컬러 어태치먼트에서 버려짐.  
[WebGPU § 23.3.11 Sample Masking](https://www.w3.org/TR/webgpu/#sample-masking) 참고.

## 흐름 제어(flow control)

### for

  for (var i = 0; i < 10; i++) { ... }

### if

    if (i < 5) {
      ...
    } else if (i > 7) {
      ..
    } else {
      ...
    }

### while

  var j = 0;
  while (j < 5) {
    ...
    j++;
  }

### loop

  var k = 0;
  loop {
    k++;
    if (k >= 5) {
      break;
    }
  }

### break

  var k = 0;
  loop {
    k++;
    if (k >= 5) {
      break;
    }
  }

### break if

  var k = 0;
  loop {
    k++;
    break if (k >= 5);
  }

### continue

  for (var i = 0; i < 10; ++i) {
    if (i % 2 == 1) {
      continue;
    }
    ...
  }

### continuing

  for (var i = 0; i < 10; ++i) {
    if (i % 2 == 1) {
      continue;
    }
    ...

    continuing {
      // continue goes here
      ...
    }
  }

### discard

   if (v < 0.5) {
     discard;
   }

`discard`는 셰이더를 종료합니다. 프래그먼트 셰이더에서만 사용할 수 있습니다.

### switch

var a : i32;
let x : i32 = generateValue();
switch x {
  case 0: {      // The colon is optional
    a = 1;
  }
  default {      // The default need not appear last
    a = 2;
  }
  case 1, 2, {   // Multiple selector values can be used
    a = 3;
  }
  case 3, {      // The trailing comma is optional
    a = 4;
  }
  case 4 {
    a = 5;
  }
}

`switch`는 `u32` 또는 `i32`에 대해서만 사용 가능하고 case들은 상수여야 합니다.

## Operators

Name

Operators

Associativity

Binding

Parenthesized

`(...)`

Primary

`a()`, `a[]`, `a.b`

Left-to-right

Unary

`-a`, `!a`, `~a`, `*a`, `&a`

Right-to-left

All above

Multiplicative

`a * b`, `a / b`, `a % b`

Left-to-right

All above

Additive

`a + b`, `a - b`

Left-to-right

All above

Shift

`a << b`, `a >> b`

Requires parentheses

Unary

Relational

`a < b`, `a > b`, `a <= b`, `a >= b`, `a == b`, `a != b`

Requires parentheses

All above

Binary AND

`a & b`

Left-to-right

Unary

Binary XOR

`a ^ b`

Left-to-right

Unary

Binary OR

`a | b`

Left-to-right

Unary

Short-circuit AND

`a && b`

Left-to-right

Relational

Short-circuit OR

`a || b`

Left-to-right

Relational

## 내장 함수

[WGSL Function reference](webgpu-wgsl-function-reference.html)를 참고하세요.

## 다른 언어와의 차이점

### `if`, `while`, `switch`, `break-if` 표현식에 괄호가 필요하지 않습니다.

if a < 5 {
  doTheThing();
}

### 삼항 연산자(ternary operator)가 없습니다.

많은 언어들에 삼항 연산자 `condition ? trueExpression : falseExpression`가 있습니다. WGSL에는 없습니다. 대신 `select`가 있습니다.

  let a = select(falseExpression, trueExpression, condition);

### `++`와 `--`는 표현식이 아닌 명령문입니다.

많은 언어들에 \*전위 증가(pre-increment)\*와 \*후위 증가(post-increment)\*가 있습니다.

// JavaScript
let a = 5;
let b = a++;  // b = 5, a = 6  (post-increment)
let c = ++a;  // c = 7, a = 7  (pre-increment)

WGSL에는 둘 다 없습니다. 단지 증가와 감소 명령문만이 존재합니다.

// WGSL
var a = 5;
a++;          // is now 6
\*++a;          // ERROR: no such thing has pre-increment
\*let b = a++;  // ERROR: a++ is not an expression, it's a statement

## `+=`, `-=`는 표현식이 아닌 대입 연산자입니다.

// JavaScript
let a = 5;
a += 2;          // a = 7
let b = a += 2;  // a = 9, b = 9

// WGSL
let a = 5;
a += 2;           // a is 7
\*let b = a += 2;  // ERROR: a += 2 is not an expression

## Swizzles은 왼쪽에 올 수 없습니다.

몇몇 언어들에서는 가능하지만 WGSL에서는 안됩니다.

var color = vec4f(0.25, 0.5, 0.75, 1);
\*color.rgb = color.bgr; // ERROR
color = vec4(color.bgr, color.a);  // Ok

## `_`로의 가짜 할당(Phony assignment)

`_`는 어떤 것이 사용되는 것처럼 보이지만 실제로는 그렇지 않은 경우에 대해, 대입을 위해 사용할 수 있는 특수한 변수입니다.

@group(0) @binding(0) var<uniforms> uni1: vec4f;
@group(0) @binding(0) var<uniforms> uni2: mat4x4f;

@vertex fn vs1(): @builtin(position) vec4f {
  return vec4f(0);
}

@vertex fn vs2(): @builtin(position) vec4f {
  \_ = uni1;
  \_ = uni2;
  return vec4f(0);
}

위에서 `uni1`이나 `uni2` 모두 `vs1`에서 접근되지 않기 때문에 파이프라인에서 `vs1`을 사용할 경우 필요한 바인딩으로 판별되지 않습니다. `uni1`과 `uni2` 모두 `vs2`에서는 참조하므로 파이프라인에서 `vs2`를 사용할 때에는 필요한 바인딩으로 판별합니다.

[Copyright](https://www.w3.org/Consortium/Legal/ipr-notice#Copyright) © 2023 [World Wide Web Consortium](https://www.w3.org/). W3C® [liability](https://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer), [trademark](https://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks) and [permissive document license](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document) rules apply.

* * *

1.  자바스크립트의 변수는 `undefined`, `null`, `boolean`, `number`, `string`, `reference-to-object`의 기본 타입을 갖습니다. 프로그래밍을 처음 하시는 분은 `o`가 상수로 선언되었는데 `const o = {name: 'foo'}; o.name = 'bar';`가 동작한다는 사실 때문에 헷갈리실 수 있습니다. `o`는 상수가 맞습니다. 이는 객체에 대한 상수 참조입니다. `o`가 참조하는 객체를 바꿀 수는 없지만 객체 자체를 바꿀수는 있습니다. [↩︎](#fnref1)
    

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

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WebGPU WGSL\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "<a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a>님<br> 당신의 <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} 기여에 감사드립니다.</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');