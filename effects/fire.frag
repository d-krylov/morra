#include "common/noise.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  float s = smoothstep(1.0, 0.0, abs(uv.x));
  float r = smoothstep(1.0, -1.0, uv.y);

  uv.y -= iTime;

  float h = fbm(3.0 * uv, 1.0, 2);

  color.x += h * s * r;

  out_color = vec4(color, 1.0);
}