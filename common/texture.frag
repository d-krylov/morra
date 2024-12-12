#ifndef TEXTURE_FRAG
#define TEXTURE_FRAG

vec2 get_sphere_uv(vec3 p) {
  float pi = 3.1415926535897932;
  float uu = 0.5 + 0.5 * atan(p.z, p.x) / pi;
  float vv = 0.5 + asin(p.y) / pi;
  return vec2(uu, vv);
}

// https://iquilezles.org/articles/biplanar/

vec4 get_texture(sampler2D s, vec3 p, vec3 n, float k) {
  vec4 x = texture(s, p.yz);
  vec4 y = texture(s, p.zx);
  vec4 z = texture(s, p.xy);  
  vec3 w = pow(abs(n), vec3(k));  
  return (x * w.x + y * w.y + z * w.z) / (w.x + w.y + w.z);
}

#endif // TEXTURE_FRAG