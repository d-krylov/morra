float sd_segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float smin(float a, float b, float k) {
  k *= 2.0;
  float x = b - a;
  return 0.5 * (a + b - sqrt(x * x + k * k));
}

int get_index(int b3, int b2, int b1, int b0) {
  return b3 * 8 + b2 * 4 + b1 * 2 + b0;
}

float get_color(vec2 uv) {
  vec2 sc  = vec2(sin(iTime), cos(iTime));
  vec2 xy1 = 10.0 * sc + vec2(+30.0, 0.0);
  vec2 xy2 = -20.0 * sc + vec2(-30.0, 0.0);
  vec2 xy3 = -40.0 * sc + vec2(-0.0, 20.0);
  float r1 = length(uv - xy1) - 28.0;
  float r2 = length(uv - xy2) - 28.0;
  float r3 = length(uv - xy3) - 20.0;
  return step(smin(r1, smin(r2, r3, 2.0), 3.0), 0.0);
}

float get_segment(vec2 uv, int id) {
  vec2 p = vec2(-0.5, 0.0);
  switch(id) {
    case 1: case 14: return sd_segment(uv,  p.xy,  p.yx);
    case 2: case 13: return sd_segment(uv,  p.yx, -p.xy);
    case 3: case 12: return sd_segment(uv,  p.xy, -p.xy);
    case 4: case 11: return sd_segment(uv, -p.yx, -p.xy);
    case 6: case 9:  return sd_segment(uv, -p.yx,  p.yx);
    case 7: case 8:  return sd_segment(uv,  p.xy, -p.yx);
    case 5:      return min(sd_segment(uv, -p.yx, -p.xy), sd_segment(uv, p.xy,  p.yx));
    case 10:     return min(sd_segment(uv,  p.yx, -p.xy), sd_segment(uv, p.xy, -p.yx));
  }
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;

  uv *= 64.0;
  vec3 color = vec3(0.0);

  vec2 id = round(uv);
  vec2 pq = uv - id;

  ivec2 v00 = ivec2(round(uv));
  ivec2 v10 = v00 + ivec2(1, 0);
  ivec2 v01 = v00 + ivec2(0, 1);
  ivec2 v11 = v00 + ivec2(1, 1);

  int b0 = int(get_color(vec2(v00)));
  int b1 = int(get_color(vec2(v10)));
  int b2 = int(get_color(vec2(v11)));
  int b3 = int(get_color(vec2(v01)));
  
  int index = get_index(b3, b2, b1, b0);

  if (index != 0 && index != 15) {
    float segment = get_segment(pq, index);
    color.y = step(segment, 0.2);
  }

  color.x = get_color(uv);

  out_color = vec4(color, 1.0);
}