#include "common/common.frag"
#include "common/distance.frag"
#include "common/noise.frag"

#iChannel0 "assets/tree.jpg"

#define STEP_SIZE  0.8
#define STEP_COUNT 1500
#define FAR        1600.0
#define EPSILON    0.001

#define TERRAIN_ID       0.0
#define ROAD_ID          1.0
#define FOREST_TREE_ID   2.0
#define TREE_BODY_ID     3.0
#define TREE_ID          4.0

vec2 hash2(vec2 p)  {
  vec2 k = vec2(0.3183099, 0.3678794);
  float n = dot(vec2(111.0, 113.0), p);
  return fract(n * fract(k * n));
}

float get_height(vec2 p) {
  float h = 4.0 * fbm(0.1 * p, 1.0, 2); 
  float center = smoothstep(200.0, 0.0, length(p));
  float h1 = smoothstep(350.0, 0.0, length(p - vec2(+300.0, -300.0)));
  float h2 = smoothstep(650.0, 0.0, length(p - vec2(-700.0, -600.0)));
  float h3 = smoothstep(1200.0, 0.0, length(p - vec2(+400.0, -1500.0)));
  float road = smoothstep(-330.0, -280.0, p.y);
  road *= (1.0 - road);
  h += 120.0 * h1;
  h += 250.0 * h2;
  h += 600.0 * h3;
  h += 40.0 * center;
  h -= 15.0 * road;
  return h;
}

vec2 terrain(vec3 p) {
  float h = get_height(p.xz);
  float road = smoothstep(-330.0, -280.0, p.z);
  road *= (1.0 - road);
  return vec2(p.y - h, (road == 0.0) ? TERRAIN_ID : ROAD_ID);
}

vec3 apply_fog(vec3 color, float t, vec3 ray_direction, vec3 sun_direction) {
  float fog_amount = 1.0 - exp(-t * 0.0003);
  float sun_amount = max(dot(ray_direction, sun_direction), 0.0);
  vec3 fog_color = vec3(0.5, 0.6, 0.7);
  vec3 sun_color = vec3(1.0, 0.9, 0.7);
  vec3 ret_color = mix(fog_color, sun_color, pow(sun_amount, 8.0));
  return mix(color, ret_color, fog_amount);
}

vec2 forest(vec3 p, float n) {
  vec2 id = round(p.xz / n);
  vec2 offset = hash2(id) - 0.5;
  offset *= 0.25 * n;
  p.xz -= clamp(n * id, vec2(-800.0, -1500.0), vec2(800.0, -600.0));
  p.xz += offset;
  float h = 10.0 + 45.0 * hash(id);
  float r = 10.0 + 2.0 * fbm(0.5 * p, 1.3, 2);
  vec2 body = vec2(sd_capsule(p, 2.5, h), TREE_BODY_ID);
  vec2 tree = vec2(length(p - vec3(0.0, h + r, 0.0)) - r, FOREST_TREE_ID);
  tree = MIN(tree, body);
  return tree;
}

vec2 tree(vec3 p, float r, float h, float n) {
  vec2 tree = vec2(sd_capsule(p, r, h), TREE_BODY_ID);
  for (float i = 0.0; i < 4.0; i++) {
    float f = repeat_angle(p.xz, n);
    r = r / sqrt(n);
    p.y -= (0.5 + 0.1 * i) * h;
    p.zx = rotate(p.zx, f + PI / n);
    float angle = -1.0 - 0.1 * i - 0.002 * h + 0.01 * p.y;
    p.xy = rotate(p.xy, angle);
    float b = sd_capsule(p.yxz, r, h);
    tree.x = smin(tree.x, b, 0.2);
    p = p.yxz;
    h = h - 3.0;
    n++;
  }
  p.y -= h;
  float sphere = length(p) - 2.0;
  vec2 crown = vec2(sphere, TREE_ID);
  tree = MIN(tree, crown);
  return tree;
}

vec2 trees(vec3 p, float n) {
  float h = get_height(p.xz);
  vec2 id = round(p.xz / n);
  p.xz -= clamp(n * id, vec2(-400.0, -450.0), vec2(400.0, -250.0));
  vec2 tree = tree(p - vec3(0.0, h, 0.0), 3.0, 25.0, 3.0);
  return tree;
}

vec2 map(vec3 p) {
  vec2 terrain = terrain(p);
  float h = p.y - terrain.x;
  vec2 forest = forest(p - vec3(0.0, h, 0.0), 30.0);
  vec2 ret = MIN(terrain, forest);
  vec2 trees = trees(p, 200.0);

  ret = MIN(ret, trees);
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
      hit.t = t;
      hit.normal = get_normal(hit.position);
      break;
    }
    t += STEP_SIZE * d.x;
    if (t > FAR) { break; }
  }
  return hit;
}

vec3 sky(vec2 uv) {
  float f = fbm(5.0 * uv, 3.0, 4);
  float s = smoothstep(0.8, 0.3, uv.y);
  vec3 color = vec3(0.53, 0.81, 0.92);
  color += s * f;
  return color;
}


vec3 get_material(Hit hit) {
  vec3 color;
  if (hit.id == TERRAIN_ID) {
    vec3 p = hit.position;
    vec3 red = vec3(0.95, 0.31, 0.0);
    vec3 green = vec3(0.21, 0.41, 0.18);
    float f = fbm(0.015 * hit.position.xz, 1.0, 4);
    color = mix(red, green, f);
    color *= 1.2 * texture(iChannel0, hit.position.xz).rgb;
  } else if (hit.id == ROAD_ID) {
    color = vec3(0.3, 0.3, 0.3);
  } else if (hit.id == FOREST_TREE_ID) {
    vec3 red = vec3(0.95, 0.1, 0.0);
    vec3 green = vec3(0.21, 0.71, 0.18);
    vec3 yellow = vec3(0.7, 0.7, 0.1);
    vec2 id = round(hit.position.xz / 30.0);
    float d = hash(id);
    color = mix(yellow, red, step(0.35, d));
    color = mix(color, green, step(0.65, d));
  } else if (hit.id == TREE_BODY_ID) {
    color = vec3(0.2, 0.2, 0.1);
  } else if (hit.id == TREE_ID) {
    vec3 green = vec3(0.21, 0.71, 0.18);
    vec3 yellow = vec3(0.7, 0.7, 0.1);
    color = mix(yellow, green, fbm(0.05 * hit.position, 1.5, 2));
  }

  return color;
}

float soft_shadow(in Ray ray, in float near, int steps) {
  float ret = 1.0;
  float t = near;
  for (int i = 0; i < steps && t < FAR; i++) {
	  vec3 p = ray.origin + ray.direction * t;
    float d = map(p).x;
    ret = min(ret, 10.0 * d / t);
    if (ret < EPSILON) break;
    t += d;
  }
  ret = clamp(ret, 0.0, 1.0);
  return ret * ret * (3.0 - 2.0 * ret);
}

vec3 get_light(vec3 ambient, Ray ray, Hit hit) {
  vec3 LD = normalize(vec3(1.0, 2.0, 1.0));
  vec3 LC = vec3(0.9, 0.5, 0.1);
  float cos_theta = dot(LD, hit.normal);
  vec3 diffuse = ambient * cos_theta;
  Ray shadow_ray = Ray(hit.position, LD);
  vec3 color = LC * diffuse * soft_shadow(shadow_ray, 0.1, 24);
  color = apply_fog(color, hit.t, ray.direction, LD);

  float sun = clamp(dot(LD, -ray.direction), 0.0, 1.0);
  color += 0.25 * LC * pow(sun, 4.0);
  return color;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 q = in_position.xy / iResolution.xy;
  vec2 uv = -1.0 + 2.0 * q;

  vec3 color = vec3(0.0);

  Ray ray; 
  ray.origin = vec3(0.0, 70.0, 0.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0);

  if (hit.id != -1.0) {
    vec3 ambient = get_material(hit);
    color = get_light(ambient, ray, hit);
  } else {
    color = sky(uv);
  }

	color = pow(clamp(color, 0.0, 1.0), vec3(0.45));
  color = color * 0.5 + 0.5 * color * color * (3.0 - 2.0 * color); 	
	color *= 0.5 + 0.5 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.5);

  out_color = vec4(color, 1.0);
}