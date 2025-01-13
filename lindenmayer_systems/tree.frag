#include "common/nature.frag"
#include "common/random.frag"

#define STEP_SIZE     0.5
#define STEP_COUNT    2000
#define FAR           5000.0
#define EPSILON       0.001

#define MAP(p) map(p)


mat4x3 transform(vec3 p, float step, float axz, float ay, float r, float h, inout float tree) {
  mat4x3 result; vec3 q = p;
  for (int i = 0; i < 4; i++) {
    float fi = float(i + 1);
    q.y = p.y - step * fi;
    q.xz = p.xz * rotate(axz * fi);
    q.xy *= rotate(ay);
    result[i] = q.yxz;
    float branch = sd_capsule(q.yxz, r, h);
    tree = min(tree, branch);
  }
  return result;
}

float tree(vec3 p, float r, float h) {
  float tree = sd_capsule(p, r, r, h);

  float k = 0.5;
  float n = 2.0;

  mat4x3 t1 = transform(p, 2.0, 2.0 * PI / 3.0, PI / 4.0, 0.2, 5.0, tree);
  p = t1[0];
  mat4x3 t2 = transform(p, 1.0, 2.0 * PI / 3.0, PI / 4.0, 0.1, 3.0, tree);
  p = t1[1];
  mat4x3 t3 = transform(p, 1.0, 2.0 * PI / 3.0, PI / 4.0, 0.1, 3.0, tree);
  p = t1[2];
  mat4x3 t4 = transform(p, 1.0, 2.0 * PI / 3.0, PI / 4.0, 0.1, 3.0, tree);
  p = t1[3];
  t1 = transform(p, 1.0, 2.0 * PI / 3.0, PI / 4.0, 0.1, 3.0, tree);

  return tree;
}


vec2 map(vec3 p) {
  p.xz *= rotate(iTime);
  float t = tree(p, 0.3, 10.0);
  return vec2(t, 0.0);
}

#include "common/march.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;  
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 5.0, 15.0);
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