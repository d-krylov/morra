#define pi 3.14

vec2 Rot2D (vec2 q, float a)
{
  vec2 cs;
  cs = sin (a + vec2 (0.5 * pi, 0.));
  return vec2 (dot (q, vec2 (cs.x, - cs.y)), dot (q.yx, cs));
}

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  
  uv = Rot2D(uv, iTime);
  
  float s = length(uv - vec2(0.5, 0.0)) - 0.05;

  float c = step(s, 0.0);

  out_color = vec4(c, 0.0, 0.0, 1.0);
}