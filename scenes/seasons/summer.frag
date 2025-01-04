#include "common/common.frag"
#include "common/distance.frag"
#include "common/noise.frag"

#iChannel0 "assets/tree.jpg"
#iChannel1 "assets/organic.jpg"

#define STEP_SIZE         0.7
#define STEP_COUNT        1000
#define FAR               1000.0
#define EPSILON           0.001

#define TERRAIN_ID        0.0
#define WATER_ID          1.0
#define GRASS_ID          3.0
#define TREE_ID           4.0
#define CROWN_ID          5.0

vec2 hash2(vec2 p)  {
  vec2 k = vec2(0.3183099, 0.3678794);
  float n = dot(vec2(111.0, 113.0), p);
  return fract(n * fract(k * n));
}

vec3 schlick(float u, vec3 f0, float f90) {
  return f0 + (vec3(f90) - f0) * pow(1.0 - u, 5.0);
}

// POSTPROCESSING

vec3 ACES(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return (x * (a * x + b)) / (x * (c * x + d) + e);
}


float terrain(vec2 p) {
  float h = 10.0 * fbm(0.1 * p, 2.0, 2);
  float s = smoothstep(0.0, 30.0, abs(30.0 - p.x));
  h = mix(5.0, 0.0, 1.0 - s);
  return 0.0;
}

vec2 grass(vec3 p, float n) {
  vec2 id = round(p.xz / n);
  vec2 cs = normalize(vec2(0.98, 0.02));
  vec2 offset = hash2(id) - 0.5;
  p.xz -= n * id;
  offset *= 0.25 * n;
  float size = 2.0 * hash(id);
  float g = sd_cone(p - vec3(offset.x, size, offset.y), cs, size);
  return vec2(g, GRASS_ID);
}

vec2 tree(vec3 p, float r, float h, float n, vec2 id) {
  float s = sd_capsule(p, r, h);
  float d = hash(id);
  for (float i = 0.0; i < 3.0; i++) {
    float f = repeat_angle(p.xz, n);
    r = r / sqrt(n);
    p.y -= h;
    p.xz *= rotate(f + PI / n);
    float a = 0.7 + 0.2 * i + 0.01 * p.y + 0.2 * d;
    p.xy *= rotate(a);
    float b = sd_capsule(p.yxz, r, h);
    s = smin(s, b, 0.5);
    p = p.yxz;
    n++;
  }
  p.y -= h;
  float sphere = length(p) - 0.5 - 2.5 * fbm(p, 1.5, 2) - d;
  vec2 crown = vec2(sphere, CROWN_ID);
  vec2 tree = vec2(s, TREE_ID);
  tree = MIN(tree, crown);
  return tree;
}

vec2 trees(vec3 p, float n) {
  vec2 id = round(p.xz / n);
  vec2 offset = hash2(id) - 0.5;
  offset *= 0.5 * n;
  p.xz -= n * id;
  float h = 7.0 + 4.0 * hash(id);
  vec2 tree = tree(p - vec3(offset.x, 0.0, offset.y), 1.5, h, 3.0, id);
  return tree;
}

vec2 map(vec3 p) {
  //p.xz *= rotate(iTime);

  float h = terrain(p.xz);

  vec2 ret = vec2(p.y - h, TERRAIN_ID);

  //vec2 grass = grass(p - vec3(0.0, h, 0.0), 0.3);
  //ret = MIN(ret, grass);

  if (h < 3.0) {
    vec2 water = vec2(p.y - 3.0, WATER_ID);
    //ret = MIN(ret, water);
  }

  vec2 trees = trees(p - vec3(0.0, h, 0.0), 60.0);

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
      hit.normal = get_normal(hit.position);
      break;
    }
    t += STEP_SIZE * d.x;
    if (t > FAR) { break; }
  }
  return hit;
}

vec3 get_material(Hit hit) {
  vec3 albedo;
  if (hit.id == TERRAIN_ID) {
    albedo = vec3(0.39, 0.26, 0.13);
  } else if (hit.id == GRASS_ID) {
    albedo = vec3(0.1, 0.4, 0.2);
  } else if (hit.id == CROWN_ID) {
    albedo = vec3(0.1, 0.5, 0.1);
  } else if (hit.id == TREE_ID) {
    albedo = vec3(0.6, 0.4, 0.4);
  }
  return albedo;
}

vec3 sky(vec2 uv) {
  return vec3(0.1, 0.3 + uv.y, 0.9);
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

float ambient_occlusion(vec3 p, vec3 n) {
  float aoStep = 0.1;
  float ao = 0.0;
  for (float i = 1.0; i < 8.0; i += 1.0) {
    float d = aoStep * i;
    ao += max(0.0, (d - map(p + n * d).x) / d);
  }
  return clamp(1.0 - ao * 0.2, 0.0, 1.0);
}

vec3 get_light(Ray ray, Hit hit) {
  return vec3(0.0);
}


void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  vec3 position = vec3(20.0, 0.0, 90.0);
  position.y = terrain(position.xz) + 15.0;

  Ray ray;
  ray.origin = position;
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0);

  vec3 light_direction = normalize(vec3(0.2, 1.0, 0.2));

  if (hit.id != -1.0) {
    color = 0.5 * get_material(hit);
    Ray light_shadow = Ray(hit.position, light_direction);
    color += vec3(0.2, 0.2, 0.2) * soft_shadow(light_shadow, 0.1, 32) * dot(hit.normal, light_direction);
    if (hit.id == WATER_ID) {
      Ray reflected_ray;
      reflected_ray.origin = hit.position;
      reflected_ray.direction = reflect(ray.direction, hit.normal);
      Hit reflected_hit = trace(reflected_ray, 0.1);
      if (reflected_hit.id != -1.0) {
        float NdotV = dot(hit.normal, -ray.direction);
        vec3 s = schlick(NdotV, vec3(0.5), 0.3);
        vec3 reflected_color = get_material(reflected_hit);
        color = mix(reflected_color, vec3(0.1, 0.1, 0.4), 0.9);
      } else {
        vec3 sky = sky(hit.position.xy);
        color = mix(color, sky, 0.8);
      }
    }
  } else {
    color = sky(uv);
  }

  color = ACES(color);
  color = pow(color, vec3(0.4545)); 

  out_color = vec4(color, 1.0);
}