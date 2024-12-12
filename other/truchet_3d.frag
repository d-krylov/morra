#include "common/distance.frag"
#include "common/common.frag"

#define STEP_SIZE    0.5
#define STEP_COUNT   500
#define FAR          250.0
#define EPSILON      0.001

#define MAP(p) map(p)

float hash(float p) {
  return fract(sin(p * 134.787) * 13751.5453123);
}

vec2 map(vec3 p) {
  float n = 16.0; vec3 id = n * round(p / n);
  p -= id;

  float swap_x = hash(id.x) > 0.5 ? 1.0 : -1.0;
  float swap_y = hash(id.y) > 0.5 ? 1.0 : -1.0;
  float swap_z = hash(id.z) > 0.5 ? 1.0 : -1.0;
  p *= vec3(swap_x, swap_y, swap_z);

  n *= 0.5;
  float t1 = sd_torus(p.xyz - vec3( n, 0.0,  n), n, 0.2);
  float t2 = sd_torus(p.xzy - vec3(-n, 0.0,  n), n, 0.2);
  float t3 = sd_torus(p.yxz - vec3(-n, 0.0, -n), n, 0.2);

  float torus = min(t1, min(t2, t3));
  return vec2(torus, 0.0);
}

#include "common/march.frag"


void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(2.0 - 3.0 * iTime, iTime, 5.0 - 5.0 * iTime);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  if (hit.id != -1.0) {
    color = vec3(0.5);
    color += vec3(0.5, 0.7, 0.3) * dot(hit.normal, normalize(vec3(1.0)));
  }

  out_color = vec4(color, 1.0);
}