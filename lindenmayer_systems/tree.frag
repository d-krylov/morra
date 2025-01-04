#include "common/nature.frag"
#include "common/random.frag"

#define STEP_SIZE     0.5
#define STEP_COUNT    2000
#define FAR           5000.0
#define EPSILON       0.001

#define MAP(p) map(p)


float tree(vec3 p, float r, float h, vec3 offsets) {
  float tree = sd_capsule(p, r, h);
  float offset;
  for (int i = 0; i < 2; i++) {
    //offset = (p.x < 0.0) ? 0.2 * h: 0.8 * h;
    p.xz *= rotate(PI / 4.0);
    if (p.x < 0.0 && p.z < 0.0) offset = 0.2 * h;
    if (p.x < 0.0 && p.z > 0.0) offset = 0.4 * h;
    if (p.x > 0.0 && p.z < 0.0) offset = 0.6 * h;
    if (p.x > 0.0 && p.z > 0.0) offset = 0.8 * h;
    p.y -= offset;
    p.xz = abs(p.xz);
    p.xy *= rotate(PI / 4.0);
    h /= 1.5;
    r /= 1.5;
    p = p.yxz;
    float branch = sd_capsule(p, r, h);
    tree = min(tree, branch);
  }
  return tree;
}


vec2 map(vec3 p) {
  p.xz *= rotate(iTime);
  float t = tree(p, 0.3, 10.0, vec3(0.3, 0.5, 0.7));
  return vec2(t, 0.0);
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
    color = vec3(0.1, 0.5 + 0.2 * hit.id, 0.1);
    float cos_theta = dot(hit.normal, LD);
    color += cos_theta * vec3(0.5, 0.5, 0.5);
  }

 
  out_color = vec4(color, 1.0);
}