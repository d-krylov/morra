#include "common/common.frag"
#include "common/distance.frag"
#include "common/noise.frag"
#iChannel0 "assets/ground.jpg"
#iChannel1 "assets/pebbles.png"

#define MAP(p) map(p)

#define TERRAIN_ID     0.0
#define LAKE_ID        2.0
#define GRASS_ID       3.0
#define TREE_TRUNK_ID  4.0
#define TREE_BRANCH_ID 5.0


float get_mountains(vec2 p) {
  float noise_1 = 900.0 * fbm(0.001 * p, 0.5, 3);
  float noise_2 = 50.0 * texture(iChannel1, 0.002 * p).r;
  float noise_3 = 100.0 * texture(iChannel1, 0.001 * p).r;
  float result = noise_1 + noise_2 + noise_3;
  return result;
}

float get_height(vec2 p) {
  float mountains = get_mountains(p);
  float valley = smoothstep(0.0, 3000.0, length(p));
  float side = smoothstep(0.0, 100.0, sd_box(p, vec2(500.0, 1000.0)));
  float height = mountains * valley + 30.0 * side;
  return height;
}

vec2 terrain(vec3 p) {
  float h = get_height(p.xz);
  float lake = 30.0;
  float snow = smoothstep(500.0, 1000.0, h);
  float id = (h < lake) ? LAKE_ID : TERRAIN_ID;
  h = max(lake, h);
  return vec2(p.y - h, id);
}

vec2 tree(vec3 p, float r, float h, float n) {
  vec2 tree = vec2(sd_capsule(p, r, 0.5 * r, h), TREE_TRUNK_ID);
  for (int i = 0; i < 3; i++) {
    float xz = repeat_angle(p.xz, n);
    float id = get_angle_id(p.xz, n);
    float random = 0.5; //hash(id);
    p.y -= mix(0.5 * h, h, random);
    p.xz *= rotate(xz + PI / n);
    p.xy *= rotate(PI / 4.0);
    p = p.yxz;
    h /= mix(1.3, 1.6, random);
    r /= 1.5;
    vec2 branch = vec2(sd_capsule(p, r, 0.9 * r, h), TREE_BRANCH_ID);
    tree = min_object(branch, tree);
  }
  return tree;
}

vec3 apply_fog(vec3 color, float b, float t, vec3 ray_direction, vec3 sun_direction) {
  float fog_amount = 1.0 - exp(-t * b);
  float sun_amount = max(dot(ray_direction, sun_direction), 0.0);
  vec3 fog_color = vec3(0.5, 0.6, 0.7);
  vec3 sun_color = vec3(1.0, 0.9, 0.7);
  vec3 ret_color = mix(fog_color, sun_color, pow(sun_amount, 8.0));
  return mix(color, ret_color, fog_amount);
}

vec2 forest(vec3 p) {
  float n = 30.0;
  float h = get_height(p.xz);
  vec2 id = n * round(p.xz / n);
  p.xz -= id; p.y -= h;

  float bounding_sphere = sd_sphere(p, 10.0);

  if (bounding_sphere > 12.0) return vec2(bounding_sphere - 10.0, TREE_TRUNK_ID);
  vec2 trees = vec2(100.0, -1.0);
  if (h > 50.0 && h < 100.0) return trees;
  trees = tree(p, 0.3, 10.0, 5.0);
  return trees;
}

vec2 map(vec3 p) {
  //p.xz *= rotate(iTime);
  vec2 terrain = terrain(p);
  vec2 forest = forest(p);

  vec2 result = min_object(terrain, forest);

  return result;
}

#include "common/march.frag"

vec3 get_material(Hit hit) {
  float id = hit.id;
  vec3 color;
  if (id == TERRAIN_ID) {
    color = 0.5 * texture(iChannel0, 0.001 * hit.position.xz).rgb;
    float snow_height = smoothstep(100.0, 900.0, hit.position.y);
    color += vec3(0.5) * snow_height * fbm(0.008 * hit.position, 0.1, 2); 

  } else if (id == TREE_TRUNK_ID) {
    color = vec3(0.4, 0.26, 0.13);
  } else if (id == TREE_BRANCH_ID) {
    color = vec3(0.26, 0.26, 0.26);
  } else if (id == LAKE_ID) {
    color = vec3(0.0, 0.0, 1.0);
  } else if (id == GRASS_ID) {
    color = vec3(0.0, 1.0, 0.0);
  }
  return color;
}

vec3 sky() {
  return vec3(0.0);
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;

  vec3 color = vec3(0.0);

  Ray ray; 
  ray.origin = vec3(-50.0, 200.0, 800.0);
  ray.direction = normalize(vec3(uv, -1.0));

  //ray.direction.xz *= rotate(iTime);

  Hit hit = march(ray, 0.0, 5000.0, 0.5, 5000);

  vec3 light_color = vec3(0.5, 0.5, 0.1);
  vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));

  if (hit.id != -1.0) {
    color = get_material(hit);
    color += light_color * dot(hit.normal, light_direction);
    color = apply_fog(color, 0.0004, hit.t, ray.direction, light_direction);
  }

  out_color = vec4(color, 1.0);
}