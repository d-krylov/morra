#include "common/common.frag"
#include "common/distance.frag"

#define STEP_SIZE     0.5
#define STEP_COUNT    2000
#define FAR           5000.0
#define EPSILON       0.001

#define MAP(p) map(p)

vec2 map(vec3 p) {
  p.xz *= rotate(iTime);
  float r = 0.5;
  float h = 6.0;
  float tree = sd_capsule(p, r, h);

  float n = 2.0;
  for (int i = 0; i < 20; i++) {
    p.y -= h;
    float xz = repeat_angle(p.xz, n);
    p.xz *= rotate(xz + PI / n);
    p.xy *= rotate(PI / 4.0);
    p = p.yxz;
    h /= 1.5; // sqrt(3.0);
    r /= 1.5;
    tree = min(tree, sd_capsule(p, r, h));
  }

  return vec2(tree, 0.0);
}

#include "common/march.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;  
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 10.0, 15.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  vec3 LD = normalize(vec3(1.0, 1.0, 1.0));
  if (hit.id != -1.0) {
    color = vec3(0.5, 0.5, 0.5);
    float cos_theta = dot(hit.normal, LD);
    color += cos_theta * vec3(1.0, 1.0, 0.2);
  }

 
  out_color = vec4(color, 1.0);
}