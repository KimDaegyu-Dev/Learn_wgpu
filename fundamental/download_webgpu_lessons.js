// Node.js script to download WebGPU Fundamentals lessons
// Run: npm install axios fs-extra path
// Then: node download_webgpu_lessons.js

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const urls = [
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-fundamentals.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-inter-stage-variables.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-uniforms.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-storage-buffers.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-vertex-buffers.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-textures.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-importing-textures.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-textures-external-video.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-cube-maps.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-storage-textures.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-multisampling.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-constants.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-memory-layout.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-bind-group-layouts.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-copying-data.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-limits-and-features.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-timing.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-wgsl.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-how-it-works.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-compatibility-mode.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-translation.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-rotation.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-scale.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-math.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-orthographic-projection.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-perspective-projection.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-cameras.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-stacks.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-scene-graphs.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-directional.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-point.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-spot.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-large-triangle-to-cover-clip-space.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-environment-maps.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-skybox.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-post-processing.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-compute-shaders.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders-histogram.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders-histogram-part-2.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-resizing-the-canvas.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-multiple-canvases.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-points.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-from-webgl.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-optimization.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-debugging.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl-function-reference.html",
];

const outputDir = path.join(process.cwd(), "webgpu-lessons");

async function downloadAll() {
  await fs.ensureDir(outputDir);
  for (const url of urls) {
    try {
      const filename = path.basename(url).replace(/[^\w.-]+/g, "_");
      const filepath = path.join(outputDir, filename);
      console.log(`Downloading: ${filename}`);
      const res = await axios.get(url, { responseType: "text" });
      await fs.writeFile(filepath, res.data, "utf-8");
    } catch (err) {
      console.error(`❌ Failed to download ${url}:`, err.message);
    }
  }
  console.log("✅ All downloads complete!");
}

downloadAll();
