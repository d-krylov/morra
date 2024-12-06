#include "common/common.frag"
#include "common/noise.frag"

#define STEP_SIZE  0.5
#define STEP_COUNT 2000
#define FAR        1600.0
#define EPSILON    0.001

#define CLOUD_ID   0.0

vec2 map(vec3 p) {
  vec2 ret = vec2(p.y, 0.0);

  return ret;
}


vec4 sky_map(vec3 p) {  
  p.z -= iTime;
  vec4 r = 20.0 * fbm_derivatives(0.15 * p, 1.3, 4);

  float d = abs(p.y - 20.0) - 8.0 + r.x;

  vec3 nd = vec3(0.0, sign(p.y - 20.0), 0.0);

  vec3 n = nd + 0.15 * r.yzw;
  n = normalize(n);

  return vec4(d, n);
}

vec3 get_sky_normal(vec3 p) {
  const float h = 0.001; 
  vec3  normal;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * sky_map(p + k.xyy * h).x + 
                   k.yyx * sky_map(p + k.yyx * h).x + 
                   k.yxy * sky_map(p + k.yxy * h).x + 
                   k.xxx * sky_map(p + k.xxx * h).x);
}

vec3 get_normal(vec3 p) {
  const float h = 0.001; 
  vec3  normal;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * map(p + k.xyy * h).x + 
                   k.yyx * map(p + k.yyx * h).x + 
                   k.yxy * map(p + k.yxy * h).x + 
                   k.xxx * map(p + k.xxx * h).x);
}

Hit trace_sky(Ray ray, float steps, float near, float far) {
  Hit hit;
  hit.id = -1.0;
  float t = (near - ray.origin.y) / ray.direction.y;
  float s = (far - near) / steps;
  for (float i = 0.0; i < steps; i++) {
    vec3 p = ray.origin + ray.direction * t;
    vec4 d = sky_map(p);
    if (d.x < EPSILON) {
      hit.id = CLOUD_ID;
      hit.position = p;
      hit.normal = d.yzw;
      hit.normal = get_sky_normal(p);
      break;
    }
    t += s * d.x;
  }
  return hit;
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
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;

  vec3 color = vec3(0.0);

  Ray ray; 
  ray.origin = vec3(0.0, 1.0, 20.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0);

  vec3 LD = normalize(vec3(1.0, 1.0, 1.0));

  if (hit.id != -1.0) {
    color = vec3(0.2, 0.4, 0.6);
    float cos_theta = dot(hit.normal, LD);
    color += vec3(0.5, 0.5, 0.4) * cos_theta;
  }

  Hit sky = trace_sky(ray, 100.0, 10.0, 50.0);
  
  if (sky.id != -1.0) {
    color = vec3(0.2, 0.4, 0.6);
    float cos_theta = dot(sky.normal, LD);
    color += vec3(0.5, 0.5, 0.4) * cos_theta;
  }

  out_color = vec4(color, 1.0);
}