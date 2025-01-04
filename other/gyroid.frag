#include "common/distance.frag"
#include "common/common.frag"

#define STEP_SIZE    0.5
#define STEP_COUNT   500
#define FAR          250.0

#define MAP(x) map(x)

vec2 map(vec3 p) {
  p.xz *= rotate(iTime);

  float gyroid = dot(cos(p), sin(p.yzx));
  float sh = cos(p.x) + cos(p.y) + cos(p.z);

  float s1 = sd_sphere(p, 20.0);
  float s2 = sd_sphere(p, 19.0);

  float ret = max(-s2, max(-sh, s1));

  return vec2(ret, 0.0);
}



#include "common/march.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 1.0, 46.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  if (hit.id != -1.0) {
    color = vec3(0.5, 0.5, 0.8);
    color += vec3(0.5, 0.7, 0.3) * dot(hit.normal, normalize(vec3(1.0)));
  }

  out_color = vec4(color, 1.0);
}