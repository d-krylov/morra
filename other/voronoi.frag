vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 18.5453);
}

float voronoi(vec2 p) {
  vec2 n = floor(p);
  vec2 f = fract(p);
  float ret = 1.0;
  for (float j = -1.0; j < 2.0; j++) {
    for (float i = -1.0; i < 2.0; i++) {
      vec2 g = vec2(i, j);
      vec2 h = hash(n + g);
      vec2 r = g - f + h;
      ret = min(length(r), ret);
    }
  }
  return ret;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  float color = voronoi(10.0 * uv);
  out_color = vec4(color, 0.0, 0.0, 1.0);
}