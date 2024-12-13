#iChannel0 "cornell_christmas.frag"
#include "common/light.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec3 color = texture(iChannel0, in_position / iResolution.xy).rgb;

  color = ACES(color);

    
  out_color = vec4(color, 1.0f);
}