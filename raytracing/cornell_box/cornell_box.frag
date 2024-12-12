#include "common/intersection.frag"
#include "common/hash.frag"
#iChannel0 "cornell_box.frag"

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
  mat4 box_1 = translate(+0.0, 0.0, -10.0)  * rotate_x(PI / 18.0) * scale(24.0, 24.0, 0.5);
  mat4 box_2 = translate(+0.0, -15.0, -2.0) * rotate_y(PI / 3.0) * scale(10.0, 8.0, 10.0);

  Hit hit = box_intersect(ray, box_r, 0.0);
  add_hit(hit, box_intersect(ray, box_l, 1.0));
  add_hit(hit, box_intersect(ray, box_d, 2.0));
  add_hit(hit, box_intersect(ray, box_u, 3.0));
  add_hit(hit, box_intersect(ray, box_f, 4.0));

  add_hit(hit, box_intersect(ray, box_1, 5.0));
  add_hit(hit, box_intersect(ray, box_2, 8.0));
  add_hit(hit, box_intersect(ray, light, 9.0));
  add_hit(hit, sphere_intersect(ray, vec4(+10.0, -15.0, 8.0, 4.0), 6.0));
  add_hit(hit, sphere_intersect(ray, vec4(-10.0, -12.0, 8.0, 5.0), 7.0));

  return hit;
}

Material get_material(Hit hit) {
  float id = hit.id;
  if (id == 0.0) return make_material(vec3(0.5, 0.1, 0.1), 0.9, 0.3);
  if (id == 1.0) return make_material(vec3(0.1, 0.5, 0.1), 0.0, 0.0);
  if (id == 2.0) return make_material(vec3(0.3, 0.3, 0.7), 0.0, 0.0);
  if (id == 3.0) return make_material(vec3(0.7, 0.7, 0.7), 0.5, 0.4);
  if (id == 4.0) return make_material(vec3(0.7, 0.7, 0.7), 0.0, 0.0);
  if (id == 5.0) return make_material(vec3(0.6, 0.2, 0.2), 0.9, 0.1);
  if (id == 6.0) return make_emissive_material(3.0 * vec3(0.2, 0.6, 0.2));
  if (id == 7.0) return make_material(vec3(0.6, 0.2, 0.6), 0.9, 0.1);
  if (id == 8.0) return make_material(vec3(0.2, 0.2, 0.6), 0.8, 0.1);
  if (id == 9.0) return make_emissive_material(20.0 * vec3(1.0, 1.0, 1.0));
}

vec3 sky(vec3 p) {
  return texture(iChannel1, p).xyz;
}

vec3 raytrace(Ray ray, int bounces, inout uint seed) {
  vec3 result = vec3(0.0);
  vec3 throughput = vec3(1.0);
  
  for (int i = 0; i <= bounces; ++i) {
    Hit hit = map(ray);
        
    if (hit.id == -1.0) {
      result += sky(ray.direction) * throughput;
      break;
    }

    Material material = get_material(hit);
        
    float do_specular = (random(seed) < material.metallic) ? 1.0 : 0.0;

    vec3 diffuse_ray = normalize(hit.normal + random_unit_vector(seed));
    vec3 specular_ray = reflect(ray.direction, hit.normal);

    specular_ray = normalize(mix(specular_ray, diffuse_ray, material.roughness * material.roughness));

    ray.origin = hit.position + hit.normal * 0.01;
    ray.direction = mix(diffuse_ray, specular_ray, do_specular);
        
    result += material.emissive * throughput;
    throughput *= mix(material.albedo, material.specular, do_specular);     
  }
 
  return result;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 pq = in_position / iResolution.x;
  vec2 uv = 2.0 * pq - 1.0;
  vec3 color = vec3(0.0);
    
  uint seed = uint(uint(in_position.x) * uint(1973) + uint(in_position.y) * uint(9277) + uint(iFrame) * uint(26699)) | uint(1);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 30.0);
  ray.direction = normalize(vec3(uv, -0.9));
    
  int samples = 4;

  for (int i = 0; i < samples; ++i) {
    color += raytrace(ray, 8, seed) / float(samples);
  }

  vec3 current_color = texture(iChannel0, in_position / iResolution.xy).rgb;
  
  color = mix(current_color, color, 1.0f / float(iFrame + 1));

  out_color = vec4(color, 0.0);
}


