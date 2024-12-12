#include "common/distance.frag"
#include "common/common.frag"

#define STEP_SIZE    0.5
#define STEP_COUNT   500
#define FAR          250.0

#define MAP(x) map(x)

float sd_torus_helix(vec3 p, float order, float wraps, float R, float r, float thickness) {
  float s = 2.0 * PI / order;
  float l = length(p.xz) - R;
  vec2 u = vec2(l, p.y) * rotate(wraps * atan(p.z, p.x));
  u *= rotate(s * (floor((0.5 * PI - atan(u.x, u.y)) / s + 0.5)));
  return length (vec2(u.x - r, u.y)) - thickness;
}
 
float sd_helix(vec3 p, float order, float wraps, float R, float r) {
  float l = length(p.xz) - R;
	float d = mod(order * atan(p.z, p.x) - wraps * p.y, 2.0 * PI) - PI;
	return length(vec2(l, d)) - r;
}

vec2 map(vec3 p) {
  p.xz *= rotate(iTime);
  //p.yz *= rotate(iTime);
  float R = 4.0;
  float torus = sd_torus_helix(p, 1.0, 8.0, 6.0, 1.0, 0.2);
  //float torus = sd_helix(p, 1.0, 1.0, 4.0, 0.5);

  return vec2(torus, 0.0);
}



#include "common/march.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 12.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  if (hit.id != -1.0) {
    color = vec3(0.5, 0.5, 0.8);
    color += vec3(0.5, 0.7, 0.3) * dot(hit.normal, normalize(vec3(1.0)));
  }

  out_color = vec4(color, 1.0);
}