#include "common/distance.frag"
#include "common/common.frag"

#define STEP_SIZE    0.1
#define STEP_COUNT   1000
#define FAR          250.0

#define SPHERE_ID    0.0
#define PLANE_ID     1.0

#define MAP(x) map(x)


vec2 map(vec3 p) {
  p.xz *= rotate(iTime);
  float sphere_radius = 3.0;
  vec3 sphere_position = vec3(0.0, sphere_radius, 0.0);
  float sphere = length(p - sphere_position) - sphere_radius;
  float plane = p.y;
  float ret = min(sphere, plane);
  float id = float(ret == sphere) * SPHERE_ID +float(ret == plane) * PLANE_ID;
  return vec2(ret, id);
}

#include "common/march.frag"

vec3 get_object_color(Hit hit) {
  if (hit.id == SPHERE_ID) { return vec3(0.1, 1.0, 0.1); } 
  if (hit.id == PLANE_ID) { return vec3(0.1, 0.1, 1.0); }
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 1.0, 5.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  vec3 light_color = vec3(0.5, 0.7, 0.3);
  vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));

  if (hit.id != -1.0) {
    color = get_object_color(hit);
    color += light_color * dot(hit.normal, light_direction);
  }

  out_color = vec4(color, 1.0);
}