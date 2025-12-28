// Node.js script to download WebGPU Fundamentals lessons
// Run: npm install axios fs-extra path
// Then: node download_webgpu_lessons.js

import axios from "axios";
import fs from "fs-extra";
import path from "path";

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
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-bind-group-layouts.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-copying-data.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-limits-and-features.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-timing.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-wgsl.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-how-it-works.html",
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
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-directional-lighting.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-point-lighting.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-spot-lighting.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-large-clip-space-triangle.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-environment-maps.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-skyboxes.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-basic-crt-effect.html",
  "https://webgpufundamentals.org/webgpu/lessons/ko/webgpu-compute-shaders.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-image-histogram.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-image-histogram-part2.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-resizing-the-canvas.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-multiple-canvases.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-points.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-from-webgl.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-speed-and-optimization.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-debugging-and-errors.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl-function-reference.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl-offset-computer.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-tour-of-wgsl.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-api-reference.html",
  "https://webgpufundamentals.org/webgpu/lessons/webgpu-spec.html",
  "https://webgpufundamentals.org/webgpu/lessons/wgsl-spec.html"
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
