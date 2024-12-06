#iChannel0 "box.frag"
#include "intersection.frag"

Material get_material(in Hit hit) {
  if (hit.id == 0) return Material(vec3(0.8, 0.8, 0.1), vec3(0.6, 0.1, 0.1), 0.1, LAMBERTIAN);
  if (hit.id == 1) return Material(vec3(0.8, 0.8, 0.1), vec3(0.6, 0.1, 0.1), 0.1, EMISSIVE);
}


void add_hit(inout Hit current_hit, in Hit new_hit) {
  if (new_hit.t > 0.0) {
    if (current_hit.t < 0.0 || new_hit.t < current_hit.t) current_hit = new_hit;
  }
}

Hit intersect_scene(in Ray ray) {
  Hit hit = Hit(vec3(0.0), vec3(0.0), -1.0, -1);

  add_hit(hit,    box_intersect(ray, translate(0.0, -0.6, 0.0) * scale(5.0, 0.1, 5.0), 0));
  add_hit(hit, sphere_intersect(ray, vec4(0.0, 0.0, 0.0, 0.5), 1));

  return hit;
}

vec3 trace_ray(Ray ray, int bounces) {
  vec3 color = vec3(1.0);
  vec3 attenuation = vec3(1.0);
  vec3 accumulator = vec3(0.0);
  for (int i = 0; i < bounces; i++) {
    Hit hit = intersect_scene(ray);
    if (hit.id != -1) {
      Material material = get_material(hit);
      if (material.type == LAMBERTIAN) {
        vec3 new_direction = normalize(hit.normal + random_unit_vector());
        ray = Ray(hit.position, new_direction);
        color *= material.albedo * attenuation;
        attenuation *= material.albedo;
      } else if (material.type == METALLIC) {
        vec3 ray_reflected = reflect(ray.direction, hit.normal);
        vec3 new_direction = normalize(ray_reflected + material.metallic * random_unit_vector());      
        if (dot(new_direction, hit.normal) > 0.0) {
          ray = Ray(hit.position, new_direction);
          color *= material.albedo * attenuation;
          attenuation *= material.albedo;
        }
      } else if (material.type == EMISSIVE) {
        vec3 new_direction = normalize(hit.normal + random_unit_vector());
        ray = Ray(hit.position + hit.normal * EPSILON, new_direction);
        accumulator += material.emissive * attenuation;
        attenuation *= material.albedo;
      }
    } else {
      color = vec3(0.0);
    }
    color += accumulator;
  }

  return color;
}

Ray get_camera_ray(vec3 origin, vec3 target, vec2 fragment_coord, vec2 resolution, vec2 random) {
  vec2 uv = (2.0 * fragment_coord.xy + random) / resolution - 1.0;
  vec3 z = normalize(target - origin);
  vec3 x = normalize(cross(z, vec3(0.0, 1.0, 0.0)));
  vec3 y = cross(x, z);
  uv.y *= resolution.y / resolution.x;
  vec3 direction = normalize(uv.x * x + uv.y * y + z);
  return Ray(origin, direction);
}

#define SAMPLES     (4)
#define MAX_BOUNCES (10)
#define MAX_WEIGHT  (150.0)

void mainImage(out vec4 out_color, in vec2 in_position) {
  seed = iTime + iResolution.x / iResolution.y + in_position.x / in_position.y;

  vec2 uv = in_position.xy / iResolution.xy;
  vec3 color = vec3(0.0);

  vec3 origin = vec3(0.0, 0.0, 2.0);
  vec3 target = vec3(0.0, 0.0, 0.0);
  vec2 random = vec2(random(), random());

  for (int i = 0; i < SAMPLES; i++) {
    Ray ray = get_camera_ray(origin, target, in_position, iResolution.xy, random);
    color += trace_ray(ray, MAX_BOUNCES);
  }

  color /= float(SAMPLES);

  vec3 previous_color = texture(iChannel0, uv).rgb;
    
  float weight = min(float(iFrame + 1), float(MAX_WEIGHT));
      
  vec3 new_color = mix(previous_color, color, 1.0 / weight);
    
  out_color = vec4(new_color, 0.0);
}


