#include "common/common.frag"
#include "common/distance.frag"
#include "common/noise.frag"

#define STEP_SIZE  0.5
#define STEP_COUNT 5000
#define FAR        500.0
#define EPSILON    0.001


vec2 map(vec3 p) {
  //p.xz *= rotate(iTime);

  vec2 s = vec2(sqrt(3.0), 1.0);
  vec3 q = p; vec2 id = round(q.xz / s);
  q.xz -= s * id;
  float t1 = sd_hex_prism(q.xzy, 0.45, 0.2);
  p.xz -= vec2(sqrt(3.0) / 2.0, 0.5);
  id = round(p.xz / s);
  p.xz -= s * id;
  float t2 = sd_hex_prism(p.xzy, 0.44, 0.2);
  vec2 ret = vec2(min(t1, t2), 0.0);
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

float get_shadow(Ray ray) {
  float ret = 0.0;
  float tmax = 12.0;  
  float t = 0.001;
  for (int i = 0; i < 80; i++) {
    vec3 p = ray.origin + ray.direction * t;
    vec2 h = map(p);
    if (h.x < EPSILON || t > tmax) break;
    t += h.x;
  }
  return (t < tmax) ? ret : 1.0;
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

vec3 get_color(Hit hit, Ray ray, vec3 light) {
  vec3 ambient;
  if (hit.id == 0.0) ambient = vec3(0.5, 0.4, 0.8);
  if (hit.id == 1.0) ambient = vec3(0.8, 0.3, 0.3);
  float diffuse = max(0.0, dot(light, hit.normal));
  vec3 H = normalize(light - ray.direction);
  float specular = pow(clamp(dot(hit.normal, H), 0.0, 1.0), 64.0);
  return ambient + 0.5 * diffuse + 0.1 * specular;
}


void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;

  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 2.0, 4.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0); 

  vec3 light = normalize(vec3(1.0));

  if (hit.id != -1.0) {
    color = get_color(hit, ray, light);
  }


  out_color = vec4(color, 1.0);
}