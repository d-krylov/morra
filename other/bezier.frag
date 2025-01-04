

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  vec3 color = vec3(0.0);

  uv *= 10.0;

  vec2 id = round(uv);
  uv -= id;

  color.x = mod(id.x + id.y, 4.0);

  out_color = vec4(color, 1.0);
}