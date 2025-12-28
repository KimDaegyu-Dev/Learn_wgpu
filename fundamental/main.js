// --- 3D 수학 헬퍼 함수 및 큐브 데이터 (소스에 포함되지 않았으므로 가정) ---
// 실제 프로젝트에서는 gl-matrix 또는 유사한 라이브러리를 사용하거나, 
// 소스에 언급된 Matrix Math 원리 [17]를 기반으로 구현해야 합니다.
// 큐브 정점 데이터 및 행렬 함수는 'NON-SOURCE IMPLEMENTATION'으로 간주합니다.
// --------------------------------------------------------------------------
const { mat4 } = glMatrix;

// 큐브 정점 데이터 생성 함수
function createCubeVertices() {
  // 큐브의 각 면에 대한 정점 데이터 (position + normal)
  const positions = [
    // 앞면
    -1, -1,  1,   0, 0, 1,
     1, -1,  1,   0, 0, 1,
     1,  1,  1,   0, 0, 1,
    -1,  1,  1,   0, 0, 1,
    // 뒷면
    -1, -1, -1,   0, 0, -1,
    -1,  1, -1,   0, 0, -1,
     1,  1, -1,   0, 0, -1,
     1, -1, -1,   0, 0, -1,
    // 윗면
    -1,  1, -1,   0, 1, 0,
    -1,  1,  1,   0, 1, 0,
     1,  1,  1,   0, 1, 0,
     1,  1, -1,   0, 1, 0,
    // 아랫면
    -1, -1, -1,   0, -1, 0,
     1, -1, -1,   0, -1, 0,
     1, -1,  1,   0, -1, 0,
    -1, -1,  1,   0, -1, 0,
    // 왼쪽면
    -1, -1, -1,   -1, 0, 0,
    -1, -1,  1,   -1, 0, 0,
    -1,  1,  1,   -1, 0, 0,
    -1,  1, -1,   -1, 0, 0,
    // 오른쪽면
     1, -1, -1,   1, 0, 0,
     1,  1, -1,   1, 0, 0,
     1,  1,  1,   1, 0, 0,
     1, -1,  1,   1, 0, 0,
  ];

  const indices = [
    0, 1, 2, 0, 2, 3,       // 앞면
    4, 5, 6, 4, 6, 7,       // 뒷면
    8, 9, 10, 8, 10, 11,    // 윗면
    12, 13, 14, 12, 14, 15, // 아랫면
    16, 17, 18, 16, 18, 19, // 왼쪽면
    20, 21, 22, 20, 22, 23  // 오른쪽면
  ];

  const vertices = new Float32Array(positions);
  const indicesArray = new Uint16Array(indices);

  return {
    vertices,
    indices: indicesArray,
    vertexStride: 6 * 4, // 6 floats * 4 bytes
    numVertices: positions.length / 6,
    numIndices: indices.length
  };
}

async function main() {
    if (!navigator.gpu) {
        alert('WebGPU를 지원하는 브라우저가 필요합니다.');
        return;
    }

    // 1. WebGPU 디바이스 초기화 [18]
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    if (!device) {
        console.error('WebGPU 디바이스를 얻을 수 없습니다.');
        return;
    }

    const canvas = document.querySelector('#webgpu-canvas');
    const context = canvas.getContext('webgpu');
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format: presentationFormat,
        // alphaMode: 'premultiplied', (투명도 사용 시) [19]
    });

    // 2. 셰이더 모듈 생성 [20]
    const shaderCode = `
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
`;
    const shaderModule = device.createShaderModule({
        label: 'Cube Directional Lighting Shaders',
        code: shaderCode,
    });

    // 3. 큐브 정점/인덱스 데이터 준비 (NON-SOURCE: 큐브 데이터를 생성하는 함수가 필요함) [4]
    const { vertices, indices, vertexStride, numVertices, numIndices } = createCubeVertices(); 
    
    // 3.1 정점 버퍼 생성 및 데이터 복사 [21, 22]
    const vertexBuffer = device.createBuffer({
        label: 'Cube Vertex Buffer (Position/Normal)',
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertices);

    // 3.2 인덱스 버퍼 생성 및 데이터 복사 [21]
    const indexBuffer = device.createBuffer({
        label: 'Cube Index Buffer',
        size: indices.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(indexBuffer, 0, indices);

    // 4. Uniform Buffer 설정 [23]
    const kMat4Size = 16 * 4; // mat4x4f (16 floats * 4 bytes)
    const kVec3Size = 3 * 4;  // vec3f (3 floats * 4 bytes)
    const kVec4Size = 4 * 4;  // vec4f (4 floats * 4 bytes)
    
    // 메모리 레이아웃을 WGSL 구조체와 일치하도록 주의하여 계산 (패딩 고려 필요) [8, 9]
    const uniformBufferSize = 
        kMat4Size +  // worldViewProjection (mat4x4f)
        kMat4Size +  // normalMatrix (mat4x4f)
        (kVec3Size + 4) + // lightDirection (vec3f + 4 bytes padding)
        kVec4Size;   // color (vec4f)
    
    const uniformBuffer = device.createBuffer({
        label: 'Uniform Buffer (Matrices & Light)',
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // CPU 측에서 Uniform 데이터에 접근하기 위한 TypedArray 설정 [24]
    const uniformValues = new Float32Array(uniformBuffer.size / 4);
    let offset = 0;
    const wvpMatrix = uniformValues.subarray(offset, offset += 16); // mat4x4f (16 floats)
    const normalMatrix = uniformValues.subarray(offset, offset += 16); // mat4x4f (16 floats)
    // lightDirection은 vec3f(3 floats)이지만 4 float 경계로 정렬됨 [9]
    const lightDirection = uniformValues.subarray(offset, offset += 3); 
    offset += 1; // vec3f 뒤에 4바이트(1 float) 패딩 [9]
    const color = uniformValues.subarray(offset, offset += 4); // vec4f (4 floats)

    // 초기 값 설정
    color.set([0.8, 0.5, 0.1, 1.0]); // 주황색 계열
    lightDirection.set([0.5, -1.0, -0.5]); // 오른쪽 위, 약간 앞에서 오는 빛

    // 5. 바인드 그룹 레이아웃 및 바인드 그룹 생성
    // layout: 'auto'를 사용하여 WebGPU가 셰이더로부터 레이아웃을 유추하도록 함 [25]
    // 렌더 파이프라인 생성 시 파이프라인 레이아웃을 얻은 후 바인드 그룹 생성

    // 6. 렌더 파이프라인 생성 (깊이 테스트 포함) [26-28]
    const pipeline = device.createRenderPipeline({
        label: '3D Cube Lighting Pipeline',
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
            buffers: [{
                arrayStride: 6 * 4, // vec3f (pos) + vec3f (normal) = 6 floats * 4 bytes [11]
                attributes: [
                    { shaderLocation: 0, offset: 0, format: 'float32x3' }, // position @location(0) [11]
                    { shaderLocation: 1, offset: 12, format: 'float32x3' }, // normal @location(1) (12 bytes offset) [11]
                ],
            }],
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [{ format: presentationFormat }],
        },
        primitive: {
            topology: 'triangle-list', // 삼각형 목록 [29]
            cullMode: 'back',          // 뒷면 컬링 활성화 [30]
        },
        depthStencil: {
            depthWriteEnabled: true,   // 깊이 값 기록 [28]
            depthCompare: 'less',      // 더 가까운 객체를 그림 [28]
            format: 'depth24plus',     // 깊이 텍스처 포맷 [28]
        },
    });

    // 파이프라인 생성 후 바인드 그룹 생성 [31]
    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
        ],
    });

    // 깊이 텍스처 및 뷰 생성 (매 프레임마다 캔버스 크기에 맞게 업데이트 필요)
    let depthTexture, depthTextureView;
    function ensureDepthTexture() {
        const width = canvas.width;
        const height = canvas.height;
        
        if (depthTexture && depthTexture.width === width && depthTexture.height === height) {
            return;
        }

        if (depthTexture) {
            depthTexture.destroy();
        }

        depthTexture = device.createTexture({
            size: [width, height, 1],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        depthTextureView = depthTexture.createView();
    }


    // 7. 렌더링 루프 (Render Loop) [32, 33]
    const settings = { rotationY: 0.0, rotationX: 0.0, lightX: 0.5 }; // 애니메이션 설정을 위한 변수 (NON-SOURCE)
    const fieldOfView = Math.PI / 4; // 45도 FOV

    function resizeCanvasToDisplaySize(canvas) {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
        if (needResize) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
        return needResize;
    }

    function render(now) {
        // 캔버스 크기 조정 및 깊이 텍스처 확인 (실제 구현 필요)
        resizeCanvasToDisplaySize(canvas); // (NON-SOURCE 함수)
        ensureDepthTexture();

        const aspect = canvas.clientWidth / canvas.clientHeight;

        // 7.1 행렬 업데이트 및 계산 (NON-SOURCE: mat4 함수 사용)
        const projectionMatrix = mat4.perspective(mat4.create(), fieldOfView, aspect, 1, 2000); // 원근 투영 [3]

        const eye = [0, 0, -500];
        const target = [0, 0, 0];
        const up = [0, 1, 0];
        // 뷰 행렬: 카메라 위치와 시점을 기준으로 세계를 변환 [35, 36]
        const viewMatrix = mat4.lookAt(mat4.create(), eye, target, up); 
        
        // 월드 행렬: 큐브의 위치, 회전, 크기 정의
        const worldMatrix = mat4.identity(mat4.create());
        mat4.scale(worldMatrix, worldMatrix, [100, 100, 100]);
        mat4.rotateY(worldMatrix, worldMatrix, settings.rotationY);
        mat4.rotateX(worldMatrix, worldMatrix, settings.rotationX); 
        
        // WVP = Projection * View * World [37, 38]
        const viewProjectionMatrix = mat4.multiply(mat4.create(), projectionMatrix, viewMatrix);
        mat4.multiply(wvpMatrix, viewProjectionMatrix, worldMatrix);

        // 법선 행렬: World 행렬의 역행렬 전치 (normalMatrix = transpose(inverse(world))) [6]
        // 정규화되지 않은 스케일이 없다면 worldMatrix를 그대로 사용할 수도 있으나, 정확도를 위해 이 방법을 사용 [6]
        const inverseWorld = mat4.invert(mat4.create(), worldMatrix);
        mat4.transpose(normalMatrix, inverseWorld); // (NON-SOURCE)

        // 빛 방향 업데이트 (애니메이션이 없는 경우)
        lightDirection.set([settings.lightX, -1.0, -0.5]);
        
        // 7.2 Uniform Buffer에 데이터 복사 [39]
        device.queue.writeBuffer(uniformBuffer, 0, uniformValues.buffer);

        // 7.3 커맨드 인코딩 [33]
        const encoder = device.createCommandEncoder({ label: 'Render Encoder' });
        
        const renderPassDescriptor = {
            label: '3D Render Pass',
            colorAttachments: [
                {
                    view: context.getCurrentTexture().createView(),
                    clearValue: [0.3, 0.3, 0.3, 1.0], // 배경 색상 [32]
                    loadOp: 'clear', // 그리기 전에 지우기 [32]
                    storeOp: 'store', // 결과 저장 [32]
                },
            ],
            depthStencilAttachment: { // 깊이 텍스처 연결 [27]
                view: depthTextureView,
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        };

        const pass = encoder.beginRenderPass(renderPassDescriptor);
        
        // 7.4 파이프라인 및 버퍼 설정 [40]
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.setVertexBuffer(0, vertexBuffer); 
        pass.setIndexBuffer(indexBuffer, 'uint16'); // 인덱스 버퍼 타입은 데이터에 따라 다름 (예: 'uint16', 'uint32')

        // 7.5 드로우 콜 실행
        pass.drawIndexed(numIndices); // 인덱스 버퍼를 사용하여 그리기 [40]
        
        pass.end();
        device.queue.submit([encoder.finish()]); // 커맨드 버퍼 제출 [40]

        // 애니메이션 업데이트 (NON-SOURCE)
        settings.rotationY += 0.01;
        settings.rotationX += 0.005;

        requestAnimationFrame(render);
    }
    
    // 렌더링 시작
    requestAnimationFrame(render);
}

// 실패 시 로그 (NON-SOURCE: 에러 처리는 pushErrorScope/popErrorScope를 사용해야 함) [41, 42]
function fail(msg) {
    document.body.appendChild(document.createElement('pre')).textContent = msg;
}

main();