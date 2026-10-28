// Caustic light on the pond floor, rendered with a tiny WebGL program into its
// own canvas. The 2D pond composites it on top with a "screen" blend.

export type CausticRipple = { x: number; y: number; age: number; strength: number };

export type Caustics = {
  canvas: HTMLCanvasElement;
  resize(width: number, height: number): void;
  render(time: number, ripples: CausticRipple[], scale: number): void;
  dispose(): void;
};

const MAX_RIPPLES = 8;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// The caustic function is the well-known iterative "water caustic" from the
// shader community; ripples push the lookup coordinates outward in rings.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uTime;
uniform float uScale;
uniform vec4 uRipples[${MAX_RIPPLES}];

float caustic(vec2 uv, float t) {
  vec2 p = uv * 6.2831853 - 250.0;
  vec2 i = p;
  float c = 1.0;
  const float inten = 0.005;
  for (int n = 0; n < 5; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 disp = vec2(0.0);
  for (int k = 0; k < ${MAX_RIPPLES}; k++) {
    vec4 r = uRipples[k];
    if (r.w <= 0.0) continue;
    vec2 d = px - r.xy;
    float dist = length(d) + 0.0001;
    float front = r.z * 105.0;
    float band = exp(-pow((dist - front) / 22.0, 2.0));
    float amp = r.w * band * exp(-r.z * 1.3) * 8.0;
    disp += d / dist * sin((dist - front) * 0.35) * amp;
  }
  vec2 uv = (px + disp) / uScale;
  float a = caustic(uv, uTime);
  float b = caustic(uv * 0.83 + vec2(0.37, 0.71), uTime * 0.77 + 3.0);
  float v = a * 0.7 + b * 0.45;
  v = clamp(pow(v, 1.35) * 1.5, 0.0, 1.4);
  gl_FragColor = vec4(vec3(0.84, 1.0, 0.9) * v, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function createCaustics(): Caustics | null {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    antialias: false,
    depth: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "uTime");
  const uScale = gl.getUniformLocation(program, "uScale");
  const uRipples = gl.getUniformLocation(program, "uRipples");
  const rippleData = new Float32Array(MAX_RIPPLES * 4);

  return {
    canvas,
    resize(width, height) {
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render(time, ripples, scale) {
      rippleData.fill(0);
      ripples.slice(-MAX_RIPPLES).forEach((r, i) => {
        rippleData[i * 4] = r.x;
        rippleData[i * 4 + 1] = canvas.height - r.y;
        rippleData[i * 4 + 2] = r.age;
        rippleData[i * 4 + 3] = r.strength;
      });
      gl.uniform1f(uTime, time);
      gl.uniform1f(uScale, scale);
      gl.uniform4fv(uRipples, rippleData);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
