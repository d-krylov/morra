#include "common/common.frag"
#include "common/distance.frag"
#include "common/noise.frag"
#include "common/light.frag"

#define STEP_SIZE     0.5
#define STEP_COUNT    2000
#define FAR           5000.0
#define EPSILON       0.001

#define MAP(p) map(p)

struct Tree {
  vec4 size;
  vec2 range;
  vec2 count;
  float angle;
  float n;
  float id;
};

float transform(inout vec3 p, float angle, float n, vec2 range) {
  p.y -= angle * length(p.xz); float id = n * round(p.y / n);
  p.y -= clamp(id, range.x, range.y);
  return id;
}

float transform(inout vec3 p, float n, float angle) {
  p.xz *= rotate(angle); float id = repeat_angle(p.xz, n);
  p.xz *= rotate(id + PI / n);
  return get_angle_id(p.xz, n);
}

float add_branches(inout vec3 p, Tree t, out float branch_sz) {
  float yid = transform(p, t.angle, t.n, t.range); float rnd = hash(yid);
  float cnt = floor(mix(t.count.x, t.count.y, rnd));
  float aid = transform(p, cnt, rnd); p = p.yxz; 
  float len = t.size.z + mix(t.size.x, t.size.y, rnd) * smoothstep(t.range.y, t.range.x, yid);
  float ret = sd_capsule(p, t.size.w, 0.05, len); branch_sz = len;
  return ret;
}

bool add_tree_level(inout vec3 p, inout float tree, inout float id, Tree info, inout float current_size, float min_size, bool modify) {
  if (current_size > min_size && modify == true) {
    float tree_branches = add_branches(p, info, current_size);
    tree = min(tree, tree_branches);
    id = (tree == tree_branches) ? info.id : id;
    return true;
  }
  return false;
}

vec2 tree(vec3 p) {
  float id = 0.0;
  float current_size = 100.0;
  bool modify;

  float tree = sd_capsule(p, 1.0, 0.1, current_size);
  vec3 q = p;

  Tree info = Tree(
    vec4(20.0, 40.0, 5.0, 0.3), // size
    vec2(10.0, 90.0),           // range
    vec2(6.00, 9.00),           // count
    0.5, 10.0, 1.0              // angle, n, id
  );

  modify = add_tree_level(p, tree, id, info, current_size, 0.0, true);

  info = Tree(
    vec4(5.0, 12.0, 6.0, 0.1), // size
    vec2(5.0, current_size * 0.9),    // range
    vec2(2.0, 4.00),            // count
    1.1, 4.0, 2.0               // angle, n, id
  );

  modify = add_tree_level(p, tree, id, info, current_size, 8.0, modify);

  info = Tree(
    vec4(0.5, 1.5, 1.0, 0.1),  // size
    vec2(1.0, current_size),    // range
    vec2(8.0, 15.0),            // count
    1.0, 2.0, 3.0               // angle, n, id
  );

  modify = add_tree_level(p, tree, id, info, current_size, 2.0, modify);

  info = Tree(
    vec4(1.0, 2.5, 1.0, 0.1),  // size
    vec2(80.0, 100),            // range
    vec2(15.0, 25.0),           // count
    1.0, 1.0, 3.0               // angle, n, id
  );

  modify = add_tree_level(q, tree, id, info, current_size, 2.0, true);


  return vec2(tree, id);
}


vec2 map(vec3 p) {
  p.xz *= rotate(iTime);

  vec2 tree = tree(p);

  return tree;
}

#include "common/march.frag"

vec3 get_color(Hit hit) {
  if (hit.id == 0.0) return vec3(0.6, 0.3, 0.0);
  if (hit.id == 1.0) return vec3(0.75, 0.45, 0.2);
  if (hit.id == 2.0) return vec3(0.9, 0.9, 0.1);
  if (hit.id == 3.0) return vec3(0.1, 0.5, 0.1);

}


void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;  
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 50.0, 80.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  vec3 LD = normalize(vec3(1.0, 15.0, 1.0));
  if (hit.id != -1.0) {
    color = get_color(hit);
    float cos_theta = dot(hit.normal, LD);
    color += cos_theta * vec3(0.4, 0.4, 0.4);
  }

  //color = gamma(color);
  //color = ACES(color);
 
  out_color = vec4(color, 1.0);
}