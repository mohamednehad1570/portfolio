/**
 * CubesBackground — full-screen glass cubes behind the whole page.
 *
 * Based on React Bits "Cubes" (WebGL2, instanced cubes on springs).
 * MODIFIED for this site:
 *  - the grid is rectangular and fills any screen (the original draws a square grid);
 *  - faces are clear, only the edges are drawn, in the accent colour;
 *  - it listens to the pointer on the whole window because the canvas sits behind content;
 *  - `paused` stops the animation loop (used while the About gallery is on screen).
 */
import { useEffect, useRef } from 'react';

// Vertex shader: places one cube per instance and rotates it by a quaternion.
const VERTEX = `#version 300 es
in vec3 aP; in vec3 aN; in vec2 aU; in vec2 aC; in vec4 aR; in vec2 aS;
uniform mat4 uM; uniform float uSz;
out vec3 vN; out vec2 vU; out float vF;
vec3 rot(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
void main() {
  vec3 l = rot(aR, aP * uSz);
  vN = rot(aR, aN); vU = aU; vF = aS.x;
  gl_Position = uM * vec4(vec3(aC, 0.0) + l, 1.0);
}`;

// Fragment shader: draws only a thin line along each face edge (clear glass look).
const FRAGMENT = `#version 300 es
precision highp float;
in vec3 vN; in vec2 vU; in float vF;
uniform vec3 uEdge; uniform float uEW; uniform float uEA;
out vec4 o;
void main() {
  vec2 sp = max(fwidth(vU), vec2(1e-5));
  vec2 b = min(vU, 1.0 - vU) / sp;
  float d = min(b.x, b.y);
  float c = 1.0 - smoothstep(uEW * 0.5 - 0.5, uEW * 0.5 + 0.5, d);
  vec3 n = normalize(vN);
  c *= smoothstep(0.06, 0.28, abs(n.z));
  float a = max(c * mix(uEA, 1.0, vF), vF * 0.08);
  o = vec4(uEdge * a, a);
}`;

// The six faces of a unit cube: normal, then the two in-plane axes.
const FACES = [
  [0, 0, 1, 1, 0, 0, 0, 1, 0], [0, 0, -1, -1, 0, 0, 0, 1, 0],
  [1, 0, 0, 0, 0, -1, 0, 1, 0], [-1, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, -1], [0, -1, 0, 1, 0, 0, 0, 0, 1]
];

const hexToRgb = hex =>
  /^#[0-9a-f]{6}$/i.test(hex) ? [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) : [0.12, 0.37, 0.55];

export default function CubesBackground({ color = '#1f5f8b', lineAlpha = 0.3, paused = false }) {
  const canvasRef = useRef(null);
  const live = useRef({ color, lineAlpha, paused });
  live.current = { color, lineAlpha, paused };
  const wakeRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const gl = cv?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) return undefined; // no WebGL2: the page simply stays white

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Compile and link the two shaders.
    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    ['aP', 'aN', 'aU', 'aC', 'aR', 'aS'].forEach((n, i) => gl.bindAttribLocation(program, i, n));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    const U = {};
    ['uM', 'uSz', 'uEdge', 'uEW', 'uEA'].forEach(n => { U[n] = gl.getUniformLocation(program, n); });

    // Cube geometry (shared by every instance).
    const verts = [], idx = [];
    FACES.forEach(([nx, ny, nz, ux, uy, uz, vx, vy, vz], f) => {
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(([u, v]) =>
        verts.push(nx * 0.5 + (u - 0.5) * ux + (v - 0.5) * vx, ny * 0.5 + (u - 0.5) * uy + (v - 0.5) * vy,
          nz * 0.5 + (u - 0.5) * uz + (v - 0.5) * vz, nx, ny, nz, u, v));
      const b = f * 4; idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    });
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    [[0, 3, 0], [1, 3, 12], [2, 2, 24]].forEach(([l, s, o]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, 32, o); });
    const eb = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eb);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    // Per-instance data: centre (2), rotation quaternion (4), glow + scale (2).
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ib);
    [[3, 2, 0], [4, 4, 8], [5, 2, 24]].forEach(([l, s, o]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, 32, o); gl.vertexAttribDivisor(l, 1); });

    let W = 1, H = 1, D = 1, S = 44, cols = 0, rows = 0, n = 0;
    let rx, ry, wx, wy, glow, inst, centres = [];
    let clock = 0, last = 0, raf = 0, alive = true;
    const pointer = { x: 0, y: 0, moved: -99 };
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, w: 0, primed: false };
    const rings = [];

    // Size the canvas and (re)build the grid so it always covers the screen.
    const size = () => {
      W = Math.max(1, cv.clientWidth); H = Math.max(1, cv.clientHeight);
      D = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * D); cv.height = Math.round(H * D);
      S = W < 760 ? 34 : 46; // cube spacing in CSS px: fewer cubes on phones
      cols = Math.ceil(W / S) + 1; rows = Math.ceil(H / S) + 1; n = cols * rows;
      rx = new Float32Array(n); ry = new Float32Array(n); wx = new Float32Array(n); wy = new Float32Array(n);
      glow = new Float32Array(n); inst = new Float32Array(n * 8); centres = [];
      for (let i = 0; i < n; i++) centres.push([(i % cols) - (cols - 1) / 2, (rows - 1) / 2 - Math.floor(i / cols)]);
    };
    const toWorld = (x, y) => [(x - W / 2) / S, (H / 2 - y) / S];

    // One simulation step: springs pull each cube toward its tilt target.
    const step = dt => {
      clock += dt;
      const idle = clock - pointer.moved > 3;
      let gx = cursor.x, gy = cursor.y;
      if (!idle) [gx, gy] = toWorld(pointer.x, pointer.y);
      else if (!reduce) { // wander on its own when nobody is pointing (phones too)
        gx = Math.sin(clock * 0.37) * cols * 0.4 * Math.cos(clock * 0.11);
        gy = Math.sin(clock * 0.53 + 1.2) * rows * 0.4;
      }
      if (!cursor.primed) { cursor.x = gx; cursor.y = gy; cursor.primed = true; }
      const px = cursor.x, py = cursor.y, follow = 1 - Math.exp(-dt * 18);
      cursor.x += (gx - cursor.x) * follow; cursor.y += (gy - cursor.y) * follow;
      const blend = 1 - Math.exp(-dt * 10);
      cursor.vx += ((cursor.x - px) / Math.max(dt, 0.001) - cursor.vx) * blend;
      cursor.vy += ((cursor.y - py) / Math.max(dt, 0.001) - cursor.vy) * blend;
      cursor.w += (1 - cursor.w) * (1 - Math.exp(-dt * 6));

      const K = 160, damp = 2 * (1 - 0.82 * 0.4) * Math.sqrt(K), maxA = (45 * Math.PI) / 180, R = 3, travel = 8;
      const fade = Math.exp(-dt * 3.2);
      for (let k = rings.length - 1; k >= 0; k--) if ((clock - rings[k].b) * travel > Math.max(cols, rows) * 1.5) rings.splice(k, 1);
      const sp = Math.hypot(cursor.vx, cursor.vy);
      const sx = sp > 1e-4 ? -cursor.vy / sp : 0, sy = sp > 1e-4 ? cursor.vx / sp : 0;
      const sweep = reduce ? 0 : Math.min(sp, 40) * 1.6;

      for (let i = 0; i < n; i++) {
        const [cx, cy] = centres[i];
        const dx = cx - cursor.x, dy = cy - cursor.y, d = Math.hypot(dx, dy), t = d / R;
        const fall = t < 1 ? (1 - t * t) * (1 - t * t) * cursor.w : 0;
        let tx = 0, ty = 0;
        if (fall > 0 && d > 1e-4) { const tilt = maxA * fall * (d / Math.hypot(d, 0.8)); tx = (dy / d) * tilt; ty = (-dx / d) * tilt; }
        if (fall > 0 && sweep > 0) { wx[i] += sx * sweep * fall * dt * 4; wy[i] += sy * sweep * fall * dt * 4; }
        glow[i] *= fade;
        for (const g of rings) { // click ripple travelling outwards
          const ox = cx - g.x, oy = cy - g.y, re = Math.hypot(ox, oy), now = (clock - g.b) * travel;
          if (re > now || re <= now - travel * dt || re < 1e-4) continue;
          const st = Math.exp(-re / (Math.max(cols, rows) * 0.8));
          wx[i] -= (oy / re) * 13 * st; wy[i] += (ox / re) * 13 * st; glow[i] = Math.max(glow[i], st);
        }
        if (reduce) { rx[i] = tx; ry[i] = ty; wx[i] = 0; wy[i] = 0; }
        else {
          wx[i] += (K * (tx - rx[i]) - damp * wx[i]) * dt; wy[i] += (K * (ty - ry[i]) - damp * wy[i]) * dt;
          rx[i] += wx[i] * dt; ry[i] += wy[i] * dt;
        }
        const a = Math.hypot(rx[i], ry[i]), s = a < 1e-6 ? 0 : Math.sin(a / 2) / a, b = i * 8;
        inst[b] = cx; inst[b + 1] = cy; inst[b + 2] = rx[i] * s; inst[b + 3] = ry[i] * s; inst[b + 4] = 0;
        inst[b + 5] = Math.cos(a / 2); inst[b + 6] = glow[i]; inst[b + 7] = 1;
      }
    };

    // Draw all cubes in two instanced calls (back faces, then front faces).
    const render = () => {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program); gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, ib); gl.bufferData(gl.ARRAY_BUFFER, inst, gl.DYNAMIC_DRAW);
      const hw = W / 2 / S, hh = H / 2 / S, depth = Math.max(hw, hh) * 4 + 4;
      gl.uniformMatrix4fv(U.uM, false, new Float32Array([1 / hw, 0, 0, 0, 0, 1 / hh, 0, 0, 0, 0, -1 / depth, 0, 0, 0, 0, 1]));
      gl.uniform1f(U.uSz, 0.82);
      gl.uniform3fv(U.uEdge, hexToRgb(live.current.color));
      gl.uniform1f(U.uEW, D);
      gl.uniform1f(U.uEA, live.current.lineAlpha);
      gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      gl.cullFace(gl.FRONT); gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, n);
      gl.cullFace(gl.BACK); gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, n);
      gl.depthMask(true);
    };

    const frame = now => {
      raf = 0;
      if (!alive || document.hidden || live.current.paused) { last = 0; return; }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now; step(dt); render();
      if (!reduce) raf = requestAnimationFrame(frame); else last = 0;
    };
    const wake = () => { if (!raf && alive && !document.hidden && !live.current.paused) raf = requestAnimationFrame(frame); };
    wakeRef.current = wake;

    const onMove = e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.moved = clock; if (reduce) { step(0); render(); } else wake(); };
    const onDown = e => {
      if (reduce || e.target?.closest?.('a,button,.circular-gallery,.flowing-menu')) return; // ripples only on empty space
      const [x, y] = toWorld(e.clientX, e.clientY);
      rings.push({ x, y, b: clock }); if (rings.length > 6) rings.shift(); wake();
    };
    const onVisibility = () => { last = 0; wake(); };
    const onResize = () => { size(); step(0); render(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);
    size(); step(0); render(); wake();

    return () => {
      alive = false; cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      gl.deleteBuffer(vb); gl.deleteBuffer(eb); gl.deleteBuffer(ib); gl.deleteVertexArray(vao); gl.deleteProgram(program);
    };
  }, []);

  // Restart the loop when un-paused.
  useEffect(() => { if (!paused) wakeRef.current?.(); }, [paused]);

  return <canvas ref={canvasRef} className="cubes-bg" aria-hidden="true" />;
}
