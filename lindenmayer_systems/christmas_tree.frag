#include "common/common.frag"
#include "common/distance.frag"

#define STEP_SIZE     0.5
#define STEP_COUNT    2000
#define FAR           5000.0
#define EPSILON       0.001

#define MAP(p) map(p)

float branch(vec3 p, float r, float h, float n) {
  float branch_ = sd_capsule(p, r, h);
  p.y -= length(p.xz);
  float id = n * round(p.y / n);
  float needles = 8.0 + mod(id, 5.0);
  float angle = repeat_angle(p.xz, needles);
  p.y  -= clamp(id, 0.0, h);
  p.xz *= rotate(angle + PI / needles);
  float needle_ = sd_capsule(p.yxz, 0.1 * r, 1.2 - id / h);
  float ret = min(branch_, needle_);
  return ret;
}

vec2 map(vec3 p) {
  p.xz *= rotate(iTime);

  float tree = branch(p, 0.1, 18.0, 0.2);

  return vec2(tree, 0.0);
}

#include "common/trace.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;  
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 5.0, 8.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  vec3 LD = normalize(vec3(1.0, 1.0, 1.0));
  if (hit.id != -1.0) {
    color = vec3(0.5, 0.5, 0.5);
    float cos_theta = dot(hit.normal, LD);
    color += cos_theta * vec3(1.0, 1.0, 0.2);
  }

 
  out_color = vec4(color, 1.0);
}