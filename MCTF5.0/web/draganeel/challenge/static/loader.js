// loader.js — atmosphere + WGSL hash + WAT VM + WS curse + burning reveal
//
// Player flow:
//   - press Enter to open the tome
//   - press wasd; each key:
//       (a) appended to inputs[]
//       (b) pushed into the WAT VM input ring buffer
//       (c) drives a single VM step (read → seal → xor → add)
//       (d) re-hashes via WGSL → soul state
//       (e) emits a scale-request frame to the server (oracle responds with
//           an encrypted "shed scale" byte; players capture these and
//           recover GATE_VALUE off-line via the cipher)
//   - press Tab → death request: client sends inputs + curse token from r12
//                 server verifies BOTH the WGSL gate AND the curse token
//                 only then is the flag emitted
//
// JS does NOT compute the curse token; the WAT VM does. JS is just a
// dispatcher. Players who try to skip the VM lose. Players who reverse
// the VM and the cipher embedded in opcode 0x07 win.

const log = document.getElementById('log');
const stage = document.getElementById('stage');
const burn  = document.getElementById('burn');
const ctx2d = stage.getContext('2d');

function say(s) {
  log.textContent += s + '\n';
  log.scrollTop = log.scrollHeight;
}

let device, hashPipeline, soulBuf;
let ws;
let inputs = [];        // u32 sequence (wasd encoded 0..3)
let soul = new Uint32Array(8);
let wasm, wasmExports, wasmMem32, wasmMem8;
let pc = 0;
let opened = false;

const KEYMAP = { 'w': 0, 'a': 1, 's': 2, 'd': 3 };

// ─── eel animation state ──────────────────────────────────────
let eelTime = 0;
const segments = 28;
let eelHeat = 0;          // pulses on each keystroke

// ─── WebGPU init ──────────────────────────────────────────────
async function initGPU() {
  if (!navigator.gpu) { say('the demon refuses no-gpu eyes.'); return false; }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return false;
  device = await adapter.requestDevice();
  const wgsl = await (await fetch('liber.wgsl')).text();
  const module = device.createShaderModule({ code: wgsl });
  hashPipeline = device.createComputePipeline({
    layout: 'auto', compute: { module, entryPoint: 'death_predation' },
  });
  soulBuf = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
  });
  device.queue.writeBuffer(soulBuf, 0, new Uint32Array(8));
  return true;
}

async function dispatchHash() {
  const data = new Uint32Array(inputs);
  const inputBuf = device.createBuffer({
    size: Math.max(16, data.byteLength),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(inputBuf, 0, data);
  device.queue.writeBuffer(soulBuf,  0, new Uint32Array(8));
  const bg = device.createBindGroup({
    layout: hashPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: inputBuf } },
      { binding: 1, resource: { buffer: soulBuf  } },
    ],
  });
  const enc = device.createCommandEncoder();
  const pass = enc.beginComputePass();
  pass.setPipeline(hashPipeline);
  pass.setBindGroup(0, bg);
  pass.dispatchWorkgroups(1);
  pass.end();
  const rb = device.createBuffer({
    size: 32, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
  enc.copyBufferToBuffer(soulBuf, 0, rb, 0, 32);
  device.queue.submit([enc.finish()]);
  await rb.mapAsync(GPUMapMode.READ);
  soul = new Uint32Array(rb.getMappedRange().slice(0));
  rb.unmap();
  inputBuf.destroy();
  rb.destroy();
}

// ─── WAT VM init ──────────────────────────────────────────────
async function initWASM() {
  const wasmBytes = await (await fetch('liber.wasm')).arrayBuffer();
  const xored = new Uint8Array(await (await fetch('memories.bin')).arrayBuffer());

  wasm = await WebAssembly.instantiate(wasmBytes, { env: {} });
  wasmExports = wasm.instance.exports;
  wasmMem8  = new Uint8Array(wasmExports.memory.buffer);
  wasmMem32 = new Uint32Array(wasmExports.memory.buffer);

  const KEY = 0xA6;     // production: derive from GPUAdapter info
  const base = wasmExports.bytecode_base();
  for (let i = 0; i < xored.length; i++) wasmMem8[base + i] = xored[i] ^ KEY;
  pc = base;
}

// Run VM steps until it blocks waiting for input (returns -2) or halts.
function vmRun() {
  for (let i = 0; i < 64; i++) {
    const next = wasmExports.step(pc);
    if (next === -1) { pc = wasmExports.bytecode_base(); break; }   // halt → reset
    if (next === -2) break;                                          // blocked
    pc = next;
  }
}

// ─── WebSocket curse ──────────────────────────────────────────
function connectWS() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${proto}//${location.host}/ws`);
  ws.binaryType = 'arraybuffer';
  ws.onopen  = () => say('whisper:  ...the curse hears you.');
  ws.onclose = () => say('whisper:  ...severed.');
  ws.onerror = () => say('whisper:  ...the curse rebounds.');
  ws.onmessage = (ev) => {
    const v = new Uint8Array(ev.data);
    if (v[0] === 4) {
      const len = v[1];
      const flag = new TextDecoder().decode(v.subarray(2, 2 + len));
      trueDeath(flag);
    } else if (v[0] === 5) {
      say('whisper:  ...not yet.');
    }
  };
}

function sendScaleRequest(soul7) {
  if (!ws || ws.readyState !== 1) return;
  const b = new Uint8Array(5);
  b[0] = 2;
  new DataView(b.buffer).setUint32(1, soul7 >>> 0, true);
  ws.send(b);
}

function sendDeathRequest() {
  if (!ws || ws.readyState !== 1) return;
  const len = inputs.length;
  const token = wasmExports.read_reg(12) >>> 0;        // r12 = curse token
  const b = new Uint8Array(3 + len + 4);
  b[0] = 3;
  b[1] = len & 0xFF;
  b[2] = (len >> 8) & 0xFF;
  for (let i = 0; i < len; i++) b[3 + i] = inputs[i] & 0xFF;
  new DataView(b.buffer).setUint32(3 + len, token, true);
  ws.send(b);
  say(`request:  ${len} keys + curse 0x${token.toString(16).padStart(8,'0')}`);
}

// ─── eel animation ────────────────────────────────────────────
function drawEel(ts) {
  eelTime = ts * 0.001;
  if (eelHeat > 0) eelHeat *= 0.93;

  // background fade (ghosting toward true black)
  ctx2d.fillStyle = 'rgba(0,0,0,0.32)';
  ctx2d.fillRect(0, 0, stage.width, stage.height);

  // pale void scanlines (cold, bone-coloured)
  for (let y = 0; y < stage.height; y += 28) {
    const o = (eelTime * 18 + y * 0.5) % 28;
    ctx2d.fillStyle = `rgba(216,212,207,${0.025 + Math.random() * 0.02})`;
    ctx2d.fillRect(0, y - o, stage.width, 1);
  }

  // the eel: bone-pale serpent, blood-red bleed at the heat front
  const cx = stage.width / 2;
  const cy = stage.height / 2;
  const v = soul[7] >>> 0;
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const phase = eelTime * 1.4 + i * 0.45;
    const x = cx + Math.cos(phase) * 110 * (0.4 + t * 0.6);
    const y = cy + Math.sin(phase * 0.8 + i * 0.3) * 70 * (0.3 + t);
    const r = 8 + (1 - t) * 6 + eelHeat * 4;
    const heat = Math.min(1, eelHeat + t * 0.25);
    // bone base, blood undertone on heat, slight per-segment soul bias
    const lum = 130 + heat * 80 + ((v >> (i * 3 % 24)) & 7) * 3;
    const red = lum + heat * 50;
    const grn = lum * 0.85;
    const blu = lum * 0.78;
    ctx2d.fillStyle = `rgba(${red|0},${grn|0},${blu|0},${0.78 - t * 0.42})`;
    ctx2d.beginPath(); ctx2d.arc(x, y, r, 0, Math.PI * 2); ctx2d.fill();
  }

  // sigil glow centre (cold, faint blood)
  const grad = ctx2d.createRadialGradient(cx, cy, 0, cx, cy, 70);
  grad.addColorStop(0, `rgba(154,51,24,${0.08 + eelHeat * 0.3})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx2d.fillStyle = grad;
  ctx2d.fillRect(0, 0, stage.width, stage.height);
}

let raf = null;
function rafLoop(ts) {
  drawEel(ts);
  raf = requestAnimationFrame(rafLoop);
}

// ─── burning-paper flag reveal (WebGL2 fragment shader) ───────
const BURN_VERT = `#version 300 es
in vec2 a; out vec2 uv;
void main(){ uv = a*0.5 + 0.5; gl_Position = vec4(a, 0, 1); }`;

const BURN_FRAG = `#version 300 es
precision highp float;
in vec2 uv; out vec4 frag;
uniform sampler2D tex;
uniform float t;        // 0..1 burn progress

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}

void main(){
  // sample flag glyphs (white = ink)
  float ink = texture(tex, uv).r;

  // smoldering noise — the burn front
  float n = noise(uv * vec2(8.0, 4.0)) * 0.6 + noise(uv * 24.0) * 0.4;
  float front = smoothstep(t - 0.06, t + 0.06, n);

  // ember at the front
  float emberMask = smoothstep(t - 0.10, t, n) * (1.0 - smoothstep(t, t + 0.04, n));

  // unburnt ink: bone-white on black
  vec3 ink_col = vec3(0.86, 0.83, 0.79) * ink;
  // ash region (post-burn): near-pure black
  vec3 ash = vec3(0.015, 0.012, 0.010);

  vec3 color = mix(ink_col, ash, front);
  // glowing ember edge — single thin red line, no warm tones bleeding
  color += vec3(0.78, 0.16, 0.08) * emberMask * (0.7 + 0.3 * sin(t * 60.0 + uv.y * 80.0));

  // alpha — ash becomes transparent over time
  float alpha = mix(1.0, 0.0, front * smoothstep(0.0, 1.0, t));
  alpha = max(alpha, ink * (1.0 - front));

  frag = vec4(color, alpha);
}`;

function trueDeath(flag) {
  // Render flag text into a temporary canvas → upload to WebGL2 as texture
  const txc = document.createElement('canvas');
  txc.width = 640; txc.height = 360;
  const tx2d = txc.getContext('2d');
  tx2d.fillStyle = '#000'; tx2d.fillRect(0, 0, txc.width, txc.height);
  tx2d.fillStyle = '#fff';
  tx2d.font = 'bold 36px "IBM Plex Mono", monospace';
  tx2d.textAlign = 'center';
  tx2d.textBaseline = 'middle';
  tx2d.fillText(flag, txc.width / 2, txc.height / 2);

  const gl = burn.getContext('webgl2');
  if (!gl) {
    // fallback: just put the text up
    burn.style.opacity = '1';
    const ctx = burn.getContext('2d');
    ctx.drawImage(txc, 0, 0);
    say('flag:     ' + flag);
    return;
  }

  // compile shaders
  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER,   BURN_VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, BURN_FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  // upload texture
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, txc);

  gl.uniform1i(gl.getUniformLocation(prog, 'tex'), 0);
  const uT = gl.getUniformLocation(prog, 't');

  burn.style.opacity = '1';
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let start = null;
  function frame(ts) {
    if (!start) start = ts;
    let p = (ts - start) / 4500;        // 4.5s burn
    if (p > 1.05) p = 1.05;
    gl.uniform1f(uT, p);
    gl.viewport(0, 0, burn.width, burn.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (p < 1.05) requestAnimationFrame(frame);
    else say('flag:     ' + flag);
  }
  requestAnimationFrame(frame);
  say('whisper:  ...the demon dies.');
}

// ─── input ─────────────────────────────────────────────────────
window.addEventListener('keydown', async (e) => {
  if (!opened && e.key === 'Enter') { opened = true; await start(); return; }
  if (!opened) return;
  if (e.key === 'Tab') { e.preventDefault(); sendDeathRequest(); return; }
  const k = KEYMAP[e.key.toLowerCase()];
  if (k === undefined) return;

  inputs.push(k);
  wasmExports.push_input(k);
  vmRun();                          // step the VM until it blocks again
  await dispatchHash();
  sendScaleRequest(soul[7]);
  eelHeat = 1;
});

async function start() {
  say('whisper:  ...you opened it.');
  if (!await initGPU()) {
    say('this tome refuses; bring a real eye.'); return;
  }
  await initWASM();
  connectWS();
  raf = requestAnimationFrame(rafLoop);
  say('keys:     w a s d  ·  tab to die  ·  twenty-eight rounds');
}
