#include "common/common.frag"
#include "common/distance.frag"

#iChannel0 "assets/tree.jpg"
#iChannel1 "assets/organic.jpg"
#iChannel2 "assets/pebbles.png"

#define STEP_SIZE    0.5
#define STEP_COUNT   1000
#define FAR          1000.0
#define EPSILON      0.001

#define HEIGHT       50.0

#define TERRAIN_ID   0.0
#define TREE_ID      1.0
#define BRANCH_ID    2.0
#define MOSS_ID      3.0
#define HUT_ID       4.0

vec2 terrain(vec3 p, out float h) {
  vec2 ret = vec2(p.y, TERRAIN_ID);
  return ret;
}



vec2 hut(vec3 p, float size, float leg) {
  float base = sd_capsule(p, 1.5, leg);
  p.y -= leg;
  vec3 q = p; q.x = abs(q.x);
  q.y -= clamp(round(q.y), 0.0, size);
  float s1 = sd_cylinder(q.yzx - vec3(0.0, 0.0, size), 0.5, size + 1.0);
  q = p; q.y += 0.5; q.z = abs(q.z);
  q.y -= clamp(round(q.y), 0.0, size);
  float s2 = sd_cylinder(q.yxz - vec3(0.0, 0.0, size), 0.5, size + 1.0);
  float s3 = sd_box(p + vec3(0.0, 0.5, 0.0), size, 0.5, size + 0.0);
  float roof = sd_prism(p - vec3(0.0, 2.0 * size - 1.0, 0.0), size + 3.0, size + 1.0);
  vec2 ret = vec2(min(base, min(roof, min(s3, min(s1, s2)))), HUT_ID);
  return ret;
}

vec2 map(Ray ray, vec3 p) {
  float h;
  vec2 ret = terrain(p, h);

  float f = sd_capsule(p, 1.0, 45.0);



  return ret;
}

vec3 get_normal(Ray ray, vec3 p) {
  const float h = 0.01; 
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * map(ray, p + k.xyy * h).x + 
                   k.yyx * map(ray, p + k.yyx * h).x + 
                   k.yxy * map(ray, p + k.yxy * h).x + 
                   k.xxx * map(ray, p + k.xxx * h).x);
}

Hit trace(Ray ray, float near) {
  Hit hit;
  hit.id = -1.0;
  float t = near;
  for (int i = 0; i < STEP_COUNT; i++) {
    vec3 p = ray.origin + ray.direction * t;
    vec2 d = map(ray, p);
    if (d.x < EPSILON) {
      hit.id = d.y;
      hit.position = p; 
      hit.t = t;
      hit.normal = get_normal(ray, hit.position);
      break;
    }
    t += STEP_SIZE * d.x;
    if (t > FAR) { break; }
  }
  return hit;
}

vec3 get_material(Hit hit) {
  vec3 color;
  vec3 tree = texture(iChannel0, 0.1 * hit.position.xz).rgb;
  vec3 organic = texture(iChannel1, 0.1 * hit.position.xz).rgb;
  if (hit.id == TERRAIN_ID) {
    color = mix(tree, organic, 0.8);
    color *= vec3(0.08, 0.07, 0.05);
  } else if (hit.id == MOSS_ID) {
    color = vec3(0.0, 0.1, 0.0);
  } else if (hit.id == TREE_ID) {
    color = vec3(0.5);
  } else if (hit.id == HUT_ID) {
    color = vec3(0.0, 0.1, 0.0);
  }
  return color;
}

float soft_shadow(in Ray ray, in float near, int steps) {
  float ret = 1.0;
  float t = near;
  for (int i = 0; i < steps && t < FAR; i++) {
	  vec3 p = ray.origin + ray.direction * t;
    float d = map(ray, p).x;
    ret = min(ret, 10.0 * d / t);
    if (ret < EPSILON) break;
    t += d;
  }
  ret = clamp(ret, 0.0, 1.0);
  return ret * ret * (3.0 - 2.0 * ret);
}

vec3 sky(vec2 uv) {
  return vec3(0.0, 0.0, 0.1 + 0.2 * uv.y);
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 5.0, 40.0);
  ray.direction = normalize(vec3(uv, -1.0));

  //ray.direction.xz *= rotate(iTime);


  Hit hit = trace(ray, 0.0);

  vec3 light_direction = normalize(vec3(1.0, 10.0, 1.0));

  if (hit.id != -1.0) {
    color = get_material(hit);
    vec3 diffuse = vec3(0.1, 0.5, 0.5) * dot(hit.normal, light_direction);
    Ray shadow_ray = Ray(hit.position, light_direction);
    color += diffuse * soft_shadow(shadow_ray, 0.1, 24);
    color = mix(color, vec3(0.20, 0.2, 0.2), 1.0 - exp(-0.000008 * hit.t * hit.t));
  } else {
    color = sky(uv);
  }


  out_color = vec4(color, 1.0);
}