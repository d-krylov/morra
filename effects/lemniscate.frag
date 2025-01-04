vec2 lemniscate(float c, float t) {
  float d = 1.0 + sin(t) * sin(t);
  float x = c * sqrt(2.0) * cos(t) / d;
  float y = c * sqrt(2.0) * sin(t) * cos(t) / d;
  return vec2(x, y);
}

float smin(float a, float b, float k) {
  k *= 4.0;
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - 0.25 * h * h * k;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  uv *= 15.0;

  vec3 color = vec3(0.0);

  float pi = 3.1415926;
  float c = 10.0;
  float n = 10.0;
  float s = 100.0;

  for (float i = 0.0; i < n; i++) {
    vec2 p = lemniscate(c, iTime - i * 2.0 * pi / n);
    float r = 0.5 * (1.0 - i / n);
    s = smin(s, length(uv - p) - r, 2.0);
    color.z += 5.0 * smoothstep(1.0, 0.0, s) / (i + 1.0);
  }

  out_color = vec4(color, 1.0);
}