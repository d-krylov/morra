#include "common/common.frag"
#include "common/distance.frag"
#include "common/noise.frag"

#define STEP_SIZE    0.5
#define STEP_COUNT   2000
#define FAR          5000.0
#define EPSILON      0.001

#define TREE_TRUNK_ID     0.0
#define TREE_BRANCH_ID    1.0
#define TREE_NEEDLE_ID    2.0
#define TERRAIN_ID        3.0

float get_height(vec2 p) {
  float h = 4.0 * fbm(0.01 * p, 1.0, 2);

  return h;
}

vec2 terrain(vec3 p) {
  float h = get_height(p.xz);
  return vec2(p.y - h, TERRAIN_ID);
}

vec2 branch(vec3 p, float r, float h, float n) {
  vec2 branch = vec2(sd_capsule(p, r, h), TREE_BRANCH_ID);
  p.y -= length(p.xz);
  float id = round(p.y / n);
  float count = 7.0 + mod(id, 3.0);
  p.xz *= rotate(id);
  float f = repeat_angle(p.xz, count);
  p.xz *= rotate(f + PI / count);
  p.y -= clamp(n * id, 0.0, h);
  vec2 twig = vec2(sd_capsule(p.yxz, r / 3.0, 3.0), TREE_NEEDLE_ID);
  branch = MIN(branch, twig);
  return branch;
}

vec2 tree(vec3 p, float r, float h, float n) {
  vec2 trunk = vec2(sd_capsule(p, r, h), TREE_TRUNK_ID);
  p.y += 0.4 * length(p.xz);
  float id = round(p.y / n);
  p.y -= clamp(n * id, 0.3 * h, h);
  float count = mod(id, 3.0) + 4.0;
  float f = repeat_angle(p.xz, count);
  p.xz *= rotate(f + PI / count);
  float size = 0.4 * h - id;
  vec2 branches = branch(p.yxz, r / sqrt(count), size, 0.4);
  vec2 tree = MIN(trunk, branches);
  return tree;
}

vec2 forest(vec3 p) {
  float n = 40.0;
  float t = get_height(p.xz);
  vec2 id = round(p.xz / n);
  float h = 30.0 * hash(id);
  p.xz -= clamp(n * id, vec2(-500.0, -2000.0), vec2(500.0, 0.0));
  vec2 tree = tree(p - vec3(0.0, t, 0.0), 0.5, 20.0 + h, 3.0);
  return tree;
}

vec2 map(vec3 p) {
  float h = get_height(p.xz);
  vec2 terrain = terrain(p);
  
  vec2 ret = terrain;
  vec2 forest = forest(p);
  ret = MIN(ret, forest);

  return ret;
}

vec3 get_normal(vec3 p) {
  const float h = 0.01; 
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * map(p + k.xyy * h).x + 
                   k.yyx * map(p + k.yyx * h).x + 
                   k.yxy * map(p + k.yxy * h).x + 
                   k.xxx * map(p + k.xxx * h).x);
}

Hit trace(Ray ray, float near) {
  Hit hit;
  hit.id = -1.0;
  float t = near;
  for (int i = 0; i < STEP_COUNT; i++) {
    vec3 p = ray.origin + ray.direction * t;
    vec2 d = map(p);
    if (d.x < EPSILON) {
      hit.id = d.y;
      hit.position = p; 
      hit.normal = get_normal(hit.position);
      break;
    }
    t += STEP_SIZE * d.x;
    if (t > FAR) { break; }
  }
  return hit;
}

float soft_shadow(in Ray ray, in float near, int steps) {
  float ret = 1.0;
  float t = near;
  for (int i = 0; i < steps && t < FAR; i++) {
	  vec3 p = ray.origin + ray.direction * t;
    float d = map(p).x;
    ret = min(ret, 10.0 * d / t);
    if (ret < EPSILON) break;
    t += d;
  }
  ret = clamp(ret, 0.0, 1.0);
  return ret * ret * (3.0 - 2.0 * ret);
}

vec3 get_color(Hit hit) {
  vec3 color;
  if (hit.id == TERRAIN_ID) {
    color = vec3(0.8, 0.8, 0.8);
  }
  if (hit.id == TREE_TRUNK_ID) color = vec3(0.2, 0.3, 0.1);
  if (hit.id == TREE_BRANCH_ID) color = vec3(0.4, 0.6, 0.2);
  if (hit.id == TREE_NEEDLE_ID) {
    color = vec3(0.1, 0.4, 0.1);
    color = mix(color, vec3(1.0), hit.normal.z);
  }
  return color;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;

  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 10.0, 80.0);
  ray.direction = normalize(vec3(uv, -1.0));

  //ray.direction.xz *= rotate(iTime);

  Hit hit = trace(ray, 0.0);

  vec3 LD = normalize(vec3(1.0));

  if (hit.id != -1.0) {
    color = get_color(hit);
    Ray shadow_ray = Ray(hit.position, LD);
    color += vec3(0.5, 0.7, 0.3) * dot(hit.normal, LD) * soft_shadow(shadow_ray, 0.1, 24);
  }

  out_color = vec4(color, 1.0);
}