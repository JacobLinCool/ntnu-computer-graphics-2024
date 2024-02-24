attribute vec4 a_Position;
void main() {
    //gl_Position is key variable in GLSL (pass vertex location to fragment shader)
    gl_Position = a_Position;
}
