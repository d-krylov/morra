#define PI 3.1415926535897

mat2 rotate(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

float koch(vec2 uv, int steps) {
  vec2 pq = abs(uv);
  float c = sqrt(3.0);
  for (int i = 0; i < steps; i++) {
    pq = c * pq.yx * rotate(-PI / 3.0);
    pq.y = abs(pq.y) - 0.5 * c;
  }
  return -pq.x * step(length(uv), c / 4.0);
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);
  color.z = koch(0.5 * uv, 14);
  out_color = vec4(color, 1.0);
}