#define PI 3.1415926535897932

mat2 rotate(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

float sd_capsule(vec2 p, float r, float h) {
  p.y -= clamp(p.y, 0.0, h);
  return length(p) - r;
}

float repeat_angle(vec2 p, float n) {
  float sp = 2.0 * PI / n;
  float an = atan(p.x, p.y);
  float id = floor(an / sp);
  return sp * id;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  uv.y -= 0.2;
  uv *= 20.0;

  vec3 color = vec3(0.0);

  float n = 3.0;
  float h = 9.5;
  float r = 0.2;
  for (int i = 0; i < 17; i++) {
    float f = repeat_angle(uv, n);
    uv.yx *= rotate(f + PI / n);
    float s = sd_capsule(uv, r, h);
    color.x += step(s, 0.0);
    uv.y -= h;
    h /= 2.0;
    r /= 1.5;
    uv *= rotate(PI / n);
  }

  out_color = vec4(color, 1.0);
}