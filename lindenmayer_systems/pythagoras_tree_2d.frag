#define PI 3.1415926535897932

mat2 rotate(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

float sd_capsule(vec2 p, float r, float h) {
  p.y -= clamp(p.y, 0.0, h);
  return length(p) - r;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;  
  vec3 color = vec3(0.0);
  uv += vec2(0.0, 0.5);
  uv *= 20.0;
  float h = 10.0;
  float s = 0.2;
  float tree = sd_capsule(uv, s, h);
  for (int i = 0; i < 10; i++) {
    uv.y -= h;
    uv.x = abs(uv.x);
    uv *= rotate(PI / 4.0);
    uv = uv.yx;
    h /= sqrt(3.0);
    s /= 1.2;
    tree = min(tree, sd_capsule(uv, s, h));
    color.x += step(tree, 0.0);
  }

  out_color = vec4(color, 1.0);

}