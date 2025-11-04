use beginner_1::{Mat4, Vec2, Vec3, lerp};

fn main() {
    let v2 = lerp(Vec2 { x: 0.0, y: 0.0 }, Vec2 { x: 2.0, y: 1.0 }, 0.2);
    let v3 = lerp(
        Vec3 {
            x: 255.0,
            y: 255.0,
            z: 255.0,
        },
        Vec3 {
            x: 1.0,
            y: 1.0,
            z: 1.0,
        },
        0.1,
    );
    let vec3 = Vec3 {
        x: 255.0,
        y: 255.0,
        z: 255.0,
    };
    let m4: Mat4<f64> = Mat4::identity() * 3.0;

    println!("{:?}", v2); // Vec2 { x: 0.5, y: 0.5 }
    println!("{:?}", v3); // Vec3 { x: 0.5, y: 0.5, z: 0.5 }
    print!("{:?}", m4);
}
