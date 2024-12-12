float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float ring(vec2 uv, vec2 origin, float r, float t) {
  return step(length(uv - origin), r + t) - step(length(uv - origin), r - t);
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  vec3 color = vec3(0.0);
  float n = 0.25; vec2 id = n * round(uv / n);
  float swap = hash(id) > 0.5 ? 1.0 : -1.0;
  uv -= id;
  n *= 0.5;
  uv.x *= swap;
  color.x += ring(uv, +vec2(n), n, 0.1 * n);
  color.x += ring(uv, -vec2(n), n, 0.1 * n);
  out_color = vec4(color, 1.0);
}