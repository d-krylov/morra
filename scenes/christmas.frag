#include "common/common.frag"
#include "common/distance.frag"
#include "common/noise.frag"

#define STEP_SIZE   0.5
#define STEP_COUNT  1000
#define FAR         1000.0
#define EPSILON     0.001

#define TERRAIN_ID  0.0
#define HOME_ID     1.0
#define WINDOW_ID   2.0
#define DOOR_ID     3.0
#define SNOWMAN_ID  4.0

#define MAP(p) map(p)

float get_height(vec2 p) {
  float a = smoothstep(100.0, 0.0, length(p));
  float b = smoothstep(80.0, 0.0, length(p));
  float h = 30.0 * fbm(0.1 * p, 2.0, 4);
  return h * (a - b);
}

vec2 terrain(vec3 p) {
  float h = get_height(p.xz);
  return vec2(p.y - h, TERRAIN_ID);
}

vec2 snowman(vec3 p, float r) {
  float r2 = 0.7 * r; float p2 = 2.0 * r + r2;
  float r3 = 0.7 * r2; float p3 = 2.0 * (r + r2) + r3;
  float s1 = sd_sphere(p - vec3(0.0, r, 0.0), r);
  float s2 = sd_sphere(p - vec3(0.0, p2, 0.0), r2);
  float s3 = sd_sphere(p - vec3(0.0, p3, 0.0), r3);
  return vec2(min(s1, min(s2, s3)), SNOWMAN_ID);
}

vec2 home(vec3 p, float r, float h) {
  float exterior = sd_cylinder(p - vec3(0.0, h, 0.0), r, h);
  float interior = sd_cylinder(p - vec3(0.0, h, 0.0), 0.95 * r, 1.1 * h);
  float window = sd_cylinder(p.xzy - vec3(0.0, r, h), 0.4 * h, 0.1 * r);
  p.xz *= rotate(PI / 4.0);
  float door_1 = sd_box(p - vec3(0.5 * h, 0.0, r), 0.3 * h, h, 0.2 * r);
  float result = max(-door_1, max(-window, max(-interior, exterior)));
  return vec2(result, HOME_ID);
}

vec2 map(vec3 p) {
  //p.xz *= rotate(iTime);
  vec2 ret = terrain(p);
  vec2 home = home(p, 10.0, 4.0);
  vec2 snowman = snowman(p - vec3(-10.0, 0.0, 15.0), 1.0);
  ret = MIN(ret, home);
  ret = MIN(ret, snowman);
  return ret;
}

#include "common/march.frag"

vec3 get_color(Hit hit) {
  if (hit.id == TERRAIN_ID) {
    return vec3(0.5, 0.5, 0.5);
  }
  if (hit.id == HOME_ID)   return vec3(0.1, 0.6, 0.4);
}

void get_light() {
  
}

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 5.0, 30.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  vec3 LD = normalize(vec3(1.0, 1.0, 1.0));

  if (hit.id != -1.0) {
    color = get_color(hit);
    float cos_theta = dot(hit.normal, LD);
    Ray shadow_ray = Ray(hit.position, LD);
    color += vec3(0.2, 0.4, 0.5) * cos_theta * soft_shadow(shadow_ray, 0.01, FAR, 32);
  }


  out_color = vec4(color, 1.0);

}