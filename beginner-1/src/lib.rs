pub mod matrix;
pub mod scalar;
pub mod transform;
pub mod utils;
pub mod vector;

// re-export
pub use matrix::{Mat2, Mat3, Mat4};
pub use scalar::Scalar;
pub use utils::{Lerp, lerp};
pub use vector::{Vec2, Vec3, Vec4};
