#include "common/intersection.frag"
#include "common/random.frag"
#include "common/material.frag"
#include "common/light.frag"
#iChannel0 "cornell_christmas.frag"

#iChannel1 "assets/forest/forest_{}.png"
#iChannel1::Type "CubeMap"

void add_hit(inout Hit current, in Hit new) {
  if ((new.t > 0.01) && (current.t < 0.0 || new.t < current.t)) current = new;
}

Hit map(Ray ray) {
  vec3 size = vec3(20.0, 20.0, 20.0);
  vec3 sc = 2.0 * size;

  mat4 box_r = translate(+size.x, +0.0, +0.0) * scale(0.2, sc.y, sc.z);
  mat4 box_l = translate(-size.x, +0.0, +0.0) * scale(0.2, sc.y, sc.z);
  mat4 box_u = translate(+0.0, +size.y, +0.0) * scale(sc.x, 0.2, sc.z);
  mat4 box_d = translate(+0.0, -size.y, +0.0) * scale(sc.x, 0.2, sc.z);
  mat4 box_f = translate(+0.0, +0.0, -size.z) * scale(sc.x, sc.y, 0.2);
  mat4 light = translate(+0.0, +size.y, +0.0) * scale(0.8 * size.x, 0.4, 0.8 * size.z);

  mat4 box_center = translate(+0.0, +0.0, 0.0) * rotate_y(PI / 4.0) * scale(18.0, 18.0, 18.0);

  Hit hit = box_intersect(ray, box_r, 0.0);
  add_hit(hit, box_intersect(ray, box_l, 1.0));
  add_hit(hit, box_intersect(ray, box_d, 2.0));
  add_hit(hit, box_intersect(ray, box_u, 3.0));
  add_hit(hit, box_intersect(ray, box_f, 4.0));
  add_hit(hit, box_intersect(ray, light, 9.0));

  //add_hit(hit, box_intersect(ray, box_center, 7.0));
  add_hit(hit, sphere_intersect(ray, vec4(0.0, 0.0, 0.0, 9.0), 7.0));

  return hit;
}

Material get_material(Hit hit) {
  float id = hit.id;
  if (id == 0.0) return make_material(vec3(0.5, 0.1, 0.1), 1.0, 0.3);
  if (id == 1.0) return make_material(vec3(0.1, 0.5, 0.1), 0.0, 0.0);
  if (id == 2.0) return make_material(vec3(0.3, 0.3, 0.7), 0.0, 0.0);
  if (id == 3.0) return make_material(vec3(0.2, 0.2, 0.7), 0.0, 0.0);
  if (id == 4.0) return make_material(vec3(0.1, 0.5, 0.5), 0.0, 0.0);
  if (id == 5.0) return make_material(vec3(0.6, 0.2, 0.2), 0.9, 0.1);
  if (id == 6.0) return make_emissive_material(1.0 * vec3(0.2, 0.6, 0.2));
  if (id == 7.0) return make_material(vec3(0.6, 0.2, 0.6), 0.1, 0.0, 0.9, 0.0, 5.9);
  if (id == 8.0) return make_material(vec3(0.2, 0.2, 0.6), 0.8, 0.1);
  if (id == 9.0) return make_emissive_material(20.0 * vec3(1.0, 1.0, 1.0));
}

vec3 sky(vec3 p) {
  return texture(iChannel1, p).xyz;
}

vec3 raytrace(Ray ray, int bounces, inout uint seed) {
  vec3 result = vec3(0.0), throughput = vec3(1.0);

  for (int i = 0; i <= bounces; ++i) {
    float ray_probability = 1.0; 
    float do_reflection = 0.0;
    float do_refraction = 0.0;

    Hit hit = map(ray);
        
    if (hit.id == -1.0) {
      result += sky(ray.direction) * throughput;
      break;
    }

    Material material = get_material(hit);
    float reflect_chance = material.reflection.chance;
    float refract_chance = material.refraction.chance;

    if (reflect_chance > 0.0) {
      #if 1
      reflect_chance = fresnel_reflect_amount(
        hit.inside ? material.ior : 1.0,
       !hit.inside ? material.ior : 1.0,
        hit.normal, ray.direction, material.reflection.chance, 1.0);
            
      float chance_multiplier = (1.0 - reflect_chance) / (1.0 - material.reflection.chance);
      refract_chance *= chance_multiplier;
      #endif
    }

    float dice = random(seed);

    if (reflect_chance > 0.0 && dice < reflect_chance) {
      do_reflection = 1.0;
      ray_probability = reflect_chance;
    } else if (refract_chance > 0.0 && dice < reflect_chance + refract_chance) {
      do_refraction = 1.0;
      ray_probability = refract_chance;
    } else {
      ray_probability = 1.0 - (reflect_chance + refract_chance);
    }

    ray_probability = max(ray_probability, 0.001);    
    ray.origin = hit.position  + (1.0 - 2.0 * do_refraction) * hit.normal * 0.01;

    vec3 diffuse_rd = normalize(hit.normal + random_unit_vector(seed));    
    vec3 reflect_rd = reflect(ray.direction, hit.normal);
    vec3 refract_rd = refract(ray.direction, hit.normal, hit.inside ? material.ior : 1.0 / material.ior);

    reflect_rd = normalize(mix(reflect_rd, diffuse_rd, material.reflection.roughness * material.reflection.roughness));
    refract_rd = normalize(mix(refract_rd, normalize(-hit.normal + random_unit_vector(seed)), material.refraction.roughness * material.refraction.roughness));
                
    ray.direction = mix(diffuse_rd, reflect_rd, do_reflection);
    ray.direction = mix(ray.direction, refract_rd, do_refraction);

    result += material.emissive * throughput;

    if (do_refraction == 0.0) {
      throughput *= mix(material.albedo, material.reflection.color, do_reflection);
    }

    throughput /= ray_probability;
  }
 
  return result;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;

  vec3 color = vec3(0.0);
    
  uint seed = uint(uint(in_position.x) * uint(1973) + uint(in_position.y) * uint(9277) + uint(iFrame) * uint(26699)) | uint(1);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 50.0);
  ray.direction = normalize(vec3(uv, -0.9));
    
  int samples = 8;

  for (int i = 0; i < samples; ++i) {
    color += raytrace(ray, 8, seed) / float(samples);
  }

  vec3 current_color = texture(iChannel0, in_position / iResolution.xy).rgb;
  
  color = mix(current_color, color, 1.0f / float(iFrame + 1));

  out_color = vec4(color, 0.0);
}

