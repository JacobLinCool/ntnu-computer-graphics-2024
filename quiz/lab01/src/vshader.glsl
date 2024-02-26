uniform vec4 u_Position;
void main() {
    gl_Position = u_Position;
    gl_PointSize = 10.0;
}
