#include "common/common.frag"
#include "common/distance.frag"

#define STEP_SIZE     0.5
#define STEP_COUNT    2000
#define FAR           5000.0
#define EPSILON       0.001

vec2 map(vec3 p) {
  p.xz *= rotate(iTime);
  float r = 0.5;
  float h = 6.0;
  float tree = sd_capsule(p, r, h);

  float n = 2.0;
  for (int i = 0; i < 20; i++) {
    p.y -= h;
    float xz = repeat_angle(p.xz, n);
    p.xz *= rotate(xz + PI / n);
    p.xy *= rotate(PI / 4.0);
    p = p.yxz;
    h /= 1.5; // sqrt(3.0);
    r /= 1.5;
    tree = min(tree, sd_capsule(p, r, h));
  }

  return vec2(tree, 0.0);
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
      hit.normal = get_normal(p);
      break;
    }
    t += STEP_SIZE * d.x;
    if (t > FAR) { break; }
  }
  return hit;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;  
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 10.0, 15.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0);

  vec3 LD = normalize(vec3(1.0, 1.0, 1.0));
  if (hit.id != -1.0) {
    color = vec3(0.5, 0.5, 0.5);
    float cos_theta = dot(hit.normal, LD);
    color += cos_theta * vec3(1.0, 1.0, 0.2);
  }

 
  out_color = vec4(color, 1.0);
}