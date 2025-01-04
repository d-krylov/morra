#include "common/common.frag"
#include "common/texture.frag"

#define STEP_SIZE    0.5
#define STEP_COUNT   500
#define FAR          250.0
#define EPSILON      0.001

#define GROUND_ID    0.0
#define SPHERE_ID    1.0

#define MAP(p) map(p)

vec2 map(vec3 p) {
  float radius = 1.0;
  float ground = p.y;
  float sphere = length(p - vec3(0.0, radius, 0.0)) - radius;

  float result = min(ground, sphere);
  float id = (result == ground) ? GROUND_ID : SPHERE_ID;
  
  return vec2(result, id);
}

#include "common/march.frag"

vec3 get_material(Hit hit) {
  float id = hit.id;
  vec3 color;
  if (id == GROUND_ID) {
    color = vec3(0.75) * mod(floor(hit.position.x) + floor(hit.position.z), 2.0) + 0.25;
  } else {
    color = vec3(0.1, 0.6, 0.1);
  }
  return color;
}


void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 1.0, 5.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  if (hit.id != -1.0) {
    color = get_material(hit);
    color += vec3(0.5, 0.7, 0.3) * dot(hit.normal, normalize(vec3(1.0)));
  }

  out_color = vec4(color, 1.0);
}