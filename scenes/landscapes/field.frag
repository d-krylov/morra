#include "common/common.frag"
#include "common/distance.frag"
#include "common/random.frag"

#define MAP(p) map(p)

vec2 map(vec3 p) {
  float terrain = p.y;

  float n = 1.0;
  vec2 id = n * round(p.xz / n);
  p.xz -= id;

  vec2 offset = hash22(id);
  p.xz -= 0.5 * offset;
  float grass = sd_capsule(p, 0.2, 0.01, 2.0);

  vec2 result = vec2(min(terrain, grass), 0.0);

  return result;
}

#include "common/march.frag"



vec3 sky() {
  return vec3(0.0);
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;

  vec3 color = vec3(0.0);

  Ray ray; 
  ray.origin = vec3(0.0, 10.0, 0.0);
  ray.direction = normalize(vec3(uv, -1.0));

  //ray.direction.xz *= rotate(iTime);

  Hit hit = march(ray, 0.0, 5000.0, 0.5, 5000);

  vec3 light_color = vec3(0.5, 0.5, 0.1);
  vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));

  if (hit.id != -1.0) {
    color = vec3(0.1, 0.8, 0.1);
    color += light_color * dot(hit.normal, light_direction);
  }

  out_color = vec4(color, 1.0);
}