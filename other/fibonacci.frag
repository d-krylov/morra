#include "common/common.frag"
#include "common/intersection.frag"

#define STEP_SIZE    0.1
#define STEP_COUNT   1000
#define FAR          50.0
#define EPSILON      0.001

vec4 map(vec3 p) {
  p.xz *= rotate(iTime);
  float s1 = length(p) - 1.0;
  float s2 = length(p) - 0.9;
  float sphere = max(-s2, s1);
  for (float i = 0.0; i < 13.0; i++) {
    vec3 position = fibonacci_lattice(i, 13.0);
    float s = length(p - position) - 0.15;
    vec2 d = sphere_intersect(Ray(p, normalize(p)), vec4(position, 0.1));
    if (d != vec2(-1.0) && s < s1) {
      sun.x += 1.0;
      sun.y = min(sun.y, s);
    } 
    sphere = max(-s, sphere); 
  }
  return vec4(sphere, 0.0, sun);
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
    vec4 d = map(p);
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

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 10.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0, sun);

  if (hit.id != -1.0) {
    color = vec3(0.3, 0.2, 0.6);
    color += vec3(0.4, 0.7, 0.5) * dot(normalize(vec3(1.0)), hit.normal);
  } 

  color.x += sun.x / (0.8 * sun.y * sun.y + 0.5 * sun.y);

  out_color = vec4(color, 1.0);
}