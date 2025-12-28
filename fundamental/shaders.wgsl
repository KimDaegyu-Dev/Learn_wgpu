/* WGSL Code */
// Uniforms: GPU에 전달되는 전역 설정값 (행렬 및 조명 정보)
struct Uniforms {
    worldViewProjection: mat4x4f, // 위치 변환을 위한 WVP 행렬 [5]
    normalMatrix: mat4x4f,        // 법선 변환을 위한 행렬 [5, 6]
    lightDirection: vec3f,        // 빛의 방향 (정규화된 벡터) [7]
    color: vec4f,                 // 객체의 기본 색상
    // 메모리 레이아웃 규칙을 준수해야 함 [8, 9]
};
@group(0) @binding(0) var<uniform> uni: Uniforms; // Uniform Buffer 바인딩 [10]

// 정점 셰이더 입력 구조체: 정점 버퍼로부터 데이터를 받음
struct Vertex {
    @location(0) position: vec4f, // 정점 위치 [11]
    @location(1) normal: vec3f,   // 정점 법선 [5]
};

// 스테이지 간 변수: 정점 셰이더 출력 및 프래그먼트 셰이더 입력 [12]
struct VSOutput {
    @builtin(position) position: vec4f, // 클립 공간 위치 [13, 14]
    @location(0) normal: vec3f,         // 변환된 법선 (보간됨) [5]
};

// ===================================
// 정점 셰이더 (Vertex Shader)
// ===================================
@vertex
fn vs_main(vert: Vertex) -> VSOutput {
    var vsOut: VSOutput;
    
    // 위치 변환: World, View, Projection 행렬을 모두 적용 [5]
    vsOut.position = uni.worldViewProjection * vert.position; 
    
    // 법선 변환: normalMatrix를 사용하여 법선 방향을 변환 [5]
    // 참고: 행렬을 vec4f에 곱할 때, 법선은 변환(translation)에 영향을 받지 않도록
    // vec4f(vert.normal, 0)을 사용해야 하지만, uni.normalMatrix가 mat3x3f로 선언될 경우
    // mat4x4f 사용 시 w=0으로 설정하거나 mat3x3f를 사용하도록 조정해야 함.
    vsOut.normal = (uni.normalMatrix * vec4f(vert.normal, 0)).xyz; // [5]
    
    return vsOut;
}

// ===================================
// 프래그먼트 셰이더 (Fragment Shader)
// ===================================
@fragment
fn fs_main(vsOut: VSOutput) -> @location(0) vec4f {
    // 1. 법선 정규화: 스테이지간 변수는 보간되어 단위 벡터가 아닐 수 있으므로 다시 정규화 [7]
    let normal = normalize(vsOut.normal);

    // 2. 방향성 조명 계산: 법선과 빛의 역방향 벡터의 내적 (Dot Product) [15]
    let light = dot(normal, -uni.lightDirection); // light는 -1.0 ~ 1.0 범위의 값이 됨 [15]
    
    // 3. 음수 값을 방지 (표면이 빛을 등지고 있을 경우 0으로 클램프)
    let clamped_light = max(0.0, light); // [16]

    // 4. 조명 적용 (색상 부분만 곱함) [7]
    let color = uni.color.rgb * clamped_light;

    return vec4f(color, uni.color.a); // @location(0)에 색상 출력 [13]
}