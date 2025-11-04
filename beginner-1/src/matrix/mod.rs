pub mod generic;
pub mod mat2;
pub mod mat3;
pub mod mat4;
pub mod ops;

pub use generic::Matrix;
pub use mat2::Mat2;
pub use mat3::Mat3;
pub use mat4::Mat4;

pub use ops::{MatrixOps, TransformOps};
